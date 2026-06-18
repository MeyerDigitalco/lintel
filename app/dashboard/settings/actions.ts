"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/client";
import { priceIdFor, TRIAL_PERIOD_DAYS, type Feature } from "@/lib/stripe/config";

const ADMIN_ROLES = ["owner", "admin"];
function assertAdmin(role: string) {
  if (!ADMIN_ROLES.includes(role)) {
    throw new Error("Only the account owner or an admin can do that.");
  }
}

const TOGGLEABLE: Feature[] = ["voice", "tenant_portal", "maintenance_portal"];
const INVITE_ROLES = ["admin", "landlord", "accountant"];
const ASSIGNABLE_ROLES = ["owner", "admin", "landlord", "accountant"];

/* ----------------------------- Profile ----------------------------- */

export async function updateProfile(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export async function updateEmail(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return;
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export async function updatePassword(formData: FormData) {
  await requireSession();
  const supabase = createClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (password !== confirm) throw new Error("Passwords do not match.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

export async function updateOrgName(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertAdmin(role);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const service = createServiceClient();
  const { error } = await service.from("orgs").update({ name }).eq("id", orgId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings");
}

/* ----------------------------- Billing ----------------------------- */

export async function toggleAddon(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertAdmin(role);
  const feature = String(formData.get("feature") ?? "") as Feature;
  const active = String(formData.get("active") ?? "") === "true";
  if (!TOGGLEABLE.includes(feature)) throw new Error("Unknown add-on.");
  const service = createServiceClient();
  const { error } = await service.from("entitlements").upsert(
    { org_id: orgId, feature, active, updated_at: new Date().toISOString() },
    { onConflict: "org_id,feature" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/settings/billing");
  revalidatePath("/dashboard/assistant");
  revalidatePath("/dashboard/maintenance");
  revalidatePath("/dashboard");
}

/* ------------------------------ Team ------------------------------- */

export async function inviteMember(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertAdmin(role);
  const email = String(formData.get("email") ?? "").trim();
  const newRole = String(formData.get("role") ?? "landlord");
  if (!email) return;
  if (!INVITE_ROLES.includes(newRole)) throw new Error("Invalid role.");

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
    { org_id: orgId, user_id: userId, role: newRole },
    { onConflict: "org_id,user_id" }
  );
  revalidatePath("/dashboard/settings/team");
}

export async function changeMemberRole(formData: FormData) {
  const { orgId, role } = await requireSession();
  assertAdmin(role);
  const targetUser = String(formData.get("user_id") ?? "");
  const newRole = String(formData.get("role") ?? "");
  if (!ASSIGNABLE_ROLES.includes(newRole)) throw new Error("Invalid role.");

  const service = createServiceClient();
  if (newRole !== "owner") {
    const { data: owners } = await service
      .from("memberships")
      .select("user_id")
      .eq("org_id", orgId)
      .eq("role", "owner");
    const ownerIds = (owners ?? []).map((o) => o.user_id);
    if (ownerIds.length === 1 && ownerIds[0] === targetUser) {
      throw new Error("You can't demote the last owner. Promote someone else first.");
    }
  }
  await service
    .from("memberships")
    .update({ role: newRole })
    .eq("org_id", orgId)
    .eq("user_id", targetUser);
  revalidatePath("/dashboard/settings/team");
}

export async function removeMember(formData: FormData) {
  const { orgId, role, userId: me } = await requireSession();
  assertAdmin(role);
  const targetUser = String(formData.get("user_id") ?? "");
  if (targetUser === me) throw new Error("You can't remove yourself.");

  const service = createServiceClient();
  const { data: target } = await service
    .from("memberships")
    .select("role")
    .eq("org_id", orgId)
    .eq("user_id", targetUser)
    .maybeSingle();
  if (target?.role === "owner") {
    const { count } = await service
      .from("memberships")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("role", "owner");
    if ((count ?? 0) <= 1) throw new Error("You can't remove the last owner.");
  }
  await service
    .from("memberships")
    .delete()
    .eq("org_id", orgId)
    .eq("user_id", targetUser);
  revalidatePath("/dashboard/settings/team");
}

/* --------------------------- Stripe billing ------------------------- */

export async function startCheckout(formData: FormData) {
  const { orgId, role, email } = await requireSession();
  assertAdmin(role);
  const corePrice = priceIdFor("core");
  if (!process.env.STRIPE_SECRET_KEY || !corePrice) {
    throw new Error("Stripe is not configured yet. Add the STRIPE_* env vars first.");
  }

  const chosen = (formData.getAll("addon") as string[]).filter((a) =>
    TOGGLEABLE.includes(a as Feature)
  );
  const line_items: { price: string; quantity: number }[] = [{ price: corePrice, quantity: 1 }];
  for (const a of chosen) {
    const pid = priceIdFor(a as Feature);
    if (pid) line_items.push({ price: pid, quantity: 1 });
  }

  const service = createServiceClient();
  const { data: sub } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("org_id", orgId)
    .maybeSingle();

  let customer = sub?.stripe_customer_id ?? undefined;
  if (!customer) {
    const c = await stripe.customers.create({
      email: email ?? undefined,
      metadata: { org_id: orgId },
    });
    customer = c.id;
    await service.from("subscriptions").upsert(
      { org_id: orgId, stripe_customer_id: customer, status: "incomplete", updated_at: new Date().toISOString() },
      { onConflict: "org_id" }
    );
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: TRIAL_PERIOD_DAYS,
      metadata: { org_id: orgId },
    },
    success_url: `${base}/dashboard/settings/billing?checkout=success`,
    cancel_url: `${base}/dashboard/settings/billing?checkout=cancelled`,
  });
  if (!session.url) throw new Error("Could not start checkout.");
  redirect(session.url);
}

export async function openBillingPortal() {
  const { orgId, role } = await requireSession();
  assertAdmin(role);
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured yet.");
  }
  const service = createServiceClient();
  const { data: sub } = await service
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("org_id", orgId)
    .maybeSingle();
  if (!sub?.stripe_customer_id) {
    throw new Error("No billing account yet — start a subscription first.");
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${base}/dashboard/settings/billing`,
  });
  redirect(session.url);
}
