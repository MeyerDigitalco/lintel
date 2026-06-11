import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface TenantTenancy {
  tenancyId: string;
  orgId: string;
  propertyId: string | null;
  propertyLabel: string;
  rentAmount: number | null;
  portalEnabled: boolean;
  maintenanceEnabled: boolean;
}

export interface TenantSession {
  userId: string;
  email: string | null;
  tenancies: TenantTenancy[];
  active: TenantTenancy;
}

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

  const orgIds = Array.from(
    new Set(memberships.map((m: any) => m.tenancies?.org_id).filter(Boolean))
  );
  const { data: ents } = await supabase
    .from("entitlements")
    .select("org_id, feature, active")
    .in("feature", ["tenant_portal", "maintenance_portal"])
    .in("org_id", orgIds);

  const enabled = (feature: string, orgId: string) =>
    (ents ?? []).some((e) => e.org_id === orgId && e.feature === feature && e.active);

  const tenancies: TenantTenancy[] = memberships.map((m: any) => ({
    tenancyId: m.tenancy_id,
    orgId: m.tenancies?.org_id,
    propertyId: m.tenancies?.property_id ?? null,
    propertyLabel: m.tenancies?.properties?.label ?? "Your home",
    rentAmount: m.tenancies?.rent_amount ?? null,
    portalEnabled: enabled("tenant_portal", m.tenancies?.org_id),
    maintenanceEnabled: enabled("maintenance_portal", m.tenancies?.org_id),
  }));

  return {
    userId: user.id,
    email: user.email ?? null,
    tenancies,
    active: tenancies[0],
  };
}
