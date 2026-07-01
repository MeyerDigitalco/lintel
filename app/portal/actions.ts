"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";

/** Tenant marks a rent period as paid (log only, landlord confirms separately). */
export async function markRentPaid(formData: FormData) {
  const { userId } = await requireTenant();
  const supabase = createClient();
  const id = String(formData.get("id"));

  // RLS (rent_tenant_mark) restricts this to the tenant's own tenancy rows.
  const { error } = await supabase
    .from("rent_ledger")
    .update({ status: "marked", marked_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    actor_id: userId,
    action: "rent_marked_paid",
    entity: "rent_ledger",
    entity_id: id,
  });
  revalidatePath("/portal/rent");
}

/** Tenant sends a message to the landlord. */
export async function sendTenantMessage(formData: FormData) {
  const { userId, active } = await requireTenant();
  const supabase = createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const { error } = await supabase.from("messages").insert({
    org_id: active.orgId,
    tenancy_id: active.tenancyId,
    sender_id: userId,
    sender_role: "tenant",
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/portal/messages");
}

export async function updateNotifyPref(formData: FormData) {
  const { userId, active } = await requireTenant();
  const supabase = createClient();
  const notify = formData.get("notify_email") === "on";
  const { error } = await supabase
    .from("tenancy_members")
    .update({ notify_email: notify })
    .eq("tenancy_id", active.tenancyId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/portal/settings");
}
