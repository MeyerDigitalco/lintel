"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";

export async function addComplianceItem(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const propertyId = String(formData.get("property_id"));
  const itemKey = String(formData.get("item_key"));

  // Resolve the canonical label + statutory basis from the property's nation.
  const { data: property } = await supabase
    .from("properties")
    .select("jurisdiction")
    .eq("id", propertyId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!property) throw new Error("Property not found");

  const rules = resolveJurisdiction(property.jurisdiction as JurisdictionKey);
  const item = rules.complianceItems.find((c) => c.key === itemKey);

  const { error } = await supabase.from("compliance_items").insert({
    org_id: orgId,
    property_id: propertyId,
    item_key: itemKey,
    label: item?.label ?? itemKey,
    statutory_basis: item?.statutoryBasis ?? null,
    issued_at: String(formData.get("issued_at") ?? "") || null,
    expires_at: String(formData.get("expires_at") ?? "") || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/compliance");
}
