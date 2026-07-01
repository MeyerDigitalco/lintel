/**
 * Public calculator engine, UK property tax & finance.
 *
 * Rates current for the 2025/26 tax year (verified June 2026). These are
 * indicative tools, not advice, every calculator UI must carry a
 * "not tax/financial advice" disclaimer. Keep rate tables here so they can be
 * updated in one place each Budget.
 */

export interface Band {
  /** upper bound of the band (inclusive); null = no upper bound */
  upTo: number | null;
  rate: number; // as a decimal, e.g. 0.05
}

/** Progressive band calculation over a value. */
export function applyBands(value: number, bands: Band[]): number {
  let tax = 0;
  let lower = 0;
  for (const band of bands) {
    const upper = band.upTo ?? Infinity;
    if (value > lower) {
      const taxable = Math.min(value, upper) - lower;
      tax += taxable * band.rate;
    }
    lower = upper;
    if (value <= upper) break;
  }
  return Math.round(tax * 100) / 100;
}

// ---------------------------------------------------------------------------
// SDLT (England & Northern Ireland), 2025/26
// ---------------------------------------------------------------------------
const SDLT_STANDARD: Band[] = [
  { upTo: 125000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 925000, rate: 0.05 },
  { upTo: 1500000, rate: 0.1 },
  { upTo: null, rate: 0.12 },
];

const SDLT_FTB: Band[] = [
  { upTo: 300000, rate: 0 },
  { upTo: 500000, rate: 0.05 },
  { upTo: null, rate: 0.12 }, // FTB relief lost above £500k → standard applies
];

export const SDLT_ADDITIONAL_SURCHARGE = 0.05; // second homes / BTL, from 31 Oct 2024

export function calcSDLT(
  price: number,
  opts: { firstTimeBuyer?: boolean; additionalProperty?: boolean } = {}
): number {
  // FTB relief is unavailable above £500k and never combines with the surcharge.
  if (opts.firstTimeBuyer && price <= 500000 && !opts.additionalProperty) {
    return applyBands(price, SDLT_FTB);
  }
  let tax = applyBands(price, SDLT_STANDARD);
  if (opts.additionalProperty) tax += price * SDLT_ADDITIONAL_SURCHARGE;
  return Math.round(tax * 100) / 100;
}

// ---------------------------------------------------------------------------
// LBTT (Scotland), 2025/26
// ---------------------------------------------------------------------------
const LBTT_STANDARD: Band[] = [
  { upTo: 145000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 325000, rate: 0.05 },
  { upTo: 750000, rate: 0.1 },
  { upTo: null, rate: 0.12 },
];

const LBTT_FTB: Band[] = [
  { upTo: 175000, rate: 0 },
  { upTo: 250000, rate: 0.02 },
  { upTo: 325000, rate: 0.05 },
  { upTo: 750000, rate: 0.1 },
  { upTo: null, rate: 0.12 },
];

export const LBTT_ADS = 0.08; // Additional Dwelling Supplement, from 5 Dec 2024

export function calcLBTT(
  price: number,
  opts: { firstTimeBuyer?: boolean; additionalProperty?: boolean } = {}
): number {
  let tax = applyBands(price, opts.firstTimeBuyer ? LBTT_FTB : LBTT_STANDARD);
  if (opts.additionalProperty) tax += price * LBTT_ADS;
  return Math.round(tax * 100) / 100;
}

// ---------------------------------------------------------------------------
// LTT (Wales), 2025/26 (no first-time buyer relief)
// ---------------------------------------------------------------------------
const LTT_STANDARD: Band[] = [
  { upTo: 225000, rate: 0 },
  { upTo: 400000, rate: 0.06 },
  { upTo: 750000, rate: 0.075 },
  { upTo: 1500000, rate: 0.1 },
  { upTo: null, rate: 0.12 },
];

// Higher residential rates (additional dwellings), from 11 Dec 2024.
const LTT_HIGHER: Band[] = [
  { upTo: 180000, rate: 0.05 },
  { upTo: 250000, rate: 0.085 },
  { upTo: 400000, rate: 0.1 },
  { upTo: 750000, rate: 0.125 },
  { upTo: 1500000, rate: 0.15 },
  { upTo: null, rate: 0.17 },
];

export function calcLTT(
  price: number,
  opts: { additionalProperty?: boolean } = {}
): number {
  return applyBands(price, opts.additionalProperty ? LTT_HIGHER : LTT_STANDARD);
}

/** Dispatch the right property-transaction tax by nation. */
export function calcTransactionTax(
  jurisdiction: "england" | "wales" | "scotland" | "northern_ireland",
  price: number,
  opts: { firstTimeBuyer?: boolean; additionalProperty?: boolean } = {}
): { name: string; tax: number } {
  switch (jurisdiction) {
    case "scotland":
      return { name: "LBTT", tax: calcLBTT(price, opts) };
    case "wales":
      return { name: "LTT", tax: calcLTT(price, opts) };
    default:
      return { name: "SDLT", tax: calcSDLT(price, opts) };
  }
}

// ---------------------------------------------------------------------------
// Income tax (rUK bands), 2025/26
// ---------------------------------------------------------------------------
export const PERSONAL_ALLOWANCE = 12570;
const PA_TAPER_THRESHOLD = 100000;

