import { SA105_CATEGORIES, type Direction } from "@/lib/sa105";

export type TaxCategory = { key: string; label: string; direction: Direction; financeCost?: boolean };

// United States — Schedule E style. Keys reuse the existing ledger keys where
// possible so historical data and exports stay consistent.
const US: TaxCategory[] = [
  { key: "rents", label: "Rents received", direction: "income" },
  { key: "other_property_income", label: "Other rental income", direction: "income" },
  { key: "rent_rates_insurance", label: "Insurance", direction: "expense" },
  { key: "repairs_maintenance", label: "Repairs & maintenance", direction: "expense" },
  { key: "finance_costs", label: "Mortgage interest", direction: "expense", financeCost: true },
  { key: "legal_management_other", label: "Management, legal & professional fees", direction: "expense" },
  { key: "services_provided", label: "Cleaning, utilities & supplies", direction: "expense" },
  { key: "taxes", label: "Property taxes", direction: "expense" },
  { key: "other_expenses", label: "Other expenses", direction: "expense" },
];

// Generic international set for everywhere else.
const INTL: TaxCategory[] = [
  { key: "rents", label: "Rental income", direction: "income" },
  { key: "other_property_income", label: "Other property income", direction: "income" },
  { key: "rent_rates_insurance", label: "Insurance, rates & ground rent", direction: "expense" },
  { key: "repairs_maintenance", label: "Repairs & maintenance", direction: "expense" },
  { key: "finance_costs", label: "Loan interest & finance costs", direction: "expense", financeCost: true },
  { key: "legal_management_other", label: "Management, legal & professional fees", direction: "expense" },
  { key: "services_provided", label: "Services, utilities & wages", direction: "expense" },
  { key: "taxes", label: "Local property taxes", direction: "expense" },
  { key: "other_expenses", label: "Other allowable expenses", direction: "expense" },
];

const BY_COUNTRY: Record<string, TaxCategory[]> = {
  GB: SA105_CATEGORIES as TaxCategory[],
  US: US,
};

function setFor(country?: string | null): TaxCategory[] {
  return BY_COUNTRY[(country ?? "").toUpperCase()] ?? INTL;
}

export function categoriesForRegion(country: string | null | undefined, direction: Direction): TaxCategory[] {
  return setFor(country).filter((c) => c.direction === direction);
}

/** Human label for a stored category key, region-aware with safe fallbacks. */
export function categoryLabelForRegion(country: string | null | undefined, key: string | null): string {
  if (!key) return "—";
  const set = setFor(country);
  return (
    set.find((c) => c.key === key)?.label ??
    (SA105_CATEGORIES as TaxCategory[]).find((c) => c.key === key)?.label ??
    INTL.find((c) => c.key === key)?.label ??
    key
  );
}

export function isFinanceCostKey(key: string | null): boolean {
  return key === "finance_costs";
}
