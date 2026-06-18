"use server";

import { revalidatePath } from "next/cache";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai";
import { extractDocFields } from "@/lib/doc-extract";


// Best-effort document type from the filename when the user didn't pick one.
const TYPE_HINTS: [RegExp, string][] = [
  [/gas/i, "gas_safety"], [/eicr|electric/i, "eicr"], [/\bpat\b/i, "pat"], [/epc|energy/i, "epc"],
  [/fire\s*risk/i, "fire_risk_assessment"], [/smoke/i, "smoke_alarm_cert"], [/fire/i, "fire_safety_cert"],
  [/legionella/i, "legionella"], [/deposit.*prescribed|prescribed/i, "deposit_prescribed"], [/deposit/i, "deposit_cert"],
  [/inventory/i, "inventory"], [/right.?to.?rent|rtr/i, "right_to_rent"], [/tenancy|lease|\bast\b/i, "tenancy_agreement"],
  [/occupation/i, "occupation_contract"], [/insurance/i, "landlord_insurance"], [/mortgage/i, "mortgage_agreement"],
  [/invoice/i, "invoice"], [/receipt/i, "receipt"], [/hmo/i, "hmo_license"], [/rent.?smart|rsw/i, "rsw_registration"],
  [/floor.?plan/i, "floor_plan"], [/inspection/i, "inspection_report"],
];
function guessDocType(name: string): string | null {
  for (const [re, key] of TYPE_HINTS) if (re.test(name)) return key;
  return null;
}

/** Upload a document to a property's vault. */
export async function uploadPropertyDocument(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const propertyId = String(formData.get("property_id"));
  const { data: prop } = await supabase
    .from("properties")
    .select("id, label, city, postcode")
    .eq("id", propertyId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!prop) throw new Error("Property not found");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${propertyId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage
    .from("property-docs")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) throw new Error(upErr.message);

  const label = String(formData.get("label") ?? file.name) || file.name;
  const chosenType = String(formData.get("doc_type") ?? "");
  // Auto-fill: infer the document type from the filename if not chosen.
  const docType = chosenType && chosenType !== "other" ? chosenType : (guessDocType(file.name) ?? (chosenType || null));
  let issuedAt = String(formData.get("issued_at") ?? "") || null;
  let expiresAt = String(formData.get("expires_at") ?? "") || null;
  let finalType = docType;

  // Content-OCR: read the document to fill type/dates the user didn't provide.
  if (!finalType || !issuedAt || !expiresAt) {
    try {
      const extracted = await extractDocFields(buffer, file.type || "");
      if (!finalType && extracted.doc_type) finalType = extracted.doc_type;
      if (!issuedAt && extracted.issued_at) issuedAt = extracted.issued_at;
      if (!expiresAt && extracted.expires_at) expiresAt = extracted.expires_at;
    } catch {
      // best-effort
    }
  }

  // Auto-summary on upload (AI when configured, else a metadata description).
  const where = [prop.label, prop.city, prop.postcode].filter(Boolean).join(", ");
  const meta = `Document: ${label}. Type: ${finalType ?? "unknown"}. Property: ${where || "unspecified"}.${issuedAt ? ` Issued ${issuedAt}.` : ""}${expiresAt ? ` Expires ${expiresAt}.` : ""}`;
  const ai = await generateText(
    `Write one concise, plain-English sentence describing this rental property document for a landlord's records. Be factual; do not invent details.\n\n${meta}`,
    { system: "You summarise property documents tersely and factually.", maxTokens: 120 }
  );
  const summary = ai ?? `${(finalType ?? "Document").replace(/_/g, " ")} for ${where || "this property"}${expiresAt ? `, valid until ${expiresAt}` : ""}.`;

  const { error } = await supabase.from("property_documents").insert({
    org_id: orgId,
    property_id: propertyId,
    label,
    doc_type: finalType,
    issued_at: issuedAt,
    expires_at: expiresAt,
    storage_path: path,
    ai_summary: summary,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard/documents");
}

/** Edit a document's metadata (label, type, dates). Writers only. */
export async function updateDocument(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to edit documents.");
  const supabase = createClient();

  const id = String(formData.get("id"));
  const patch = {
    label: String(formData.get("label") ?? "").trim() || "Document",
    doc_type: String(formData.get("doc_type") ?? "") || null,
    issued_at: String(formData.get("issued_at") ?? "") || null,
    expires_at: String(formData.get("expires_at") ?? "") || null,
  };
  const { error } = await supabase
    .from("property_documents")
    .update(patch)
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/documents");
}

/** Delete a document (row + the stored file). Writers only. */
export async function deleteDocument(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to delete documents.");
  const supabase = createClient();

  const id = String(formData.get("id"));
  const { data: doc } = await supabase
    .from("property_documents")
    .select("id, storage_path, property_id")
    .eq("id", id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!doc) throw new Error("Document not found");

  if (doc.storage_path) {
    await supabase.storage.from("property-docs").remove([doc.storage_path]);
  }
  const { error } = await supabase
    .from("property_documents")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/documents");
  if (doc.property_id) revalidatePath(`/dashboard/properties/${doc.property_id}`);
}
