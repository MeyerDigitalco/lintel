export type CalcKind =
  | "stamp-duty"
  | "yield"
  | "income-tax"
  | "cgt"
  | "mtd-estimator"
  | "section-24"
  | "mortgage"
  | "rent-increase"
  | "deposit-cap"
  | "epc-checker";

export interface CalcMeta {
  kind: CalcKind;
  slug: string;
  title: string;
  blurb: string;
}

export const CALCULATORS: CalcMeta[] = [
  {
    kind: "stamp-duty",
    slug: "stamp-duty",
    title: "Stamp duty calculator (SDLT / LTT / LBTT)",
    blurb: "Property-transaction tax for England, Wales and Scotland, including the additional-property surcharge.",
  },
  {
    kind: "yield",
    slug: "rental-yield",
    title: "Rental yield calculator",
    blurb: "Gross and net yield from purchase price, rent and running costs.",
  },
  {
    kind: "income-tax",
    slug: "income-tax",
    title: "Income tax calculator",
    blurb: "2025/26 rUK income tax across personal allowance, basic, higher and additional bands.",
  },
  {
    kind: "cgt",
    slug: "capital-gains-tax",
    title: "Capital gains tax calculator",
    blurb: "CGT on residential property at 18% / 24% with the £3,000 annual exemption.",
  },
  {
    kind: "mtd-estimator",
    slug: "mtd-estimator",
    title: "Making Tax Digital estimator",
    blurb: "When MTD for Income Tax applies to you, based on qualifying income.",
  },
  {
    kind: "section-24",
    slug: "section-24",
    title: "Section 24 finance-cost calculator",
    blurb: "Your 20% basic-rate tax reducer on mortgage interest and finance costs.",
  },
  {
    kind: "mortgage",
    slug: "mortgage",
    title: "Mortgage calculator",
    blurb: "Repayment and interest-only monthly payments for a buy-to-let mortgage.",
  },
  {
    kind: "rent-increase",
    slug: "rent-increase",
    title: "Rent increase calculator",
    blurb: "New rent and monthly difference for a percentage increase.",
  },
  {
    kind: "deposit-cap",
    slug: "deposit-cap",
    title: "Deposit cap calculator",
    blurb: "Maximum deposit you can take, by nation.",
  },
  {
    kind: "epc-checker",
    slug: "epc-checker",
    title: "EPC / MEES checker",
    blurb: "Whether an EPC rating meets minimum energy efficiency standards to let.",
  },
];

export function metaFor(slug: string): CalcMeta | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}
