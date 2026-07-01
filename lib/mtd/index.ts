/**
 * MTD abstraction layer.
 *
 * Today: writes HMRC-shaped quarterly summaries + a year-end declaration preview
 * locally. The UI must NOT claim "file to HMRC" until HMRC recognition is granted.
 *
 * Later: a real provider that calls the HMRC MTD ITSA API is swapped in behind
 * the same interface, no UI changes required. See ./hmrc and ./select.
 */

export type SA105Category =
  | "rents"
  | "premiums_lease"
  | "other_property_income"
  | "rent_rates_insurance"
  | "repairs_maintenance"
  | "finance_costs"
  | "legal_management_other"
  | "services_provided"
  | "other_expenses";

export interface QuarterlyPeriod {
  key: string;
  startDate: string;
  endDate: string;
}

export interface QuarterlySummary {
  period: QuarterlyPeriod;
  income: number;
  expenses: number;
  financeCosts: number;
  net: number;
}

export interface ObligationPeriod {
  periodKey: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: "Open" | "Fulfilled";
}

export interface SubmissionResult {
  ok: boolean;
  reference?: string;
  message?: string;
}

export interface MtdProvider {
  buildQuarterlySummary(orgId: string, period: QuarterlyPeriod): Promise<QuarterlySummary>;
  canSubmit(): boolean;
  getObligations?(orgId: string, taxYear: string): Promise<ObligationPeriod[]>;
  submitQuarterlyUpdate?(orgId: string, period: QuarterlyPeriod): Promise<SubmissionResult>;
  submitFinalDeclaration?(orgId: string, taxYear: string): Promise<SubmissionResult>;
}

export const QUARTER_END_DATES = ["07-05", "10-05", "01-05", "04-05"] as const;

export const MTD_THRESHOLDS: { from: string; band: number }[] = [
  { from: "2026-04-06", band: 50000 },
  { from: "2027-04-06", band: 30000 },
  { from: "2028-04-06", band: 20000 },
];
