// Self-contained region rulesets for mobile (mirrors the web layer). Guidance only.
export interface RegionRuleset {
  countryName: string;
  subregionName?: string;
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
  countryName: "United States",
  governingLaw: "State landlord–tenant law + the federal Fair Housing Act",
  tenancyTerm: "lease", depositTerm: "security deposit", taxLabel: "Schedule E (Form 1040)",
  tenancyTypes: [
    { label: "Fixed-term lease", description: "Set term (often 12 months) that renews or ends." },
    { label: "Month-to-month", description: "Rolling tenancy terminable on state-set notice." },
  ],
  compliance: [
    { label: "Lead-based paint disclosure", note: "Required for housing built before 1978." },
    { label: "Smoke & CO detectors", note: "Working detectors required; varies by state/city." },
    { label: "Warranty of habitability", note: "Property must be safe and livable." },
    { label: "Security deposit handling", note: "Many states cap amount and require itemised deductions." },
    { label: "Fair Housing compliance", note: "No discrimination on protected classes." },
  ],
  deposit: { cap: "Varies by state — often 1–2 months' rent.", protection: "Return within the state deadline with an itemised statement." },
  checklist: ["Written lease", "Lead paint disclosure (pre-1978)", "Move-in inspection", "State-required disclosures"],
  notes: ["Rules differ by state (CA, OR, NY are stronger).", "Report income/expenses on Schedule E; 1099 contractors paid $600+."],
};

const AE: RegionRuleset = {
  countryName: "United Arab Emirates",
  governingLaw: "Emirate rental laws & RERA", tenancyTerm: "tenancy contract", depositTerm: "security deposit",
  taxLabel: "VAT records (residential rent generally exempt)",
  tenancyTypes: [{ label: "Annual tenancy contract", description: "12-month contract, renewable; registered." }],
  compliance: [
    { label: "Ejari / Tawtheeq registration", note: "Tenancy contracts must be registered." },
    { label: "RERA rental index", note: "Rent increases capped by the official index." },
    { label: "Eviction notice", note: "Generally 12 months' notarised notice on valid grounds." },
  ],
  deposit: { cap: "Typically 5% (unfurnished) or 10% (furnished) of annual rent.", protection: "Refundable at end of contract less damages." },
  checklist: ["Tenancy contract", "Ejari/Tawtheeq registration", "Title deed copy", "Tenant ID", "Cheque schedule"],
  notes: ["Rent commonly paid by 1–4 post-dated cheques.", "No personal income tax; residential leases generally VAT-exempt."],
};

const ZA: RegionRuleset = {
  countryName: "South Africa",
  governingLaw: "Rental Housing Act 50 of 1999 + Consumer Protection Act", tenancyTerm: "lease", depositTerm: "deposit",
  taxLabel: "ITR12 / provisional tax",
  tenancyTypes: [
    { label: "Fixed-term lease", description: "Set period; CPA allows 20-business-day cancellation." },
    { label: "Month-to-month", description: "Rolling lease, one month's notice." },
  ],
  compliance: [
    { label: "Written lease on request", note: "Must be in writing if the tenant asks." },
    { label: "Deposit in interest-bearing account", note: "Interest accrues to the tenant." },
    { label: "Incoming & outgoing inspections", note: "Joint inspections required; defects recorded." },
    { label: "Consumer Protection Act", note: "Fair terms, cancellation rights, disclosures." },
  ],
  deposit: { cap: "No statutory cap (commonly 1–2 months' rent).", protection: "Held in interest-bearing account; returned with interest within 7–14 days after outgoing inspection." },
  checklist: ["Written lease", "Incoming inspection report", "Deposit receipt", "House rules"],
  notes: ["Deductions supported by the outgoing inspection.", "Declare income on ITR12; provisional tax twice yearly."],
};

const UK_NAMES: Record<string, string> = { england: "England", wales: "Wales", scotland: "Scotland", northern_ireland: "Northern Ireland" };

function uk(region?: string | null): RegionRuleset {
  const name = UK_NAMES[region ?? "england"] ?? "England";
  return {
    countryName: name,
    governingLaw: region === "scotland" ? "Private Housing (Tenancies) (Scotland) Act 2016" : region === "wales" ? "Renting Homes (Wales) Act 2016" : "Renters' Rights Act 2025",
    tenancyTerm: region === "wales" ? "occupation contract" : "tenancy", depositTerm: "deposit",
    taxLabel: "Self Assessment (SA105) / Making Tax Digital",
    tenancyTypes: [{ label: region === "wales" ? "Occupation contract" : "Assured/periodic tenancy", description: "Standard residential let for this nation." }],
    compliance: [
      { label: "Gas safety certificate", note: "Annual (where gas present)." },
      { label: "EICR (electrical)", note: "Every 5 years." },
      { label: "EPC", note: "Valid certificate required to let." },
      { label: "Deposit protection", note: "Protect in an approved scheme within the deadline." },
    ],
    deposit: { cap: "5 weeks' rent (annual rent < £50k), else 6 weeks.", protection: "Protect within 30 days in an approved scheme." },
    checklist: ["Tenancy agreement", "EPC", "Gas safety certificate", region === "england" ? "Right to Rent check" : "Deposit prescribed information"],
    notes: ["Jurisdiction-correct notices and court-readiness in the web app.", "Records map to SA105 for Self Assessment / MTD."],
  };
}


const US_STATE_RULES: Record<string, { name: string; depositCap: string; depositReturn: string; extra: { label: string; note: string }[]; notes: string[] }> = {
  us_ca: { name: "California", depositCap: "Max 1 month's rent (2 for small landlords) — AB 12.", depositReturn: "Itemised return within 21 days.", extra: [{ label: "Just-cause & rent cap", note: "AB 1482: increases capped 5% + CPI (max 10%); just cause for many units." }, { label: "State disclosures", note: "Lead, Megan's Law, mold, bed bugs, flood, Prop 65." }], notes: ["Notice: 30 days (<1 yr), 60 days (≥1 yr).", "LA & SF add local rent control."] },
  us_tx: { name: "Texas", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extra: [{ label: "Security devices", note: "Statutory locks and smoke detectors required." }], notes: ["Notice: 30 days.", "No state rent control."] },
  us_ny: { name: "New York", depositCap: "Max 1 month's rent — HSTPA 2019.", depositReturn: "Itemised return within 14 days.", extra: [{ label: "Rent stabilization", note: "NYC stabilized units have renewal & increase limits." }], notes: ["Notice: 30/60/90 days by length.", "Good-cause eviction in NYC & opt-in areas."] },
  us_fl: { name: "Florida", depositCap: "No statutory cap.", depositReturn: "15 days (no deductions) or 30 with notice.", extra: [{ label: "Deposit holding disclosure", note: "Disclose where the deposit is held within 30 days." }], notes: ["Notice: 30 days (15 weekly).", "No state rent control."] },
};

function withState(base: RegionRuleset, code?: string | null): RegionRuleset {
  const r = code ? US_STATE_RULES[code] : undefined;
  if (!r) return base;
  return { ...base, subregionName: r.name, deposit: { cap: r.depositCap, protection: r.depositReturn }, compliance: [...base.compliance, ...r.extra], notes: [...r.notes, ...base.notes] };
}

export function resolveRegion(country?: string | null, region?: string | null, regionCode?: string | null): RegionRuleset {
  const cc = (country ?? "GB").toUpperCase();
  if (cc === "US") return withState(US, regionCode);
  if (cc === "AE") return AE;
  if (cc === "ZA") return ZA;
  return uk(region);
}
