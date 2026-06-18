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
  notices: { label: string; when: string; period: string }[];
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
  notices: [
    { label: "Notice to Pay Rent or Quit", when: "Rent unpaid", period: "3-14 days (state-specific)" },
    { label: "Notice to Cure or Quit", when: "Lease violation", period: "Varies by state" },
    { label: "Notice to Terminate (no cause)", when: "End a month-to-month", period: "30-60 days" },
  ],
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
  notices: [
    { label: "Eviction notice", when: "Valid grounds (sale, owner use, demolition)", period: "12 months, notarised/registered" },
    { label: "Notice to vary terms / non-renewal", when: "Change rent or terms at renewal", period: "90 days before expiry (Art. 14)" },
  ],
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
  notices: [
    { label: "Breach notice", when: "Tenant breach (e.g. arrears)", period: "20 business days to remedy" },
    { label: "Cancellation (CPA)", when: "Early cancellation by tenant", period: "20 business days notice" },
    { label: "Notice to vacate", when: "End a month-to-month", period: "1 month" },
  ],
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
    notices: j.noticeTemplates.map((n) => ({ label: n.label, when: n.statutoryBasis, period: n.noticePeriodDays ? `${n.noticePeriodDays} days` : "Grounds-dependent" })),
    notes: [
      j.landlordRegistrationScheme ? `Landlord registration: ${j.landlordRegistrationScheme}.` : "No landlord registration scheme.",
      `Disputes: ${j.disputeForum}.`,
    ],
  };
}


interface SubRule {
  name: string;
  depositCap?: string;
  depositReturn?: string;
  extraCompliance: { label: string; note: string }[];
  extraNotes: string[];
}

