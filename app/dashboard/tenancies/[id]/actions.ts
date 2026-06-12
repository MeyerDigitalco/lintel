"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { newContractorToken } from "@/lib/maintenance";

async function assertTenancyOwner(tenancyId: string) {
  const { orgId } = await requireSession();
  const supabase = createClient();
  const { data } = await supabase
    .from("tenancies")
    .select("org_id")
    .eq("id", tenancyId)
    .maybeSingle();
  if (!data || data.org_id !== orgId) throw new Error("Tenancy not found");
  return orgId;
}

export async function inviteTenant(formData: FormData) {
  const tenancyId = String(formData.get("tenancy_id"));
  const orgId = await assertTenancyOwner(tenancyId);
  await requireEntitlement(orgId, "tenant_portal");

  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;

  const service = createServiceClient();
  const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/home`,
  });

  let userId = data?.user?.id;
  if (error && !userId) {
    const { data: list } = await service.auth.admin.listUsers();
    userId = list?.users?.find((u: any) => u.email === email)?.id;
    if (!userId) throw new Error(error.message);
  }

  await service.from("tenancy_members").upsert(
    { tenancy_id: tenancyId, user_id: userId, role: "tenant" },
    { onConflict: "tenancy_id,user_id" }
  );

  revalidatePath(`/dashboard/tenancies/${tenancyId}`);
}

/** Create (or keep) a tokenised, no-login tenant link for this tenancy. */
export async function generatePortalLink(formData: FormData) {
  const tenancyId = String(formData.get("tenancy_id"));
  await assertTenancyOwner(tenancyId);
  const supabase = createClient();
  const { data } = await supabase
    .from("tenancies")
    .select("portal_token")
    .eq("id", tenancyId)
    .maybeSingle();
  if (!data?.portal_token) {
    await supabase
      .from("tenancies")
      .update({ portal_token: newContractorToken() })
      .eq("id", tenancyId);
  }
  revalidatePath(`/dashboard/tenancies/${tenancyId}`);
}

export async function shareDocument(formData: FormData) {
  const tenancyId = String(formData.get("tenancy_id"));
  const orgId = await assertTenancyOwner(tenancyId);
  await requireEntitlement(orgId, "tenant_portal");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;

  const supabase = createClient();
  const path = `${tenancyId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supabase.storage.from("tenancy-docs").upload(path, file, { upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { error } = await supabase.from("shared_documents").insert({
    org_id: orgId,
    tenancy_id: tenancyId,
    label: String(formData.get("label") ?? file.name),
    kind: String(formData.get("kind") ?? "") || null,
    storage_path: path,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/tenancies/${tenancyId}`);
}

export async function sendLandlordMessage(formData: FormData) {
  const tenancyId = String(formData.get("tenancy_id"));
  const orgId = await assertTenancyOwner(tenancyId);
  const { userId } = await requireSession();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    org_id: orgId,
    tenancy_id: tenancyId,
    sender_id: userId,
    sender_role: "landlord",
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/tenancies/${tenancyId}`);
}
