"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mileageAllowance } from "@/lib/sa105";

const RECEIPTS_BUCKET = "receipts";

export async function createTransaction(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const direction = String(formData.get("direction"));
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const receipt = formData.get("receipt");

  let receiptUrl: string | null = null;
  if (receipt instanceof File && receipt.size > 0) {
    const path = `${orgId}/${Date.now()}-${receipt.name}`;
    const { error: upErr } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(path, receipt, { upsert: false });
    if (!upErr) {
      // Stored privately; signed URLs are generated on demand when viewing.
      receiptUrl = path;
    }
  }

  const { error } = await supabase.from("transactions").insert({
    org_id: orgId,
    property_id: String(formData.get("property_id") ?? "") || null,
    direction,
    sa105_category: String(formData.get("sa105_category") ?? "") || null,
    amount: isNaN(amount) ? 0 : amount,
    occurred_on: String(formData.get("occurred_on") ?? new Date().toISOString().slice(0, 10)),
    description: String(formData.get("description") ?? "") || null,
    receipt_url: receiptUrl,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/transactions");
}

/** Log a mileage claim as an expense using HMRC approved rates. */
export async function logMileage(formData: FormData) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const miles = parseFloat(String(formData.get("miles") ?? "0"));
  const amount = mileageAllowance(isNaN(miles) ? 0 : miles);

  const { error } = await supabase.from("transactions").insert({
    org_id: orgId,
    property_id: String(formData.get("property_id") ?? "") || null,
    direction: "expense",
    sa105_category: "other_expenses",
    amount,
    occurred_on: String(formData.get("occurred_on") ?? new Date().toISOString().slice(0, 10)),
    description: `Mileage: ${miles} miles @ HMRC rate`,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/transactions");
}
