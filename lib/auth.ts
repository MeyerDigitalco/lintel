import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Feature } from "@/lib/stripe/config";
import type { JurisdictionKey } from "@/lib/jurisdictions";

export interface SessionContext {
  userId: string;
  email: string | null;
  orgId: string;
  role: string;
  region: JurisdictionKey;
  country: string;
  currency: string;
  regionCode: string | null;
}

export const WRITER_ROLES = ["owner", "admin", "landlord"];
export const isWriterRole = (role: string) => WRITER_ROLES.includes(role);

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

  const { data: org } = await supabase
    .from("orgs")
    .select("region, country, currency, region_code")
    .eq("id", membership.org_id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: membership.org_id,
    role: membership.role,
    region: (org?.region ?? "england") as JurisdictionKey,
    country: ((org as any)?.country as string) ?? "GB",
    currency: ((org as any)?.currency as string) ?? "GBP",
    regionCode: ((org as any)?.region_code as string) ?? null,
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
