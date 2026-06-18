import type { Feature } from "@/lib/stripe/config";

type Prices = Record<Feature, number>;

// Locally-set price points (not FX-converted) per currency.
export const LOCAL_PRICES: Record<string, Prices> = {
  GBP: { core: 9.99, voice: 2, tenant_portal: 4.99, maintenance_portal: 4.99 },
  USD: { core: 12.99, voice: 2.99, tenant_portal: 5.99, maintenance_portal: 5.99 },
  EUR: { core: 11.99, voice: 2.49, tenant_portal: 5.49, maintenance_portal: 5.49 },
  AED: { core: 45, voice: 9, tenant_portal: 22, maintenance_portal: 22 },
  ZAR: { core: 179, voice: 39, tenant_portal: 89, maintenance_portal: 89 },
  AUD: { core: 18.99, voice: 3.99, tenant_portal: 8.99, maintenance_portal: 8.99 },
  CAD: { core: 16.99, voice: 3.99, tenant_portal: 7.99, maintenance_portal: 7.99 },
};

const WHOLE = ["AED", "ZAR", "SAR", "QAR", "KWD"];

export function priceDecimals(currency: string): boolean {
  return !WHOLE.includes(currency);
}

export function localPrice(feature: Feature, currency: string): number {
  return (LOCAL_PRICES[currency] ?? LOCAL_PRICES.GBP)[feature];
}

export function fullyLoadedPrice(currency: string): number {
  const p = LOCAL_PRICES[currency] ?? LOCAL_PRICES.GBP;
  return p.core + p.voice + p.tenant_portal + p.maintenance_portal;
}
