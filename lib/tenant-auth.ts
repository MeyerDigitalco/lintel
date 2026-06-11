import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface TenantTenancy {
  tenancyId: string;
  orgId: string;
  propertyLabel: string;
  rentAmount: number | null;
  portalEnabled: boolean;
}

export interface TenantSession {
  userId: string;
  email: string | null;
  tenancies: TenantTenancy[];
  active: TenantTenancy;
}

/**
 * Resolve the signed-in user's tenant context. A tenant is a member of one or
 * more tenancies (tenancy_members). Redirects to /login if not signed in, or to
 * /home if the user is not a tenant at all.
 *
 * The portal is an add-on the *landlord* pays for, so each tenancy carries a
 * portalEnabled flag derived from the org's tenant_portal entitlement.
 */
export async function requireTenant(): Promise<TenantSession> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("tenancy_members")
    .select("tenancy_id, tenancies(id, org_id, rent_amount, property_id, properties(label))")
    .eq("user_id", user.id);

  if (!memberships || memberships.length === 0) redirect("/home");

  // Entitlements for the relevant orgs.
  const orgIds = Array.from(
    new Set(memberships.map((m: any) => m.tenancies?.org_id).filter(Boolean))
  );
  const { data: ents } = await supabase
    .from("entitlements")
    .select("org_id, active")
    .eq("feature", "tenant_portal")
    .in("org_id", orgIds);
  const enabledOrgs = new Set(
    (ents ?? []).filter((e) => e.active).map((e) => e.org_id)
  );

  const tenancies: TenantTenancy[] = memberships.map((m: any) => ({
    tenancyId: m.tenancy_id,
    orgId: m.tenancies?.org_id,
    propertyLabel: m.tenancies?.properties?.label ?? "Your home",
    rentAmount: m.tenancies?.rent_amount ?? null,
    portalEnabled: enabledOrgs.has(m.tenancies?.org_id),
  }));

  return {
    userId: user.id,
    email: user.email ?? null,
    tenancies,
    active: tenancies[0],
  };
}
