"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPushToOrg } from "@/lib/push";

/**
 * Contractor actions. Contractors have no account — they act via a tokenised
 * link. Every action re-validates the token with the service-role client, which
 * is the only trusted path (RLS does not grant contractors access).
 */
async function resolveByToken(token: string) {
  const service = createServiceClient();
  const { data } = await service
    .from("maintenance_requests")
    .select("id, contractor_token, org_id, property_id, tenancy_id, title, contractor_name, status")
    .eq("contractor_token", token)
    .maybeSingle();
  if (!data) throw new Error("Invalid link");
  return {
    service,
    requestId: data.id,
    orgId: data.org_id as string,
    propertyId: (data.property_id as string) ?? null,
    tenancyId: (data.tenancy_id as string) ?? null,
    title: (data.title as string) ?? "Maintenance",
    contractorName: (data.contractor_name as string) ?? null,
    status: (data.status as string) ?? "",
  };
}

export async function contractorAccept(formData: FormData) {
  const token = String(formData.get("token"));
  const { service, requestId, orgId } = await resolveByToken(token);
  await service.from("maintenance_requests").update({ status: "in_progress" }).eq("id", requestId);
  await service.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "contractor",
    kind: "status_change",
    new_status: "in_progress",
    body: "Contractor accepted the job.",
  });
  await sendPushToOrg(orgId, { title: "Contractor accepted", body: "A contractor accepted a maintenance job.", data: { type: "maintenance_status", request_id: requestId, status: "in_progress" } });
  revalidatePath(`/maintenance/${token}`);
}

export async function contractorSchedule(formData: FormData) {
  const token = String(formData.get("token"));
  const { service, requestId, orgId } = await resolveByToken(token);
  const date = String(formData.get("scheduled_for") ?? "");
  const time = String(formData.get("scheduled_time") ?? "").trim();
  const quote = parseFloat(String(formData.get("quote_amount") ?? ""));
  const patch: Record<string, unknown> = { status: "scheduled", scheduled_for: date || null, scheduled_time: time || null };
  if (isFinite(quote) && quote > 0) patch.quote_amount = quote;
  await service.from("maintenance_requests").update(patch).eq("id", requestId);
  const when = date ? `${date}${time ? ` at ${time}` : ""}` : "";
  await service.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "contractor",
    kind: "schedule",
    new_status: "scheduled",
    body: [when ? `Scheduled for ${when}.` : "Schedule updated.", isFinite(quote) && quote > 0 ? `Quote provided.` : ""].filter(Boolean).join(" "),
  });
  await sendPushToOrg(orgId, { title: "Contractor scheduled a visit", body: when ? `Attending ${when}.` : "A visit was scheduled.", data: { type: "maintenance_status", request_id: requestId, status: "scheduled" } });
  revalidatePath(`/maintenance/${token}`);
}

export async function contractorNote(formData: FormData) {
  const token = String(formData.get("token"));
  const { service, requestId } = await resolveByToken(token);
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await service.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "contractor",
    kind: "note",
    body,
  });
  revalidatePath(`/maintenance/${token}`);
}

export async function contractorComplete(formData: FormData) {
  const token = String(formData.get("token"));
  const { service, requestId, orgId, propertyId, tenancyId, title, contractorName, status: prevStatus } = await resolveByToken(token);

  // Optional completion photos (one or many).
  const files = formData.getAll("photos");
  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      const path = `${requestId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await service.storage
        .from("maintenance")
        .upload(path, file, { upsert: false });
      if (!upErr) {
        await service.from("maintenance_photos").insert({
          request_id: requestId,
          storage_path: path,
          uploaded_by_role: "contractor",
        });
      }
    }
  }

  const finalCost = parseFloat(String(formData.get("cost") ?? ""));
  const donePatch: Record<string, unknown> = { status: "completed", completed_at: new Date().toISOString() };
  if (isFinite(finalCost) && finalCost > 0) donePatch.cost = finalCost;
  await service
    .from("maintenance_requests")
    .update(donePatch)
    .eq("id", requestId);

  // Auto-log the spend as an expense (once), so it flows into the accounting reports.
  if (isFinite(finalCost) && finalCost > 0 && prevStatus !== "completed") {
    try {
      await service.from("transactions").insert({
        org_id: orgId,
        property_id: propertyId,
        tenancy_id: tenancyId,
        direction: "expense",
        sa105_category: "repairs_maintenance",
        amount: finalCost,
        occurred_on: new Date().toISOString().slice(0, 10),
        description: `Maintenance: ${title}${contractorName ? ` — ${contractorName}` : ""}`,
      });
    } catch {
      // non-fatal: completion still succeeds even if the ledger entry fails
    }
  }
  await service.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "contractor",
    kind: "status_change",
    new_status: "completed",
    body: "Contractor marked the job complete.",
  });
  await sendPushToOrg(orgId, { title: "✅ Work completed", body: "A contractor marked a maintenance job complete.", data: { type: "maintenance_status", request_id: requestId, status: "completed" } });
  revalidatePath(`/maintenance/${token}`);
}
