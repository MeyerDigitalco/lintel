export function gbp(value: number | string | null | undefined, decimals = false): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(Number.isFinite(n) ? (n as number) : 0);
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(d: string | Date | null | undefined): number | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export const REGION_LABEL: Record<string, string> = {
  england: "England",
  wales: "Wales",
  scotland: "Scotland",
  northern_ireland: "Northern Ireland",
};

const MONEY_LOCALE: Record<string, string> = { GBP: "en-GB", USD: "en-US", AED: "en-AE", ZAR: "en-ZA", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA", NZD: "en-NZ" };

export function formatMoney(amount: number, currency = "GBP", decimals = false): string {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(MONEY_LOCALE[currency] ?? "en-GB", {
      style: "currency", currency, minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(decimals ? 2 : 0)}`;
  }
}
