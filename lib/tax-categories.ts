import { SA105_CATEGORIES, type Direction } from "@/lib/sa105";

export type TaxCategory = { key: string; label: string; direction: Direction; financeCost?: boolean };

// Shorthand builders.
const inc = (key: string, label: string): TaxCategory => ({ key, label, direction: "income" });
const exp = (key: string, label: string, financeCost = false): TaxCategory => ({ key, label, direction: "expense", financeCost });

// Default labels for every key we use, so any key resolves to a readable name
// even when a transaction is viewed from a different region.
const GLOBAL_LABELS: Record<string, string> = {
  rents: "Rental income",
  other_property_income: "Other property income",
  rent_rates_insurance: "Insurance, rates & ground rent",
  repairs_maintenance: "Repairs & maintenance",
  finance_costs: "Loan interest & finance costs",
  legal_management_other: "Management, legal & professional fees",
  services_provided: "Services, utilities & wages",
  taxes: "Property taxes",
  utilities: "Utilities",
  body_corporate: "Service charges / body corporate",
  depreciation: "Depreciation / capital allowance",
  advertising: "Advertising & letting",
  other_expenses: "Other allowable expenses",
};

// Common income pair reused by most schemes.
const INCOME = [inc("rents", "Rental income"), inc("other_property_income", "Other property income")];

// Generic international set (fallback).
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

