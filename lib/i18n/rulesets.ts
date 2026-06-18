import { resolveJurisdiction, type JurisdictionKey, type JurisdictionRules } from "@/lib/jurisdictions";

// A normalised, display-friendly ruleset that works for any country. The deep
// UK engine (lib/jurisdictions) still drives UK notices/compliance; this layer
// gives US / UAE / South Africa their own tenancy, deposit, compliance and tax
// framing. Guidance only — not legal or tax advice.
export interface RegionRuleset {
  country: string;
  countryName: string;
  subregionName?: string;
  currency: string;
  governingLaw: string;
  tenancyTerm: string;
  depositTerm: string;
  taxLabel: string;
  tenancyTypes: { label: string; description: string }[];
  compliance: { label: string; note: string }[];
  deposit: { cap: string; protection: string };
  checklist: string[];
  notes: string[];
}

const US: RegionRuleset = {
  country: "US",
  countryName: "United States",
  currency: "USD",
  governingLaw: "State landlord–tenant law + the federal Fair Housing Act",
  tenancyTerm: "lease",
  depositTerm: "security deposit",
  taxLabel: "Schedule E (Form 1040)",
  tenancyTypes: [
    { label: "Fixed-term lease", description: "A lease for a set term (commonly 12 months) that then renews or ends." },
    { label: "Month-to-month", description: "Rolling tenancy terminable on state-set notice (often 30 days)." },
  ],
  compliance: [
    { label: "Lead-based paint disclosure", note: "Required for housing built before 1978 (EPA/HUD) — disclosure + pamphlet." },
    { label: "Smoke & CO detectors", note: "Working detectors required; specifics vary by state and city." },
    { label: "Warranty of habitability", note: "Property must be safe and livable; repairs within reasonable time." },
    { label: "Security deposit handling", note: "Many states cap the amount and require separate/interest-bearing accounts and itemised deductions." },
    { label: "Fair Housing compliance", note: "No discrimination on protected classes (race, religion, disability, familial status, etc.)." },
  ],
  deposit: { cap: "Varies by state — often 1–2 months' rent; some states uncapped.", protection: "Return within state deadline (often 14–30 days) with an itemised statement." },
  checklist: ["Written lease", "Lead paint disclosure (pre-1978)", "Move-in inspection / condition report", "State-required disclosures (mold, bedbugs, etc.)"],
  notes: [
    "Deposit caps, notice periods and just-cause eviction rules differ by state (e.g. CA, OR, NY have stronger tenant protections).",
    "Report rental income and expenses on Schedule E; depreciate the building; issue 1099-NEC to contractors paid $600+.",
  ],
};

const UAE: RegionRuleset = {
  country: "AE",
  countryName: "United Arab Emirates",
  currency: "AED",
  governingLaw: "Emirate rental laws & RERA (e.g. Dubai Law No. 26/2007 & 33/2008)",
  tenancyTerm: "tenancy contract",
  depositTerm: "security deposit",
  taxLabel: "VAT records (residential rent generally exempt)",
  tenancyTypes: [
    { label: "Annual tenancy contract", description: "Standard 12-month contract, renewable; registered with the authority." },
  ],
  compliance: [
    { label: "Ejari / Tawtheeq registration", note: "Tenancy contracts must be registered (Ejari in Dubai, Tawtheeq in Abu Dhabi)." },
    { label: "RERA rental index", note: "Rent increases are capped by the official rental index calculator." },
    { label: "Utilities (DEWA/ADDC)", note: "Connection and clearance handled at move-in/out." },
    { label: "Eviction notice", note: "Eviction generally requires 12 months' notarised/registered notice on valid grounds." },
  ],
  deposit: { cap: "Typically 5% of annual rent (unfurnished) or 10% (furnished).", protection: "Refundable at end of contract less damages; no statutory scheme." },
  checklist: ["Tenancy contract", "Ejari/Tawtheeq registration", "Title deed copy", "Tenant passport / Emirates ID", "Post-dated cheque schedule"],
  notes: [
    "Rent is commonly paid by 1–4 post-dated cheques per year.",
    "No personal income tax; VAT applies to commercial property, residential leases are generally exempt or zero-rated.",
  ],
};

const ZA: RegionRuleset = {
  country: "ZA",
  countryName: "South Africa",
  currency: "ZAR",
  governingLaw: "Rental Housing Act 50 of 1999 + Consumer Protection Act",
  tenancyTerm: "lease",
  depositTerm: "deposit",
  taxLabel: "ITR12 / provisional tax",
  tenancyTypes: [
    { label: "Fixed-term lease", description: "Lease for a set period; CPA allows early cancellation on 20 business days' notice." },
    { label: "Month-to-month", description: "Rolling lease terminable on one month's notice." },
  ],
  compliance: [
    { label: "Written lease on request", note: "A lease must be reduced to writing if the tenant requests it." },
    { label: "Deposit in interest-bearing account", note: "Deposit must be invested; interest accrues to the tenant." },
    { label: "Incoming & outgoing inspections", note: "Joint inspections required at start and end; defects list recorded." },
    { label: "Consumer Protection Act", note: "Applies to most leases — fair terms, cancellation rights, disclosures." },
  ],
  deposit: { cap: "No statutory cap (commonly 1–2 months' rent).", protection: "Held in an interest-bearing account; returned with interest within 7–14 days after the outgoing inspection." },
  checklist: ["Written lease", "Incoming inspection report", "Deposit receipt", "House rules / body corporate rules"],
  notes: [
    "Deductions must be supported by the outgoing inspection; undisputed balance returned within 7 days.",
    "Declare rental income on your ITR12; provisional taxpayers file twice yearly. Expenses are deductible.",
  ],
};

