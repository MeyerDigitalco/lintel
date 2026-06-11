"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { newContractorToken, type RequestStatus } from "@/lib/maintenance";

async function assertRequestOwner(requestId: string) {
  const { orgId } = await requireSession();
  const supabase = createClient();
  const { data } = await supabase
    .from("maintenance_requests")
    .select("org_id, tenancy_id, property_id, title")
    .eq("id", requestId)
    .maybeSingle();
  if (!data || data.org_id !== orgId) throw new Error("Request not found");
  return { orgId, request: data };
}

/** Landlord creates a request directly (e.g. planned maintenance). */
export async function createRequest(formData: FormData) {
  const { orgId } = await requireSession();
  await requireEntitlement(orgId, "maintenance_portal");
  const supabase = createClient();

  const { data: req, error } = await supabase
    .from("maintenance_requests")
    .insert({
      org_id: orgId,
      property_id: String(formData.get("property_id") ?? "") || null,
      tenancy_id: String(formData.get("tenancy_id") ?? "") || null,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
      priority: String(formData.get("priority") ?? "routine"),
      is_planned: formData.get("is_planned") === "on",
      compliance_item_id: String(formData.get("compliance_item_id") ?? "") || null,
      status: "triaged",
      raised_by_role: "landlord",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("maintenance_events").insert({
    request_id: req.id,
    actor_role: "landlord",
    kind: "status_change",
    new_status: "triaged",
    body: "Created by landlord.",
  });
  revalidatePath("/dashboard/maintenance");
}

/** Update status and/or add a note. */
export async function updateStatus(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const { orgId } = await assertRequestOwner(requestId);
  await requireEntitlement(orgId, "maintenance_portal");
  const supabase = createClient();

  const status = String(formData.get("status") ?? "") as RequestStatus;
  const note = String(formData.get("note") ?? "").trim();

  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (status === "completed") patch.completed_at = new Date().toISOString();

  if (Object.keys(patch).length) {
    await supabase.from("maintenance_requests").update(patch).eq("id", requestId);
  }
  await supabase.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "landlord",
    kind: status ? "status_change" : "note",
    new_status: status || null,
    body: note || (status ? `Status set to ${status}.` : null),
  });
  revalidatePath(`/dashboard/maintenance/${requestId}`);
}

/** Assign a contractor and mint a tokenised access link. */
export async function assignContractor(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const { orgId } = await assertRequestOwner(requestId);
  await requireEntitlement(orgId, "maintenance_portal");
  const supabase = createClient();

  const token = newContractorToken();
  const { error } = await supabase
    .from("maintenance_requests")
    .update({
      contractor_name: String(formData.get("contractor_name") ?? "") || null,
      contractor_email: String(formData.get("contractor_email") ?? "") || null,
      contractor_token: token,
      status: "assigned",
    })
    .eq("id", requestId);
  if (error) throw new Error(error.message);

  await supabase.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "landlord",
    kind: "status_change",
    new_status: "assigned",
    body: `Assigned to ${formData.get("contractor_name") ?? "contractor"}.`,
  });
  revalidatePath(`/dashboard/maintenance/${requestId}`);
}

/** Record the cost on completion and post it to the expense ledger. */
export async function recordCost(formData: FormData) {
  const requestId = String(formData.get("request_id"));
  const { orgId, request } = await assertRequestOwner(requestId);
  await requireEntitlement(orgId, "maintenance_portal");
  const supabase = createClient();

  const cost = parseFloat(String(formData.get("cost") ?? "0"));
  if (!cost || isNaN(cost)) return;

  // Create the expense transaction (repairs & maintenance).
  const { data: tx } = await supabase
    .from("transactions")
    .insert({
      org_id: orgId,
      property_id: request.property_id,
      direction: "expense",
      sa105_category: "repairs_maintenance",
      amount: cost,
      occurred_on: new Date().toISOString().slice(0, 10),
      description: `Maintenance: ${request.title}`,
    })
    .select("id")
    .single();

  await supabase
    .from("maintenance_requests")
    .update({ cost, expense_tx_id: tx?.id ?? null })
    .eq("id", requestId);

  await supabase.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "landlord",
    kind: "note",
    body: `Cost recorded (£${cost.toFixed(2)}) and posted to expenses.`,
  });
  revalidatePath(`/dashboard/maintenance/${requestId}`);
}
