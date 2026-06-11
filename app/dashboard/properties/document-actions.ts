"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** Upload a document to a property's vault. */
export async function uploadPropertyDocument(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const propertyId = String(formData.get("property_id"));
  // Ownership check via RLS-backed select.
  const { data: prop } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!prop) throw new Error("Property not found");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const path = `${propertyId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage
    .from("property-docs")
    .upload(path, file, { upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { error } = await supabase.from("property_documents").insert({
    org_id: orgId,
    property_id: propertyId,
    label: String(formData.get("label") ?? file.name) || file.name,
    doc_type: String(formData.get("doc_type") ?? "") || null,
    issued_at: String(formData.get("issued_at") ?? "") || null,
    expires_at: String(formData.get("expires_at") ?? "") || null,
    storage_path: path,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/properties/${propertyId}`);
}
