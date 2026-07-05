/**
 * SA105 -> HMRC MTD UK Property Business mapping.
 *
 * Maps Lintel's internal SA105 category keys to the HMRC "UK Property" period
 * summary JSON shape (income / expenses objects). This mapping is the single
 * thing most in need of accountant sign-off, see Lintel-accountant-questions.docx.
 *
 * NOTE on Section 24: residential finance costs are reported under
 * `expenses.residentialFinancialCost` and are NOT deducted from profit; HMRC
 * applies the basic-rate tax reducer. They must not be lumped into
 * `expenses.financialCosts` (that field is for non-residential).
 */

export interface PropertyPeriodSummary {
  fromDate: string;
  toDate: string;
  ukProperty: {
    income: Record<string, number>;
    expenses: Record<string, number>;
  };
}

/** Where each SA105 key lands in the HMRC object. */
export const SA105_TO_HMRC: Record<string, { group: "income" | "expenses"; field: string }> = {
  rents: { group: "income", field: "periodAmount" },
  premiums_lease: { group: "income", field: "premiumsOfLeaseGrant" },
  other_property_income: { group: "income", field: "otherIncome" },
  rent_rates_insurance: { group: "expenses", field: "premisesRunningCosts" },
  repairs_maintenance: { group: "expenses", field: "repairsAndMaintenance" },
  // Box 36: residential replacement-of-domestic-items relief. Deductible (unlike Section 24).
  // Placed in the itemised "other" bucket pending accountant sign-off on the exact MTD field.
  replacing_domestic_items: { group: "expenses", field: "other" },
  finance_costs: { group: "expenses", field: "residentialFinancialCost" },
  legal_management_other: { group: "expenses", field: "professionalFees" },
  services_provided: { group: "expenses", field: "costOfServices" },
  other_expenses: { group: "expenses", field: "other" },
};

export interface LedgerLine {
  sa105_category: string | null;
  direction: "income" | "expense";
  amount: number;
}

/** Build an HMRC period summary from ledger lines for a period. */
export function buildPeriodSummary(
  fromDate: string,
  toDate: string,
  lines: LedgerLine[]
): PropertyPeriodSummary {
  const income: Record<string, number> = {};
  const expenses: Record<string, number> = {};

  for (const line of lines) {
    const map = line.sa105_category ? SA105_TO_HMRC[line.sa105_category] : undefined;
    const amount = round2(Number(line.amount) || 0);
    if (!map) {
      // Unmapped lines fall back to a generic bucket by direction.
      const bucket = line.direction === "income" ? income : expenses;
      const field = line.direction === "income" ? "otherIncome" : "other";
      bucket[field] = round2((bucket[field] ?? 0) + amount);
      continue;
    }
    const bucket = map.group === "income" ? income : expenses;
    bucket[map.field] = round2((bucket[map.field] ?? 0) + amount);
  }

  return { fromDate, toDate, ukProperty: { income, expenses } };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
