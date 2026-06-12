"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createInvoice(formData: FormData) {
  const { orgId } = await requireWriter();
  const supabase = createClient();

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);
  const number = `INV-${String((count ?? 0) + 1).padStart(4, "0")}`;

  const { error } = await supabase.from("invoices").insert({
    org_id: orgId,
    number,
    contact_id: String(formData.get("contact_id") ?? "") || null,
    property_id: String(formData.get("property_id") ?? "") || null,
    amount: parseFloat(String(formData.get("amount") ?? "0")) || 0,
    description: String(formData.get("description") ?? "") || null,
    due_date: String(formData.get("due_date") ?? "") || null,
    status: "draft",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/invoices");
}

export async function setInvoiceStatus(formData: FormData) {
  await requireWriter();
  const supabase = createClient();
  await supabase
    .from("invoices")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/invoices");
}
