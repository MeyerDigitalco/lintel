import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Feature } from "@/lib/stripe/config";

export interface SessionContext {
  userId: string;
  email: string | null;
  orgId: string;
  role: string;
}

export const WRITER_ROLES = ["owner", "admin", "landlord"];
export const isWriterRole = (role: string) => WRITER_ROLES.includes(role);

/**
 * Resolve the current user + their primary org. Redirects to /login if not
 * signed in. Use at the top of every protected Server Component / action.
 */
export async function requireSession(): Promise<SessionContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: membership.org_id,
    role: membership.role,
  };
}

/**
 * Like requireSession, but for write-capable pages. Read-only accountants are
 * redirected to their read-only surface so they never see write controls.
 */
export async function requireWriter(): Promise<SessionContext> {
  const session = await requireSession();
  if (!isWriterRole(session.role)) redirect("/dashboard/accountant");
  return session;
}

/** Load the org's entitlement map for UI gating. */
export async function loadEntitlements(
  orgId: string
): Promise<Record<Feature, boolean>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("entitlements")
    .select("feature, active")
    .eq("org_id", orgId);

  const map: Record<Feature, boolean> = {
    core: false,
    voice: false,
    tenant_portal: false,
    maintenance_portal: false,
  };
  for (const row of data ?? []) {
    map[row.feature as Feature] = row.active;
  }
  return map;
}
