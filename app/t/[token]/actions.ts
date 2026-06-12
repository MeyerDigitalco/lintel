"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { slaDueAt, type Priority } from "@/lib/maintenance";
import type { JurisdictionKey } from "@/lib/jurisdictions";

/**
 * Tenant reports a fault via their tokenised link — no account. The token is the
 * credential; everything runs through the service-role client after validating
 * it against the tenancy.
 */
export async function raiseFaultByToken(formData: FormData) {
  const token = String(formData.get("token"));
  const service = createServiceClient();

  const { data: tenancy } = await service
    .from("tenancies")
    .select("id, org_id, property_id, properties(jurisdiction)")
    .eq("portal_token", token)
    .maybeSingle();
  if (!tenancy) throw new Error("Invalid link");

  const jurisdiction = ((tenancy as any).properties?.jurisdiction ?? "england") as JurisdictionKey;
  const isHazard = formData.get("is_hazard") === "on";
  const priority = (String(formData.get("priority") ?? "routine") as Priority);

  const { data: req, error } = await service
    .from("maintenance_requests")
    .insert({
      org_id: tenancy.org_id,
      tenancy_id: tenancy.id,
      property_id: tenancy.property_id,
      title: String(formData.get("title") ?? "").trim() || "Reported fault",
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

  await service.from("maintenance_events").insert({
    request_id: req.id,
    actor_role: "tenant",
    kind: "status_change",
    new_status: "raised",
    body: "Fault reported by tenant.",
  });

  revalidatePath(`/t/${token}`);
}
