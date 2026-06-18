"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { JurisdictionKey } from "@/lib/jurisdictions";
import { resolveRegion } from "@/lib/i18n/rulesets";

function slug(label: string): string {
  return label.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join("_").slice(0, 40);
}

export async function createProperty(formData: FormData) {
  const { orgId, country, region, regionCode } = await requireSession();
  const supabase = createClient();

  const jurisdiction = String(formData.get("jurisdiction")) as JurisdictionKey;
  const { data: created, error } = await supabase
    .from("properties")
    .insert({
      org_id: orgId,
      jurisdiction,
      label: String(formData.get("label") ?? "").trim(),
      address_line1: String(formData.get("address_line1") ?? "") || null,
      city: String(formData.get("city") ?? "") || null,
      postcode: String(formData.get("postcode") ?? "") || null,
      is_hmo: formData.get("is_hmo") === "on",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Region-aware compliance auto-seeding from the org's country/region ruleset.
  if (created && created.id) {
    try {
      const ruleset = resolveRegion(country, region, regionCode);
      const rows = ruleset.compliance.map((c) => ({
        org_id: orgId,
        property_id: created.id,
        item_key: slug(c.label),
        label: c.label,
        statutory_basis: c.note,
        expires_at: null,
      }));
      if (rows.length > 0) {
        await supabase.from("compliance_items").insert(rows);
      }
    } catch {
      // non-fatal: the property is created regardless
    }
  }

  revalidatePath("/dashboard/properties");
}

export async function createUnit(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const propertyId = String(formData.get("property_id"));
  const { error } = await supabase.from("units").insert({
    property_id: propertyId,
    label: String(formData.get("label") ?? "").trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function createRegistration(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const propertyId = String(formData.get("property_id"));
  const { error } = await supabase.from("registrations").insert({
    property_id: propertyId,
    scheme: String(formData.get("scheme") ?? "").trim(),
    reference: String(formData.get("reference") ?? "") || null,
    issued_at: String(formData.get("issued_at") ?? "") || null,
    renews_at: String(formData.get("renews_at") ?? "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
}
