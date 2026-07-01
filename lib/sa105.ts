/**
 * SA105 (UK property) category mapping for income & expenses.
 * Finance costs are kept separate because of Section 24 (relief is a 20%
 * basic-rate tax reducer, not an allowable deduction).
 */
export type Direction = "income" | "expense";

export interface Sa105Category {
  key: string;
  label: string;
  direction: Direction;
  /** finance_costs is special-cased for Section 24 */
  financeCost?: boolean;
}

export const SA105_CATEGORIES: Sa105Category[] = [
  { key: "rents", label: "Rents & other income from property", direction: "income" },
  { key: "premiums_lease", label: "Premiums for the grant of a lease", direction: "income" },
  { key: "other_property_income", label: "Other property income", direction: "income" },
  { key: "rent_rates_insurance", label: "Rent, rates, insurance, ground rents", direction: "expense" },
  { key: "repairs_maintenance", label: "Property repairs & maintenance", direction: "expense" },
  { key: "finance_costs", label: "Loan interest & other finance costs", direction: "expense", financeCost: true },
  { key: "legal_management_other", label: "Legal, management & other professional fees", direction: "expense" },
  { key: "services_provided", label: "Costs of services provided, incl. wages", direction: "expense" },
  { key: "other_expenses", label: "Other allowable property expenses", direction: "expense" },
];

export function categoriesFor(direction: Direction) {
  return SA105_CATEGORIES.filter((c) => c.direction === direction);
}

export function categoryLabel(key: string | null) {
  return SA105_CATEGORIES.find((c) => c.key === key)?.label ?? key ?? "-";
}

/** HMRC approved mileage rates (cars/vans), first 10,000 miles then above. */
export const MILEAGE_RATE_FIRST_10K = 0.45;
export const MILEAGE_RATE_ABOVE_10K = 0.25;

export function mileageAllowance(miles: number): number {
  const first = Math.min(miles, 10000) * MILEAGE_RATE_FIRST_10K;
  const rest = Math.max(0, miles - 10000) * MILEAGE_RATE_ABOVE_10K;
  return Math.round((first + rest) * 100) / 100;
}