const SUBREGION_RULES: Record<string, SubRule> = {
  // United States
  us_ca: { name: "California", depositCap: "Max 1 month's rent (2 for small landlords) — AB 12, from July 2024.", depositReturn: "Itemised return within 21 days.", extraCompliance: [{ label: "Just-cause eviction & rent cap", note: "AB 1482: increases capped at 5% + CPI (max 10%); just cause for many units." }, { label: "State disclosures", note: "Lead paint, Megan's Law, mold, bed bugs, flood zone, Prop 65." }], extraNotes: ["Month-to-month notice: 30 days (<1 yr), 60 days (≥1 yr).", "LA & SF add local rent control."] },
  us_tx: { name: "Texas", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extraCompliance: [{ label: "Security devices", note: "Statutory locks and smoke detectors required." }, { label: "Repair & remedy", note: "Tenant remedies under Texas Property Code §92." }], extraNotes: ["Month-to-month notice: 30 days.", "No state rent control (preempted)."] },
  us_ny: { name: "New York", depositCap: "Max 1 month's rent — HSTPA 2019.", depositReturn: "Itemised return within 14 days.", extraCompliance: [{ label: "Rent stabilization", note: "NYC and some areas: renewal and increase limits." }, { label: "State disclosures", note: "Lead paint, bedbug history (NYC), sprinkler, allergen (NYC)." }], extraNotes: ["Notice to end: 30 / 60 / 90 days by length of tenancy.", "Good-cause eviction in NYC and opt-in localities."] },
  us_fl: { name: "Florida", depositCap: "No statutory cap.", depositReturn: "15 days (no deductions) or 30 days with itemised notice.", extraCompliance: [{ label: "Deposit holding disclosure", note: "Disclose where the deposit is held within 30 days." }], extraNotes: ["Month-to-month notice: 30 days (15 for weekly).", "No state rent control."] },
  us_il: { name: "Illinois", depositCap: "No state cap.", depositReturn: "30–45 days with itemisation; interest on deposits for larger buildings.", extraCompliance: [{ label: "Chicago RLTO", note: "Chicago's ordinance adds deposit interest, receipts and summaries." }], extraNotes: ["Month-to-month notice: 30 days.", "Some cities cap or regulate; no statewide rent control."] },
  us_wa: { name: "Washington", depositCap: "No statutory cap.", depositReturn: "Itemised return within 21 days.", extraCompliance: [{ label: "Just cause to end", note: "Statewide just-cause required to terminate (2021)." }, { label: "Checklist required", note: "Move-in condition checklist required to keep a deposit." }], extraNotes: ["Notice for rent increase: 60 days.", "Seattle adds further protections."] },
  us_ga: { name: "Georgia", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extraCompliance: [{ label: "Move-in/out inspection", note: "Required where a deposit is held; list defects." }], extraNotes: ["Month-to-month notice: 30 days (landlord 60).", "No rent control (preempted)."] },
  us_nj: { name: "New Jersey", depositCap: "Max 1.5 months' rent.", depositReturn: "Itemised return within 30 days, with interest.", extraCompliance: [{ label: "Truth in Renting", note: "Provide the Truth in Renting statement (non-owner-occupied)." }], extraNotes: ["Local rent control is common (many municipalities).", "Notice to quit varies by ground."] },
  us_co: { name: "Colorado", depositCap: "No statutory cap.", depositReturn: "30 days (up to 60 if the lease says so).", extraCompliance: [{ label: "Warranty of habitability", note: "Strengthened repair timelines and remedies." }], extraNotes: ["Rent increase notice: 60 days for periodic tenancies.", "No statewide rent control."] },
  us_az: { name: "Arizona", depositCap: "Max 1.5 months' rent.", depositReturn: "Itemised return within 14 business days.", extraCompliance: [{ label: "Move-in checklist", note: "Tenant may request a move-in condition form." }], extraNotes: ["Month-to-month notice: 30 days.", "No rent control (preempted)."] },

  us_pa: { name: "Pennsylvania", depositCap: "Max 2 months rent (year 1), 1 month thereafter.", depositReturn: "Itemised return within 30 days.", extraCompliance: [{ label: "Escrow over $100", note: "Deposits over $100 held 2+ years must be in escrow with interest." }], extraNotes: ["Notice to quit: 15-30 days by tenancy length.", "No state rent control."] },
  us_oh: { name: "Ohio", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extraCompliance: [{ label: "Deposit interest", note: "Interest on deposits over $50 held 6+ months." }], extraNotes: ["Month-to-month notice: 30 days.", "No state rent control."] },
  us_nc: { name: "North Carolina", depositCap: "1.5 months (month-to-month) / 2 months (longer).", depositReturn: "Itemised return within 30 days (up to 60).", extraCompliance: [{ label: "Trust account", note: "Deposit held in a NC trust account or bonded." }], extraNotes: ["Month-to-month notice: 7 days.", "No rent control (preempted)."] },
  us_mi: { name: "Michigan", depositCap: "Max 1.5 months rent.", depositReturn: "Itemised return within 30 days.", extraCompliance: [{ label: "Inventory checklist", note: "Move-in/out checklist required to keep a deposit." }], extraNotes: ["Month-to-month notice: 30 days.", "No rent control (preempted)."] },
  us_va: { name: "Virginia", depositCap: "Max 2 months rent.", depositReturn: "Itemised return within 45 days.", extraCompliance: [{ label: "VRLTA disclosures", note: "Move-in report and statutory disclosures under the VRLTA." }], extraNotes: ["Month-to-month notice: 30 days.", "No rent control (preempted)."] },

  // United Arab Emirates (emirates)
  ae_dubai: { name: "Dubai", depositCap: "5% (unfurnished) or 10% (furnished) of annual rent.", depositReturn: "Refunded at contract end less damages.", extraCompliance: [{ label: "Ejari registration", note: "Tenancy contracts must be registered with Ejari (RERA/DLD)." }, { label: "RERA rental index", note: "Increases capped by the RERA calculator; Decree No. 43 of 2013." }, { label: "Eviction notice", note: "12 months' notarised/registered notice on valid grounds (Law 33/2008)." }], extraNotes: ["Rent typically paid by 1–4 post-dated cheques.", "Disputes: Dubai Rental Dispute Centre."] },
  ae_abu_dhabi: { name: "Abu Dhabi", depositCap: "Typically 5% (unfurnished) or 10% (furnished).", depositReturn: "Refunded at contract end less damages.", extraCompliance: [{ label: "Tawtheeq registration", note: "Tenancy contracts registered via Tawtheeq (ADM)." }, { label: "Rent cap", note: "Increase caps have applied periodically; check current ADREC rules." }], extraNotes: ["Disputes: Abu Dhabi rental dispute committees.", "Cheque-based rent is standard."] },
  ae_sharjah: { name: "Sharjah", extraCompliance: [{ label: "Municipality registration", note: "Tenancy contracts attested via Sharjah Municipality." }], extraNotes: ["Rent disputes handled by the Sharjah rent dispute committee."] },

  // South Africa (provinces — national law + provincial tribunals)
  za_gauteng: { name: "Gauteng", extraCompliance: [{ label: "Gauteng Rental Housing Tribunal", note: "Free dispute resolution; provincial Unfair Practice Regulations apply." }], extraNotes: ["Deposit + interest returned within 7–14 days after the outgoing inspection."] },
  za_western_cape: { name: "Western Cape", extraCompliance: [{ label: "Western Cape Rental Housing Tribunal", note: "Free dispute resolution; provincial Unfair Practice Regulations apply." }], extraNotes: ["Deposit must be invested; interest accrues to the tenant."] },
  za_kwazulu_natal: { name: "KwaZulu-Natal", extraCompliance: [{ label: "KZN Rental Housing Tribunal", note: "Free dispute resolution; provincial Unfair Practice Regulations apply." }], extraNotes: ["Joint incoming and outgoing inspections are required."] },
};

function withSub(base: RegionRuleset, code?: string | null): RegionRuleset {
  const r = code ? SUBREGION_RULES[code] : undefined;
  if (!r) return base;
  return {
    ...base,
    subregionName: r.name,
    deposit: r.depositCap ? { cap: r.depositCap, protection: r.depositReturn ?? base.deposit.protection } : base.deposit,
    compliance: [...base.compliance, ...r.extraCompliance],
    notes: [...r.extraNotes, ...base.notes],
  };
}

export function resolveRegion(country?: string | null, region?: string | null, regionCode?: string | null): RegionRuleset {
  const cc = (country ?? "GB").toUpperCase();
  if (cc === "US") return withSub(US, regionCode);
  if (cc === "AE") return withSub(UAE, regionCode);
  if (cc === "ZA") return withSub(ZA, regionCode);
  const key = (["england", "wales", "scotland", "northern_ireland"].includes(region ?? "") ? region : "england") as JurisdictionKey;
  return ukToRuleset(resolveJurisdiction(key));
}

export const INTERNATIONAL_RULESETS = { US, UAE, ZA };
