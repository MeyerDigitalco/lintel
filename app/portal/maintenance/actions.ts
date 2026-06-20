"use server";

import { revalidatePath } from "next/cache";
import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { slaDueAt, type Priority } from "@/lib/maintenance";
import { sendPushToOrg } from "@/lib/push";

/** Tenant raises a maintenance request (with optional photos). */
export async function raiseRequest(formData: FormData) {
  const { active, userId } = await requireTenant();
  const supabase = createClient();

  const priority = (String(formData.get("priority") ?? "routine") as Priority);
  const isHazard = formData.get("is_hazard") === "on";

  // Resolve jurisdiction from the property for the hazard SLA clock.
  let jurisdiction: JurisdictionKey = "england";
  if (active.propertyId) {
    const { data: prop } = await supabase
      .from("properties")
      .select("jurisdiction")
      .eq("id", active.propertyId)
      .maybeSingle();
    if (prop) jurisdiction = prop.jurisdiction as JurisdictionKey;
  }

  const { data: req, error } = await supabase
    .from("maintenance_requests")
    .insert({
      org_id: active.orgId,
      tenancy_id: active.tenancyId,
      property_id: active.propertyId,
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "") || null,
      category: String(formData.get("category") ?? "") || null,
      is_hazard: isHazard,
      priority,
      status: "raised",
      raised_by_role: "tenant",
      sla_due_at: slaDueAt(priority, isHazard, jurisdiction),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Optional photos.
  const files = formData.getAll("photos");
  for (const f of files) {
    if (f instanceof File && f.size > 0) {
      const path = `${req.id}/${Date.now()}-${f.name}`;
      const { error: upErr } = await supabase.storage
        .from("maintenance")
        .upload(path, f, { upsert: false });
      if (!upErr) {
        await supabase.from("maintenance_photos").insert({
          request_id: req.id,
          storage_path: path,
          uploaded_by_role: "tenant",
        });
      }
    }
  }

  await supabase.from("maintenance_events").insert({
    request_id: req.id,
    actor_role: "tenant",
    kind: "status_change",
    new_status: "raised",
    body: "Request raised by tenant.",
  });

  await supabase.from("audit_log").insert({
    org_id: active.orgId,
    actor_id: userId,
    action: "maintenance_raised",
    entity: "maintenance_requests",
    entity_id: req.id,
  });

  await sendPushToOrg(active.orgId, {
    title: isHazard ? "⚠️ Hazard reported by tenant" : "New maintenance request",
    body: String(formData.get("title") ?? "").trim() || "A tenant raised a maintenance request.",
    data: { type: "fault_reported", request_id: req.id },
  });

  revalidatePath("/portal/maintenance");
}

/** Tenant adds a note to their request's timeline. */
export async function tenantAddNote(formData: FormData) {
  await requireTenant();
  const supabase = createClient();
  const requestId = String(formData.get("request_id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase.from("maintenance_events").insert({
    request_id: requestId,
    actor_role: "tenant",
    kind: "note",
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/portal/maintenance/${requestId}`);
}
