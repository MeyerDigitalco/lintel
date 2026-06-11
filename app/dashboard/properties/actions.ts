"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { JurisdictionKey } from "@/lib/jurisdictions";

export async function createProperty(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const jurisdiction = String(formData.get("jurisdiction")) as JurisdictionKey;
  const { error } = await supabase.from("properties").insert({
    org_id: orgId,
    jurisdiction,
    label: String(formData.get("label") ?? "").trim(),
    address_line1: String(formData.get("address_line1") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    postcode: String(formData.get("postcode") ?? "") || null,
    is_hmo: formData.get("is_hmo") === "on",
  });
  if (error) throw new Error(error.message);

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
