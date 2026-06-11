/**
 * Stripe pricing & entitlement configuration.
 *
 * Base subscription (Core) + add-on subscription items. 30-day free trial is
 * applied as a Stripe trial period on the base item at checkout. Add-ons toggle
 * mid-cycle with proration.
 */

export type Feature = "core" | "voice" | "tenant_portal" | "maintenance_portal";

export interface PlanItem {
  feature: Feature;
  label: string;
  pricePerMonth: number; // GBP
  /** env var holding the Stripe price id */
  priceEnv: string;
  /** the always-on base subscription */
  isBase?: boolean;
}

export const PLAN: Record<Feature, PlanItem> = {
  core: {
    feature: "core",
    label: "Core — MTD record-keeping",
    pricePerMonth: 9.99,
    priceEnv: "STRIPE_PRICE_CORE",
    isBase: true,
  },
  voice: {
    feature: "voice",
    label: "Voice AI assistant",
    pricePerMonth: 2.0,
    priceEnv: "STRIPE_PRICE_VOICE",
  },
  tenant_portal: {
    feature: "tenant_portal",
    label: "Tenant portal",
    pricePerMonth: 4.99,
    priceEnv: "STRIPE_PRICE_TENANT_PORTAL",
  },
  maintenance_portal: {
    feature: "maintenance_portal",
    label: "Maintenance portal",
    pricePerMonth: 4.99,
    priceEnv: "STRIPE_PRICE_MAINTENANCE_PORTAL",
  },
};

export const FULLY_LOADED_PRICE = 21.97;

/** 30-day free trial on signup (card captured, no charge until day 31). */
export const TRIAL_PERIOD_DAYS = 30;

/** Resolve a Stripe price id for a feature from env. */
export function priceIdFor(feature: Feature): string | undefined {
  return process.env[PLAN[feature].priceEnv];
}

/** Map a Stripe price id back to a feature (for webhook reconciliation). */
export function featureForPriceId(priceId: string): Feature | undefined {
  return (Object.keys(PLAN) as Feature[]).find(
    (f) => process.env[PLAN[f].priceEnv] === priceId
  );
}
