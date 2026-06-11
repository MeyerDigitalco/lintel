import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Feature } from "@/lib/stripe/config";

/**
 * Server-side entitlement guard. Entitlements are stored in Postgres and synced
 * from Stripe webhooks. Every protected action must check this server-side; the
 * client `useEntitlement` hook is for UX only and is never trusted for authz.
 */
export async function hasEntitlement(
  orgId: string,
  feature: Feature
): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("entitlements")
    .select("active")
    .eq("org_id", orgId)
    .eq("feature", feature)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.active);
}

/** Throws if the org lacks the entitlement. Use to gate Server Actions/routes. */
export async function requireEntitlement(orgId: string, feature: Feature) {
  if (!(await hasEntitlement(orgId, feature))) {
    throw new Error(`Entitlement required: ${feature}`);
  }
}
