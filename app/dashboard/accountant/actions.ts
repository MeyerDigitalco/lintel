"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function assertWriter(role: string) {
  if (!["owner", "admin", "landlord"].includes(role)) {
    throw new Error("Only the account owner can manage accountant access.");
  }
}

export async function addAccountantNote(formData: FormData) {
  const { orgId, userId, role } = await requireSession();
  const supabase = createClient();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  const { error } = await supabase.from("accountant_notes").insert({
    org_id: orgId,
    author_id: userId,
    author_role: role === "accountant" ? "accountant" : "landlord",
    body,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accountant");
}

export async function resolveAccountantNote(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const id = String(formData.get("id"));
  await supabase.from("accountant_notes").update({ resolved: true }).eq("id", id);
  revalidatePath("/dashboard/accountant");
}

/** Invite a read-only accountant to the org by email. */
export async function inviteAccountant(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertWriter(role);

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

  await service.from("memberships").upsert(
    { org_id: orgId, user_id: userId, role: "accountant" },
    { onConflict: "org_id,user_id" }
  );
  revalidatePath("/dashboard/accountant");
}

/** Revoke an accountant's access. */
export async function revokeAccountant(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertWriter(role);
  const userId = String(formData.get("user_id"));
  const service = createServiceClient();
  await service
    .from("memberships")
    .delete()
    .eq("org_id", orgId)
    .eq("user_id", userId)
    .eq("role", "accountant");
  revalidatePath("/dashboard/accountant");
}
