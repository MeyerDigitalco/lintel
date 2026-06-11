/**
 * MTD abstraction layer.
 *
 * Today: writes HMRC-shaped quarterly summaries + a year-end declaration preview
 * locally. The UI must NOT claim "file to HMRC" until HMRC recognition is granted.
 *
 * Later: a real provider that calls the HMRC MTD ITSA API is swapped in behind
 * the same interface — no UI changes required.
 */

export type SA105Category =
  | "rents"
  | "premiums_lease"
  | "other_property_income"
  | "rent_rates_insurance"
  | "repairs_maintenance"
  | "finance_costs" // Section 24 — 20% reducer, NOT a deduction
  | "legal_management_other"
  | "services_provided"
  | "other_expenses";

/** MTD quarterly period (periods ending 5 Jul / 5 Oct / 5 Jan / 5 Apr). */
export interface QuarterlyPeriod {
  key: string; // e.g. '2026-Q1'
  startDate: string;
  endDate: string;
}

export interface QuarterlySummary {
  period: QuarterlyPeriod;
  income: number;
  expenses: number;
  /** finance costs are reported separately (Section 24) */
  financeCosts: number;
  net: number;
}

export interface MtdProvider {
  /** Build an HMRC-shaped quarterly summary from local transactions. */
  buildQuarterlySummary(
    orgId: string,
    period: QuarterlyPeriod
  ): Promise<QuarterlySummary>;
  /** True once HMRC recognition allows real submission. */
  canSubmit(): boolean;
}

/** Standard MTD quarterly period end dates (tax year 6 Apr – 5 Apr). */
export const QUARTER_END_DATES = ["07-05", "10-05", "01-05", "04-05"] as const;

/** MTD income thresholds by tax year (mandation bands). */
export const MTD_THRESHOLDS: { from: string; band: number }[] = [
  { from: "2026-04-06", band: 50000 },
  { from: "2027-04-06", band: 30000 },
  { from: "2028-04-06", band: 20000 },
];
