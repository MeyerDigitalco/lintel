export type Direction = "income" | "expense";
export type TaxCategory = { key: string; label: string; direction: Direction; financeCost?: boolean };

const inc = (key: string, label: string): TaxCategory => ({ key, label, direction: "income" });
const exp = (key: string, label: string, financeCost = false): TaxCategory => ({ key, label, direction: "expense", financeCost });

const GLOBAL_LABELS: Record<string, string> = {
  rents: "Rental income", other_property_income: "Other property income",
  rent_rates_insurance: "Insurance, rates & ground rent", repairs_maintenance: "Repairs & maintenance",
  finance_costs: "Loan interest & finance costs", legal_management_other: "Management, legal & professional fees",
  services_provided: "Services, utilities & wages", taxes: "Property taxes", utilities: "Utilities",
  body_corporate: "Service charges / body corporate", depreciation: "Depreciation / capital allowance",
  advertising: "Advertising & letting", other_expenses: "Other allowable expenses",
};

const INCOME = [inc("rents", "Rental income"), inc("other_property_income", "Other property income")];
const INTL: TaxCategory[] = [
  ...INCOME,
  exp("rent_rates_insurance", "Insurance, rates & ground rent"),
  exp("repairs_maintenance", "Repairs & maintenance"),
  exp("finance_costs", "Loan interest & finance costs", true),
  exp("legal_management_other", "Management, legal & professional fees"),
  exp("services_provided", "Services, utilities & wages"),
  exp("taxes", "Local property taxes"),
  exp("other_expenses", "Other allowable expenses"),
];

const GB: TaxCategory[] = [
  inc("rents", "Rents & other income from property"), inc("premiums_lease", "Premiums for the grant of a lease"),
  inc("other_property_income", "Other property income"),
  exp("rent_rates_insurance", "Rent, rates, insurance, ground rents"),
  exp("repairs_maintenance", "Property repairs & maintenance"),
  exp("finance_costs", "Loan interest & other finance costs", true),
  exp("legal_management_other", "Legal, management & other professional fees"),
  exp("services_provided", "Costs of services provided, incl. wages"),
  exp("other_expenses", "Other allowable property expenses"),
];

const US: TaxCategory[] = [
  inc("rents", "Rents received"), inc("other_property_income", "Other rental income"),
  exp("rent_rates_insurance", "Insurance"), exp("repairs_maintenance", "Repairs & maintenance"),
  exp("finance_costs", "Mortgage interest", true), exp("legal_management_other", "Management, legal & professional fees"),
  exp("services_provided", "Cleaning, utilities & supplies"), exp("taxes", "Property taxes"),
  exp("depreciation", "Depreciation"), exp("other_expenses", "Other expenses"),
];

const ZA: TaxCategory[] = [
  ...INCOME, exp("taxes", "Rates & taxes"), exp("finance_costs", "Bond interest", true),
  exp("repairs_maintenance", "Repairs & maintenance"), exp("body_corporate", "Levies"),
  exp("rent_rates_insurance", "Insurance"), exp("legal_management_other", "Agent & management fees"),
  exp("other_expenses", "Other expenses"),
];

const IL: TaxCategory[] = [
  inc("rents", "Rental income (דמי שכירות)"), inc("other_property_income", "Other property income"),
  exp("repairs_maintenance", "Repairs & maintenance (תיקונים)"), exp("finance_costs", "Mortgage interest (ריבית משכנתא)", true),
  exp("legal_management_other", "Management, legal & brokerage (ניהול ותיווך)"), exp("depreciation", "Depreciation (פחת)"),
  exp("rent_rates_insurance", "Building insurance (ביטוח מבנה)"), exp("other_expenses", "Other expenses (הוצאות אחרות)"),
];

const BY_COUNTRY: Record<string, TaxCategory[]> = { GB, US, ZA, IL };

function setFor(country?: string | null): TaxCategory[] {
  return BY_COUNTRY[(country ?? "").toUpperCase()] ?? INTL;
}
export function categoriesForRegion(country: string | null | undefined, direction: Direction): TaxCategory[] {
  return setFor(country).filter((c) => c.direction === direction);
}
export function categoryLabelForRegion(country: string | null | undefined, key: string | null): string {
  if (!key) return "—";
  const set = setFor(country);
  return set.find((c) => c.key === key)?.label ?? GLOBAL_LABELS[key] ?? key;
}
