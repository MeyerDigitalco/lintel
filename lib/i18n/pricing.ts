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
  NZD: { core: 19.99, voice: 3.99, tenant_portal: 8.99, maintenance_portal: 8.99 },
  INR: { core: 799, voice: 149, tenant_portal: 399, maintenance_portal: 399 },
  SGD: { core: 16.99, voice: 3.49, tenant_portal: 7.49, maintenance_portal: 7.49 },
  CHF: { core: 12.99, voice: 2.49, tenant_portal: 5.99, maintenance_portal: 5.99 },
  JPY: { core: 1500, voice: 300, tenant_portal: 700, maintenance_portal: 700 },
  MXN: { core: 199, voice: 39, tenant_portal: 89, maintenance_portal: 89 },
  BRL: { core: 49, voice: 9.9, tenant_portal: 24.9, maintenance_portal: 24.9 },
  SAR: { core: 39, voice: 8, tenant_portal: 19, maintenance_portal: 19 },
  QAR: { core: 39, voice: 8, tenant_portal: 19, maintenance_portal: 19 },
  PLN: { core: 39, voice: 8, tenant_portal: 19, maintenance_portal: 19 },
  HKD: { core: 98, voice: 19, tenant_portal: 49, maintenance_portal: 49 },
  ILS: { core: 39, voice: 8, tenant_portal: 19, maintenance_portal: 19 },
};

const WHOLE = ["AED", "ZAR", "SAR", "QAR", "KWD", "INR", "JPY"];

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