/** Personal allowance tapers by £1 for every £2 over £100,000. */
export function personalAllowance(income: number): number {
  if (income <= PA_TAPER_THRESHOLD) return PERSONAL_ALLOWANCE;
  const reduction = Math.floor((income - PA_TAPER_THRESHOLD) / 2);
  return Math.max(0, PERSONAL_ALLOWANCE - reduction);
}

export function calcIncomeTax(taxableIncome: number): number {
  const pa = personalAllowance(taxableIncome);
  const afterPa = Math.max(0, taxableIncome - pa);
  // Bands measured from the end of the personal allowance.
  const bands: Band[] = [
    { upTo: 50270 - pa, rate: 0.2 },
    { upTo: 125140 - pa, rate: 0.4 },
    { upTo: null, rate: 0.45 },
  ];
  return applyBands(afterPa, bands);
}

// ---------------------------------------------------------------------------
// CGT on residential property, 2025/26
// ---------------------------------------------------------------------------
export const CGT_ANNUAL_EXEMPT = 3000;
export const CGT_BASIC_RATE = 0.18;
export const CGT_HIGHER_RATE = 0.24;

export function calcCGT(
  gain: number,
  opts: { otherIncome?: number } = {}
): number {
  const taxableGain = Math.max(0, gain - CGT_ANNUAL_EXEMPT);
  if (taxableGain === 0) return 0;
  const income = opts.otherIncome ?? 0;
  const basicBandRemaining = Math.max(0, 50270 - Math.max(income, PERSONAL_ALLOWANCE));
  const atBasic = Math.min(taxableGain, basicBandRemaining);
  const atHigher = taxableGain - atBasic;
  return (
    Math.round((atBasic * CGT_BASIC_RATE + atHigher * CGT_HIGHER_RATE) * 100) / 100
  );
}

// ---------------------------------------------------------------------------
// Section 24, finance-cost relief as a 20% basic-rate tax reducer
// ---------------------------------------------------------------------------
export const SECTION_24_REDUCER = 0.2;

export function calcSection24Reducer(financeCosts: number): number {
  return Math.round(financeCosts * SECTION_24_REDUCER * 100) / 100;
}

// ---------------------------------------------------------------------------
// Rental yield
// ---------------------------------------------------------------------------
export function calcGrossYield(annualRent: number, price: number): number {
  if (price <= 0) return 0;
  return Math.round((annualRent / price) * 10000) / 100; // %
}

export function calcNetYield(
  annualRent: number,
  annualCosts: number,
  price: number
): number {
  if (price <= 0) return 0;
  return Math.round(((annualRent - annualCosts) / price) * 10000) / 100;
}

// ---------------------------------------------------------------------------
// Mortgage (repayment) monthly payment
// ---------------------------------------------------------------------------
export function calcMortgageMonthly(
  principal: number,
  annualRatePct: number,
  termYears: number
): number {
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return Math.round((principal / n) * 100) / 100;
  const m = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(m * 100) / 100;
}

/** Interest-only monthly payment (common for BTL). */
export function calcInterestOnlyMonthly(
  principal: number,
  annualRatePct: number
): number {
  return Math.round(((principal * annualRatePct) / 100 / 12) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Rent increase
// ---------------------------------------------------------------------------
export function calcRentIncrease(
  currentRent: number,
  pct: number
): { newRent: number; monthlyDelta: number } {
  const newRent = Math.round(currentRent * (1 + pct / 100) * 100) / 100;
  return { newRent, monthlyDelta: Math.round((newRent - currentRent) * 100) / 100 };
}

// ---------------------------------------------------------------------------
// Deposit cap (by nation)
// ---------------------------------------------------------------------------
export function calcDepositCap(
  jurisdiction: "england" | "wales" | "scotland" | "northern_ireland",
  annualRent: number
): { cap: number; basis: string } {
  const weeklyRent = annualRent / 52;
  const monthlyRent = annualRent / 12;
  switch (jurisdiction) {
    case "scotland":
      return {
        cap: Math.round(monthlyRent * 2 * 100) / 100,
        basis: "Maximum 2 months' rent",
      };
    case "england": {
      const weeks = annualRent < 50000 ? 5 : 6;
      return {
        cap: Math.round(weeklyRent * weeks * 100) / 100,
        basis: `${weeks} weeks' rent (annual rent ${annualRent < 50000 ? "<" : "≥"} £50,000)`,
      };
    }
    default:
      // Wales & NI are set per contract/scheme; show a 5-week guide.
      return {
        cap: Math.round(weeklyRent * 5 * 100) / 100,
        basis: "Guide only, set per contract / deposit scheme",
      };
  }
}

// ---------------------------------------------------------------------------
// MTD ITSA estimator, which mandation band & when
// ---------------------------------------------------------------------------
export function mtdMandation(qualifyingIncome: number): {
  mandated: boolean;
  band: number | null;
  from: string | null;
} {
  if (qualifyingIncome >= 50000)
    return { mandated: true, band: 50000, from: "6 April 2026" };
  if (qualifyingIncome >= 30000)
    return { mandated: true, band: 30000, from: "6 April 2027" };
  if (qualifyingIncome >= 20000)
    return { mandated: true, band: 20000, from: "6 April 2028" };
  return { mandated: false, band: null, from: null };
}
