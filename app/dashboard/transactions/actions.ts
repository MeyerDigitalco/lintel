"use server";

import { revalidatePath } from "next/cache";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { mileageAllowance } from "@/lib/sa105";

const RECEIPTS_BUCKET = "receipts";

/** Insert transaction rows; if the optional `recurring` column is missing, retry without it. */
async function insertTx(supabase: any, rows: Record<string, unknown>[]) {
  let res = await supabase.from("transactions").insert(rows);
  if (res.error && /recurring/i.test(String(res.error.message ?? ""))) {
    const stripped = rows.map((r) => { const { recurring, ...rest } = r as any; return rest; });
    res = await supabase.from("transactions").insert(stripped);
  }
  if (res.error) throw new Error(res.error.message);
}

/** Add n months to a YYYY-MM-DD date, clamping to the end of the target month. */
function addMonthsISO(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1 + n, 1));
  const daysInMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  const day = Math.min(d || 1, daysInMonth);
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${base.getUTCFullYear()}-${mm}-${dd}`;
}

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

  const recurring = formData.get("recurring") === "on";
  const startDate = String(formData.get("occurred_on") ?? "") || new Date().toISOString().slice(0, 10);
  const base = {
    org_id: orgId,
    property_id: String(formData.get("property_id") ?? "") || null,
    direction,
    sa105_category: String(formData.get("sa105_category") ?? "") || null,
    amount: isNaN(amount) ? 0 : amount,
    description: String(formData.get("description") ?? "") || null,
  };

  if (recurring) {
    // Create this month plus the next 11 months (a rolling year forward).
    const rows = Array.from({ length: 12 }, (_, i) => ({
      ...base,
      occurred_on: addMonthsISO(startDate, i),
      receipt_url: i === 0 ? receiptUrl : null, // receipt only on the first entry
      recurring: true,
    }));
    await insertTx(supabase, rows);
  } else {
    await insertTx(supabase, [{ ...base, occurred_on: startDate, receipt_url: receiptUrl, recurring: false }]);
  }

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

/** Edit an existing transaction. Writers only. */
export async function updateTransaction(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to edit entries.");
  const supabase = createClient();
  const id = String(formData.get("id"));
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const { error } = await supabase
    .from("transactions")
    .update({
      property_id: String(formData.get("property_id") ?? "") || null,
      direction: String(formData.get("direction") ?? "expense"),
      sa105_category: String(formData.get("sa105_category") ?? "") || null,
      amount: isNaN(amount) ? 0 : amount,
      occurred_on: String(formData.get("occurred_on") ?? "") || new Date().toISOString().slice(0, 10),
      description: String(formData.get("description") ?? "") || null,
    })
    .eq("id", id)
    .eq("org_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/transactions");
}

/** Delete a transaction (and its receipt file). Writers only. */
export async function deleteTransaction(formData: FormData) {
  const { orgId, role } = await requireSession();
  if (!isWriterRole(role)) throw new Error("You don't have permission to delete entries.");
  const supabase = createClient();
  const id = String(formData.get("id"));
  const { data: tx } = await supabase
    .from("transactions")
    .select("receipt_url")
    .eq("id", id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (tx?.receipt_url) {
    await supabase.storage.from(RECEIPTS_BUCKET).remove([tx.receipt_url]);
  }
  const { error } = await supabase.from("transactions").delete().eq("id", id).eq("org_id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/transactions");
}
