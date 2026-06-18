export interface Currency { code: string; symbol: string; locale: string; }

export const CURRENCIES: Record<string, Currency> = {
  GBP: { code: "GBP", symbol: "£", locale: "en-GB" },
  USD: { code: "USD", symbol: "$", locale: "en-US" },
  AED: { code: "AED", symbol: "AED", locale: "en-AE" },
  ZAR: { code: "ZAR", symbol: "R", locale: "en-ZA" },
  EUR: { code: "EUR", symbol: "€", locale: "en-IE" },
  SAR: { code: "SAR", symbol: "SAR", locale: "en" },
  QAR: { code: "QAR", symbol: "QAR", locale: "en" },
  KWD: { code: "KWD", symbol: "KWD", locale: "en" },
  AUD: { code: "AUD", symbol: "A$", locale: "en-AU" },
  CAD: { code: "CAD", symbol: "C$", locale: "en-CA" },
  NZD: { code: "NZD", symbol: "NZ$", locale: "en-NZ" },
  INR: { code: "INR", symbol: "₹", locale: "en-IN" },
  SGD: { code: "SGD", symbol: "S$", locale: "en-SG" },
  CHF: { code: "CHF", symbol: "CHF", locale: "de-CH" },
  JPY: { code: "JPY", symbol: "¥", locale: "ja-JP" },
  MXN: { code: "MXN", symbol: "MX$", locale: "es-MX" },
  BRL: { code: "BRL", symbol: "R$", locale: "pt-BR" },
  PLN: { code: "PLN", symbol: "zł", locale: "pl-PL" },
  HKD: { code: "HKD", symbol: "HK$", locale: "en-HK" },
};

// ISO country code -> default currency.
export const COUNTRY_CURRENCY: Record<string, string> = {
  GB: "GBP", US: "USD", AE: "AED", ZA: "ZAR",
  IE: "EUR", SA: "SAR", QA: "QAR", KW: "KWD",
  AU: "AUD", CA: "CAD", NZ: "NZD",
  DE: "EUR", ES: "EUR", IN: "INR",
  FR: "EUR", NL: "EUR", SG: "SGD",
  IT: "EUR", PT: "EUR", CH: "CHF", JP: "JPY", MX: "MXN", BR: "BRL",
  BE: "EUR", AT: "EUR", PL: "PLN", HK: "HKD",
};

export function currencyForCountry(cc?: string | null): string {
  if (!cc) return "GBP";
  return COUNTRY_CURRENCY[cc.toUpperCase()] ?? "GBP";
}

export function formatMoney(amount: number, code = "GBP", opts: { decimals?: boolean } = {}): string {
  const c = CURRENCIES[code] ?? CURRENCIES.GBP;
  try {
    return new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.code,
      minimumFractionDigits: opts.decimals ? 2 : 0,
      maximumFractionDigits: opts.decimals ? 2 : 0,
    }).format(isFinite(amount) ? amount : 0);
  } catch {
    return `${c.symbol}${(isFinite(amount) ? amount : 0).toFixed(opts.decimals ? 2 : 0)}`;
  }
}
