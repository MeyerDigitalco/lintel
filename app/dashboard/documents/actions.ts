"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai";

/**
 * Generate a plain-English summary for a property document. Uses an LLM if
 * ANTHROPIC_API_KEY is set; otherwise records a metadata-derived description so
 * the feature still does something useful.
 */
export async function summarizeDocument(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));

  const { data: doc } = await supabase
    .from("property_documents")
    .select("id, label, doc_type, issued_at, expires_at, properties(label, city, postcode)")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();
  if (!doc) return;

  const prop = (doc as any).properties;
  const where = [prop?.label, prop?.city, prop?.postcode].filter(Boolean).join(", ");
  const meta = `Document label: ${doc.label}. Type: ${doc.doc_type ?? "unknown"}. Property: ${where || "unspecified"}.${doc.issued_at ? ` Issued ${doc.issued_at}.` : ""}${doc.expires_at ? ` Expires ${doc.expires_at}.` : ""}`;

  const ai = await generateText(
    `Write one concise, plain-English sentence describing this UK rental property document for a landlord's records. Be factual; do not invent details beyond what's given.\n\n${meta}`,
    { system: "You summarise UK property documents tersely and factually.", maxTokens: 120 }
  );

  const summary =
    ai ??
    `${prettyType(doc.doc_type)} for ${where || "this property"}${doc.expires_at ? `, valid until ${doc.expires_at}` : ""}.`;

  await supabase.from("property_documents").update({ ai_summary: summary }).eq("id", id);
  revalidatePath("/dashboard/documents");
}

function prettyType(t: string | null) {
  if (!t) return "Document";
  return t.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