function ukToRuleset(j: JurisdictionRules, currency = "GBP"): RegionRuleset {
  return {
    country: "GB",
    countryName: j.name,
    currency,
    governingLaw: j.governingLaw,
    tenancyTerm: j.tenancyTypes[0]?.partyLabel === "contract-holder" ? "occupation contract" : "tenancy",
    depositTerm: "deposit",
    taxLabel: "Self Assessment (SA105) / Making Tax Digital",
    tenancyTypes: j.tenancyTypes.map((t) => ({ label: t.label, description: t.description })),
    compliance: j.complianceItems.map((c) => ({ label: c.label, note: c.statutoryBasis })),
    deposit: { cap: j.depositRules.capDescription, protection: `Protect within ${j.depositRules.protectionDeadlineDays} ${j.depositRules.protectionDeadlineBasis} days (${j.depositRules.schemes.join(", ")}).` },
    checklist: j.documentChecklist.map((d) => d.label),
    notes: [
      j.landlordRegistrationScheme ? `Landlord registration: ${j.landlordRegistrationScheme}.` : "No landlord registration scheme.",
      `Disputes: ${j.disputeForum}.`,
    ],
  };
}


interface StateRule {
  name: string;
  depositCap: string;
  depositReturn: string;
  extraCompliance: { label: string; note: string }[];
  extraNotes: string[];
}

const US_STATE_RULES: Record<string, StateRule> = {
  us_ca: {
    name: "California",
    depositCap: "Max 1 month's rent (2 months for small landlords) — AB 12, from July 2024.",
    depositReturn: "Itemised return within 21 days.",
    extraCompliance: [
      { label: "Just-cause eviction & rent cap", note: "AB 1482: increases capped at 5% + CPI (max 10%); just cause required for many units." },
      { label: "State disclosures", note: "Lead paint, Megan's Law, mold, bed bugs, flood zone, Prop 65." },
    ],
    extraNotes: ["Month-to-month notice: 30 days (<1 yr), 60 days (≥1 yr).", "Cities like LA & SF add local rent control."],
  },
  us_tx: {
    name: "Texas",
    depositCap: "No statutory cap.",
    depositReturn: "Itemised return within 30 days.",
    extraCompliance: [
      { label: "Security devices", note: "Landlord must provide statutory locks and smoke detectors." },
      { label: "Repair & remedy", note: "Tenant remedies under Texas Property Code §92 if repairs are ignored." },
    ],
    extraNotes: ["Month-to-month notice: 30 days.", "No state rent control (locally preempted)."],
  },
  us_ny: {
    name: "New York",
    depositCap: "Max 1 month's rent — HSTPA 2019.",
    depositReturn: "Itemised return within 14 days.",
    extraCompliance: [
      { label: "Rent stabilization", note: "NYC and some areas: stabilized units have renewal and increase limits." },
      { label: "State disclosures", note: "Lead paint, bedbug history (NYC), sprinkler, allergen (NYC)." },
    ],
    extraNotes: ["Notice to end: 30 / 60 / 90 days by length of tenancy.", "Good-cause eviction applies in NYC and opt-in localities."],
  },
  us_fl: {
    name: "Florida",
    depositCap: "No statutory cap.",
    depositReturn: "15 days (no deductions) or 30 days with itemised notice.",
    extraCompliance: [{ label: "Deposit holding disclosure", note: "Must disclose where the deposit is held within 30 days." }],
    extraNotes: ["Month-to-month notice: 30 days (15 for weekly).", "No state rent control."],
  },
};

function withState(base: RegionRuleset, code?: string | null): RegionRuleset {
  const rule = code ? US_STATE_RULES[code] : undefined;
  if (!rule) return base;
  return {
    ...base,
    subregionName: rule.name,
    deposit: { cap: rule.depositCap, protection: rule.depositReturn },
    compliance: [...base.compliance, ...rule.extraCompliance],
    notes: [...rule.extraNotes, ...base.notes],
  };
}

export function resolveRegion(country?: string | null, region?: string | null, regionCode?: string | null): RegionRuleset {
  const cc = (country ?? "GB").toUpperCase();
  if (cc === "US") return withState(US, regionCode);
  if (cc === "AE") return UAE;
  if (cc === "ZA") return ZA;
  const key = (["england", "wales", "scotland", "northern_ireland"].includes(region ?? "") ? region : "england") as JurisdictionKey;
  return ukToRuleset(resolveJurisdiction(key));
}

export const INTERNATIONAL_RULESETS = { US, UAE, ZA };