const BY_COUNTRY: Record<string, TaxCategory[]> = {
  // United Kingdom — SA105 (kept from the canonical source).
  GB: SA105_CATEGORIES as TaxCategory[],

  // United States — Schedule E.
  // Israel — rental income (Form 1301). Deductions/depreciation apply on the
  // marginal track; the 10% flat track allows none.
  IL: [
    inc("rents", "Rental income (דמי שכירות)"), inc("other_property_income", "Other property income"),
    exp("repairs_maintenance", "Repairs & maintenance (תיקונים)"),
    exp("finance_costs", "Mortgage interest (ריבית משכנתא)", true),
    exp("legal_management_other", "Management, legal & brokerage (ניהול ותיווך)"),
    exp("depreciation", "Depreciation (פחת)"),
    exp("rent_rates_insurance", "Building insurance (ביטוח מבנה)"),
    exp("other_expenses", "Other expenses (הוצאות אחרות)"),
  ],

  US: [
    inc("rents", "Rents received"), inc("other_property_income", "Other rental income"),
    exp("rent_rates_insurance", "Insurance"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("finance_costs", "Mortgage interest", true),
    exp("legal_management_other", "Management, legal & professional fees"),
    exp("services_provided", "Cleaning, utilities & supplies"),
    exp("taxes", "Property taxes"),
    exp("depreciation", "Depreciation"),
    exp("other_expenses", "Other expenses"),
  ],

  // Canada — T776 Statement of Real Estate Rentals.
  CA: [
    ...INCOME,
    exp("advertising", "Advertising"),
    exp("rent_rates_insurance", "Insurance"),
    exp("finance_costs", "Mortgage interest", true),
    exp("legal_management_other", "Management & administration fees"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("taxes", "Property taxes"),
    exp("utilities", "Utilities"),
    exp("depreciation", "Capital cost allowance (CCA)"),
    exp("other_expenses", "Other expenses"),
  ],

  // Australia — ATO rental schedule.
  AU: [
    ...INCOME,
    exp("advertising", "Advertising for tenants"),
    exp("body_corporate", "Body corporate fees"),
    exp("taxes", "Council & water rates, land tax"),
    exp("rent_rates_insurance", "Insurance"),
    exp("finance_costs", "Interest on loans", true),
    exp("legal_management_other", "Property agent fees & commission"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("depreciation", "Capital works & depreciation"),
    exp("other_expenses", "Other rental deductions"),
  ],

  // New Zealand.
  NZ: [
    ...INCOME,
    exp("taxes", "Rates"),
    exp("rent_rates_insurance", "Insurance"),
    exp("finance_costs", "Interest (limited deductibility)", true),
    exp("legal_management_other", "Property management & accounting fees"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("other_expenses", "Other expenses"),
  ],

  // Ireland — Form 11 rental.
  IE: [
    ...INCOME,
    exp("rent_rates_insurance", "Insurance"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & letting agent fees"),
    exp("finance_costs", "Mortgage interest", true),
    exp("services_provided", "Services & utilities paid"),
    exp("other_expenses", "Other expenses"),
  ],

  // Germany — Anlage V.
  DE: [
    inc("rents", "Rental income (Mieteinnahmen)"), inc("other_property_income", "Other income"),
    exp("depreciation", "Depreciation (AfA)"),
    exp("finance_costs", "Debt interest (Schuldzinsen)", true),
    exp("repairs_maintenance", "Maintenance (Erhaltungsaufwand)"),
    exp("legal_management_other", "Administration costs (Verwaltungskosten)"),
    exp("taxes", "Property tax (Grundsteuer)"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Spain.
  ES: [
    ...INCOME,
    exp("taxes", "Property tax (IBI)"),
    exp("body_corporate", "Community fees (comunidad)"),
    exp("repairs_maintenance", "Repairs & conservation"),
    exp("finance_costs", "Mortgage interest", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("legal_management_other", "Management & agency fees"),
    exp("depreciation", "Amortisation (amortización)"),
    exp("other_expenses", "Other deductible expenses"),
  ],

  // India — Income from House Property.
  IN: [
    ...INCOME,
    exp("taxes", "Municipal taxes paid"),
    exp("finance_costs", "Home loan interest", true),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & other charges"),
    exp("other_expenses", "Other expenses"),
  ],

  // France — revenus fonciers (régime réel).
  FR: [
    inc("rents", "Rents (loyers)"), inc("other_property_income", "Other income"),
    exp("taxes", "Property tax (taxe foncière)"),
    exp("finance_costs", "Loan interest (intérêts d'emprunt)", true),
    exp("repairs_maintenance", "Works & repairs (travaux)"),
    exp("legal_management_other", "Management fees (frais de gestion)"),
    exp("rent_rates_insurance", "Insurance (assurance)"),
    exp("other_expenses", "Other deductible charges"),
  ],

  // Netherlands.
  NL: [
    ...INCOME,
    exp("repairs_maintenance", "Maintenance (onderhoud)"),
    exp("legal_management_other", "Management & letting costs"),
    exp("finance_costs", "Finance costs", true),
    exp("taxes", "Property taxes (OZB)"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Singapore.
  SG: [
    ...INCOME,
    exp("taxes", "Property tax"),
    exp("finance_costs", "Mortgage interest", true),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Agent commission & management"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other deductible expenses"),
  ],

  // Italy.
  IT: [
    inc("rents", "Rents (canoni di locazione)"), inc("other_property_income", "Other income"),
    exp("taxes", "Property tax (IMU)"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("body_corporate", "Condominium fees"),
    exp("finance_costs", "Loan interest", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other expenses"),
  ],

  // Portugal — Categoria F.
  PT: [
    ...INCOME,
    exp("taxes", "Property tax (IMI)"),
    exp("body_corporate", "Condominium charges"),
    exp("repairs_maintenance", "Maintenance & repairs"),
    exp("rent_rates_insurance", "Insurance"),
    exp("legal_management_other", "Management fees"),
    exp("other_expenses", "Other expenses"),
  ],

  // Switzerland.
  CH: [
    ...INCOME,
    exp("repairs_maintenance", "Maintenance & upkeep"),
    exp("finance_costs", "Mortgage interest", true),
    exp("legal_management_other", "Administration costs"),
    exp("taxes", "Property tax"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Japan.
  JP: [
    ...INCOME,
    exp("depreciation", "Depreciation (減価償却)"),
    exp("repairs_maintenance", "Repairs (修繕費)"),
    exp("legal_management_other", "Management fees (管理費)"),
    exp("finance_costs", "Loan interest", true),
    exp("taxes", "Property tax (固定資産税)"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other expenses"),
  ],

  // Mexico.
  MX: [
    ...INCOME,
    exp("taxes", "Property tax (predial)"),
    exp("repairs_maintenance", "Maintenance & repairs"),
    exp("legal_management_other", "Management & administration"),
    exp("finance_costs", "Mortgage interest", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other deductions"),
  ],

  // Brazil.
  BR: [
    ...INCOME,
    exp("taxes", "Property tax (IPTU)"),
    exp("body_corporate", "Condominium fees"),
    exp("legal_management_other", "Agency & management fees"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("other_expenses", "Other expenses"),
  ],

  // Belgium.
  BE: [
    ...INCOME,
    exp("repairs_maintenance", "Maintenance & repairs"),
    exp("finance_costs", "Loan interest", true),
    exp("legal_management_other", "Management costs"),
    exp("taxes", "Property tax (précompte immobilier)"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Austria.
  AT: [
    ...INCOME,
    exp("depreciation", "Depreciation (AfA)"),
    exp("finance_costs", "Loan interest", true),
    exp("repairs_maintenance", "Maintenance & repairs"),
    exp("legal_management_other", "Management costs"),
    exp("taxes", "Property tax (Grundsteuer)"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Poland.
  PL: [
    ...INCOME,
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & administration"),
    exp("finance_costs", "Loan interest", true),
    exp("taxes", "Property tax"),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other expenses"),
  ],

  // South Africa.
  ZA: [
    ...INCOME,
    exp("taxes", "Rates & taxes"),
    exp("finance_costs", "Bond interest", true),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("body_corporate", "Levies"),
    exp("rent_rates_insurance", "Insurance"),
    exp("legal_management_other", "Agent & management fees"),
    exp("other_expenses", "Other expenses"),
  ],

  // United Arab Emirates (record-keeping; corporate tax may apply to businesses).
  AE: [
    ...INCOME,
    exp("body_corporate", "Service charges"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & agency fees"),
    exp("finance_costs", "Finance costs", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Saudi Arabia (record-keeping).
  SA: [
    ...INCOME,
    exp("body_corporate", "Service charges"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & agency fees"),
    exp("finance_costs", "Finance costs", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Qatar (record-keeping).
  QA: [
    ...INCOME,
    exp("body_corporate", "Service charges"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("legal_management_other", "Management & agency fees"),
    exp("finance_costs", "Finance costs", true),
    exp("rent_rates_insurance", "Insurance"),
    exp("other_expenses", "Other costs"),
  ],

  // Hong Kong — Property Tax.
  HK: [
    ...INCOME,
    exp("taxes", "Rates paid by owner"),
    exp("repairs_maintenance", "Repairs & maintenance"),
    exp("body_corporate", "Management fees"),
    exp("finance_costs", "Mortgage interest", true),
    exp("other_expenses", "Other expenses"),
  ],
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
  return set.find((c) => c.key === key)?.label ?? GLOBAL_LABELS[key] ?? key;
}

export function isFinanceCostKey(key: string | null): boolean {
  return key === "finance_costs";
}
