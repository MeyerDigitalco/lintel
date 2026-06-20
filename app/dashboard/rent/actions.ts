"use server";

import { revalidatePath } from "next/cache";
import { sendPushToOrg } from "@/lib/push";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";

export async function createTenancy(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const propertyId = String(formData.get("property_id"));
  // Resolve the tenancy type from the property's jurisdiction.
  const { data: property } = await supabase
    .from("properties")
    .select("jurisdiction")
    .eq("id", propertyId)
    .maybeSingle();

  const type = property
    ? resolveJurisdiction(property.jurisdiction as JurisdictionKey).tenancyTypes[0].key
    : "tenancy";

  const { error } = await supabase.from("tenancies").insert({
    org_id: orgId,
    property_id: propertyId,
    type,
    start_date: String(formData.get("start_date") ?? "") || null,
    rent_amount: parseFloat(String(formData.get("rent_amount") ?? "0")) || null,
    rent_period: String(formData.get("rent_period") ?? "monthly"),
    deposit_amount: parseFloat(String(formData.get("deposit_amount") ?? "0")) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/rent");
}

/**
 * Generate rent-ledger rows for the next N periods for a tenancy.
 * Log-only: rows are records of what is due, never payment instructions.
 */
export async function generateRentPeriods(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const tenancyId = String(formData.get("tenancy_id"));
  const { data: tenancy } = await supabase
    .from("tenancies")
    .select("rent_amount, rent_period, start_date")
    .eq("id", tenancyId)
    .maybeSingle();
  if (!tenancy?.rent_amount) return;

  const months = 3;
  const base = new Date();
  base.setDate(1);

  const rows = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const dueOn = `${period}-01`;
    rows.push({
      org_id: orgId,
      tenancy_id: tenancyId,
      period,
      due_on: dueOn,
      amount_due: tenancy.rent_amount,
      status: "due" as const,
    });
  }

  // Upsert-like: skip periods that already exist.
  const { data: existing } = await supabase
    .from("rent_ledger")
    .select("period")
    .eq("tenancy_id", tenancyId);
  const have = new Set((existing ?? []).map((r) => r.period));
  const toInsert = rows.filter((r) => !have.has(r.period));

  if (toInsert.length) {
    const { error } = await supabase.from("rent_ledger").insert(toInsert);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/dashboard/rent");
}

/** Landlord confirms rent received (log only). */
export async function confirmRent(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { error } = await supabase
    .from("rent_ledger")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await sendPushToOrg(orgId, {
    title: "Rent received",
    body: "A rent payment was marked as received.",
    data: { type: "rent_confirmed", ledger_id: id },
  });
  revalidatePath("/dashboard/rent");
}
