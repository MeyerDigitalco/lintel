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
  compliance: { label: string; note: string; detail?: string }[];
  deposit: { cap: string; protection: string };
  checklist: string[];
  notices: { label: string; when: string; period: string; detail?: string }[];
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
    { label: "Lead-based paint disclosure", note: "Required for housing built before 1978 (EPA/HUD).", detail: "Federal Title X requires landlords of pre-1978 housing to disclose known lead hazards and give the EPA pamphlet before the lease is signed. Keep the signed disclosure on file for at least 3 years." },
    { label: "Smoke & CO detectors", note: "Working detectors required; varies by state/city.", detail: "Nearly all states require working smoke alarms, and most require carbon-monoxide alarms where there is fuel-burning equipment or an attached garage. Count, placement and hardwire/battery rules vary by state and city — test at move-in and record it." },
    { label: "Warranty of habitability", note: "Property must be safe and livable.", detail: "Implied in almost every state: working heat, water, plumbing and a sound structure. Respond to repair requests within a reasonable time or the tenant may have remedies such as rent withholding or repair-and-deduct." },
    { label: "Security deposit handling", note: "Caps, accounts and itemised deductions vary by state.", detail: "Many states cap the deposit (often 1-2 months), require it held in a separate or interest-bearing account, and demand an itemised statement of deductions returned within a set deadline (commonly 14-30 days). Missing the deadline can forfeit your right to deduct." },
    { label: "Fair Housing compliance", note: "Federal + state anti-discrimination rules apply.", detail: "The federal Fair Housing Act prohibits discrimination on race, color, religion, sex, national origin, disability and familial status; many states and cities add source of income, age and more. Apply identical screening criteria to every applicant and keep records." },
  ],
  deposit: { cap: "Varies by state — often 1–2 months' rent; some states uncapped.", protection: "Return within state deadline (often 14–30 days) with an itemised statement." },
  checklist: ["Written lease", "Lead paint disclosure (pre-1978)", "Move-in inspection / condition report", "State-required disclosures (mold, bedbugs, etc.)"],
  notices: [
    { label: "Notice to Pay Rent or Quit", when: "Rent unpaid", period: "3-14 days (state-specific)", detail: "Served when rent is overdue. The cure window (pay or leave) is set by state, commonly 3 to 14 days. It must be in writing and state the exact amount due; only after it expires unpaid can you file for eviction." },
    { label: "Notice to Cure or Quit", when: "Lease violation", period: "Varies by state", detail: "Used for lease breaches other than rent (e.g. unauthorised pet or occupant). Gives the tenant a state-set period to fix the violation before you can proceed to eviction." },
    { label: "Notice to Terminate (no cause)", when: "End a month-to-month", period: "30-60 days", detail: "Ends a month-to-month tenancy without fault, typically 30 days (60+ for longer tenancies or in tenant-protective states). Just-cause states such as CA and OR restrict no-cause terminations." },
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

const AU: RegionRuleset = {
  country: "AU", countryName: "Australia", currency: "AUD",
  governingLaw: "State & territory Residential Tenancies Acts",
  tenancyTerm: "tenancy", depositTerm: "bond", taxLabel: "ATO rental schedule (individual tax return)",
  tenancyTypes: [
    { label: "Fixed-term agreement", description: "Set term, then continues as a periodic agreement." },
    { label: "Periodic agreement", description: "Rolling agreement terminable on state-set notice." },
  ],
  compliance: [
    { label: "Minimum housing standards", note: "Each state sets minimum standards (safety, weatherproofing)." },
    { label: "Smoke alarms", note: "Compliant smoke alarms required and maintained." },
    { label: "Bond lodged with authority", note: "Bond lodged with the state bond authority (RTBA, RTA, Rental Bonds Online, etc.)." },
    { label: "Entry condition report", note: "Condition report required at move-in." },
  ],
  deposit: { cap: "Bond typically 4 weeks' rent (varies by state).", protection: "Lodged with the state bond authority; released after the exit condition report." },
  checklist: ["Residential tenancy agreement", "Entry condition report", "Bond lodgement", "State tenant information statement"],
  notices: [
    { label: "Notice to remedy breach", when: "Tenant breach (e.g. arrears)", period: "Varies by state (often 14 days)" },
    { label: "Notice to vacate / termination", when: "End the tenancy", period: "Varies by state & ground" },
    { label: "Rent increase notice", when: "Increase rent", period: "60 days (most states)" },
  ],
  notes: ["Tenancy law and bond authorities differ by state/territory.", "Report rental income to the ATO; negative gearing and depreciation may apply."],
};

const NZ: RegionRuleset = {
  country: "NZ", countryName: "New Zealand", currency: "NZD",
  governingLaw: "Residential Tenancies Act 1986",
  tenancyTerm: "tenancy", depositTerm: "bond", taxLabel: "IR3 rental income (Inland Revenue)",
  tenancyTypes: [
    { label: "Periodic tenancy", description: "Open-ended; ended on statutory notice." },
    { label: "Fixed-term tenancy", description: "Set term; becomes periodic unless agreed otherwise." },
  ],
  compliance: [
    { label: "Healthy Homes Standards", note: "Heating, insulation, ventilation, moisture and draught stopping." },
    { label: "Smoke alarms", note: "Working smoke alarms required." },
    { label: "Insulation statement", note: "Ceiling and underfloor insulation required and disclosed." },
    { label: "Bond lodged with Tenancy Services", note: "Bond lodged within 23 working days." },
  ],
  deposit: { cap: "Bond max 4 weeks' rent.", protection: "Lodged with Tenancy Services (MBIE) within 23 working days." },
  checklist: ["Tenancy agreement", "Healthy Homes compliance statement", "Insulation statement", "Bond lodgement form"],
  notices: [
    { label: "14-day notice to remedy", when: "Tenant breach", period: "14 days" },
    { label: "Termination notice", when: "Landlord ends a periodic tenancy", period: "90 days (or 42 days on set grounds)" },
    { label: "Rent increase notice", when: "Increase rent", period: "60 days; once per 12 months" },
  ],
  notes: ["Healthy Homes compliance is mandatory for tenancies.", "Declare rental income on IR3; ring-fencing limits loss offset."],
};

const CA: RegionRuleset = {
  country: "CA", countryName: "Canada", currency: "CAD",
  governingLaw: "Provincial Residential Tenancies Acts",
  tenancyTerm: "tenancy", depositTerm: "deposit", taxLabel: "T776 - Statement of Real Estate Rentals",
  tenancyTypes: [
    { label: "Fixed-term tenancy", description: "Set term, then continues month-to-month." },
    { label: "Periodic (month-to-month)", description: "Rolling tenancy ended on provincial notice." },
  ],
  compliance: [
    { label: "Provincial maintenance standards", note: "Each province sets health & safety standards." },
    { label: "Smoke & CO alarms", note: "Working smoke and carbon-monoxide alarms required." },
    { label: "Condition inspection report", note: "Move-in/out inspection where required." },
    { label: "Deposit handling", note: "Deposit rules vary widely by province (some allow none)." },
  ],
  deposit: { cap: "Varies by province - Ontario allows last-month-rent only; BC up to half a month.", protection: "Held per provincial rules; interest payable in several provinces." },
  checklist: ["Tenancy agreement (standard form in some provinces)", "Condition inspection report", "Deposit receipt", "Provincial tenant information"],
  notices: [
    { label: "Notice to end for cause", when: "Tenant breach", period: "Varies by province" },
    { label: "Notice to end (no fault)", when: "Owner use / sale", period: "Often 60 days" },
    { label: "Rent increase notice", when: "Increase rent", period: "90 days (most provinces)" },
  ],
  notes: ["Tribunals differ by province (LTB Ontario, RTB BC, TAL Quebec).", "Report rental income on form T776."],
};

const IE: RegionRuleset = {
  country: "IE", countryName: "Ireland", currency: "EUR",
  governingLaw: "Residential Tenancies Acts 2004-2022",
  tenancyTerm: "tenancy", depositTerm: "deposit", taxLabel: "Form 11 rental income (Revenue)",
  tenancyTypes: [
    { label: "Tenancy of unlimited duration", description: "Tenancies become open-ended after 6 months (2022 reform)." },
    { label: "Fixed-term tenancy", description: "Set term with Part 4 protections." },
  ],
  compliance: [
    { label: "RTB registration", note: "Register the tenancy with the Residential Tenancies Board (annual)." },
    { label: "Minimum standards", note: "S.I. No. 17/2019 minimum standards for rented housing." },
    { label: "BER certificate", note: "A valid Building Energy Rating must be provided." },
    { label: "Rent Pressure Zone caps", note: "In RPZs, rent increases are capped." },
  ],
  deposit: { cap: "Typically 1 month's rent.", protection: "Returned promptly less arrears/damage; RTB adjudicates disputes." },
  checklist: ["Written tenancy agreement", "RTB registration", "BER certificate", "Rent book"],
  notices: [
    { label: "Notice of termination", when: "End the tenancy", period: "By tenancy length (90-224 days)" },
    { label: "Rent review notice", when: "Review rent (max once/yr)", period: "90 days; RPZ caps apply" },
  ],
  notes: ["RTB registration is mandatory and renewed annually.", "Declare rental income on Form 11."],
};

const DE: RegionRuleset = {
  country: "DE", countryName: "Germany", currency: "EUR",
  governingLaw: "German Civil Code (BGB) tenancy provisions",
  tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", taxLabel: "Anlage V (income tax return)",
  tenancyTypes: [
    { label: "Unlimited tenancy", description: "Open-ended Mietvertrag - the standard German lease." },
    { label: "Fixed-term (Zeitmietvertrag)", description: "Permitted only with a statutory reason." },
  ],
  compliance: [
    { label: "Deposit in separate account", note: "Kaution max 3 months' cold rent, held in a separate interest-bearing account." },
    { label: "Mietspiegel rent index", note: "Rent and increases benchmarked to the local rent index." },
    { label: "Mietpreisbremse", note: "Rent caps apply in designated tight housing markets." },
    { label: "Operating cost statement", note: "Annual Betriebskostenabrechnung required for advance payments." },
  ],
  deposit: { cap: "Max 3 months' cold rent (Kaltmiete).", protection: "Held in a separate interest-bearing account; returned after handover." },
  checklist: ["Mietvertrag", "Handover protocol (Übergabeprotokoll)", "Deposit account confirmation", "Operating cost schedule"],
  notices: [
    { label: "Ordinary termination", when: "Landlord ends with legitimate interest", period: "3-9 months by tenancy length" },
    { label: "Rent increase notice", when: "Increase to local comparable rent", period: "Capped; tenant consent / Mietspiegel" },
  ],
  notes: ["Strong tenant protection; termination needs a legitimate interest.", "Declare rental income via Anlage V."],
};

const ES: RegionRuleset = {
  country: "ES", countryName: "Spain", currency: "EUR",
  governingLaw: "Ley de Arrendamientos Urbanos (LAU)",
  tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (fianza)", taxLabel: "IRPF rental income",
  tenancyTypes: [
    { label: "Vivienda habitual", description: "Primary-residence lease; tenant may extend up to 5 years (7 if landlord is a company)." },
    { label: "Temporary lease", description: "Non-residential / seasonal use." },
  ],
  compliance: [
    { label: "Fianza deposit lodged", note: "One month's fianza lodged with the regional housing authority." },
    { label: "Energy certificate", note: "Certificado de eficiencia energética required to let." },
    { label: "Rent stress-area caps", note: "In declared stressed areas, rent indexation/caps apply." },
    { label: "Habitability certificate", note: "Cédula de habitabilidad required in several regions." },
  ],
  deposit: { cap: "1 month (residential); extra guarantee capped at 2 months.", protection: "Fianza lodged with the autonomous community's housing body." },
  checklist: ["Contrato de arrendamiento", "Energy performance certificate", "Fianza lodgement", "Inventory"],
  notices: [
    { label: "Notice not to renew", when: "End at the statutory term", period: "4 months (landlord) / 2 months (tenant)" },
    { label: "Rent update notice", when: "Annual rent update", period: "Per index; caps in stressed areas" },
  ],
  notes: ["Tenant has strong renewal rights up to 5-7 years.", "Declare rental income on IRPF; reductions may apply for habitual residence."],
};

const IN: RegionRuleset = {
  country: "IN", countryName: "India", currency: "INR",
  governingLaw: "Model Tenancy Act 2021 & state rent control acts",
  tenancyTerm: "rent agreement", depositTerm: "security deposit", taxLabel: "ITR - income from house property (TDS)",
  tenancyTypes: [
    { label: "Leave & licence", description: "Common 11-month arrangement, renewable." },
    { label: "Lease", description: "Longer term; registration required over set durations." },
  ],
  compliance: [
    { label: "Agreement registration", note: "Register the agreement and lodge with the Rent Authority (per Model Tenancy Act)." },
    { label: "Police verification", note: "Tenant police verification is required in many states/cities." },
    { label: "Security deposit cap", note: "Model Tenancy Act caps residential deposits at 2 months' rent." },
    { label: "TDS on rent", note: "Tenants deducting TDS where rent exceeds thresholds." },
  ],
  deposit: { cap: "Max 2 months' rent (Model Tenancy Act); higher in some states.", protection: "Refunded within 1 month of vacating, less dues." },
  checklist: ["Rent agreement", "Agreement registration", "Police verification", "Security deposit receipt"],
  notices: [
    { label: "Notice to vacate", when: "End the tenancy", period: "Per agreement (often 1-2 months)" },
    { label: "Eviction (Rent Authority)", when: "Default / breach", period: "Via the Rent Court / Authority" },
  ],
  notes: ["The Model Tenancy Act is adopted state-by-state; check your state's rules.", "Declare rental income under house property; claim 30% standard deduction."],
};

const FR: RegionRuleset = {
  country: "FR", countryName: "France", currency: "EUR",
  governingLaw: "Loi n. 89-462 du 6 juillet 1989",
  tenancyTerm: "lease (bail)", depositTerm: "deposit (depot de garantie)", taxLabel: "Revenus fonciers (micro-foncier / reel)",
  tenancyTypes: [
    { label: "Bail vide (unfurnished)", description: "3-year lease (6 if landlord is a company)." },
    { label: "Bail meuble (furnished)", description: "1-year lease (9 months for students)." },
  ],
  compliance: [
    { label: "Diagnostics (DDT)", note: "DPE, lead, asbestos, gas/electrical and risk diagnostics attached to the lease." },
    { label: "Decent housing standard", note: "Logement decent (surface, safety, performance) required." },
    { label: "Encadrement des loyers", note: "Rent caps apply in tense zones (Paris, Lille, etc.)." },
  ],
  deposit: { cap: "1 month (unfurnished) / 2 months (furnished), excl. charges.", protection: "Returned within 1-2 months of handover." },
  checklist: ["Bail (lease)", "Etat des lieux (inventory)", "Diagnostics (DDT)", "Deposit receipt"],
  notices: [
    { label: "Conge (notice to leave)", when: "Landlord ends at term", period: "6 months (unfurnished) / 3 (furnished)" },
    { label: "Rent revision", when: "Annual indexation", period: "Per IRL index; caps in tense zones" },
  ],
  notes: ["Strong tenant protection; valid grounds needed to end an unfurnished lease.", "Declare under revenus fonciers (micro or reel)."],
};

const NL: RegionRuleset = {
  country: "NL", countryName: "Netherlands", currency: "EUR",
  governingLaw: "Dutch Civil Code (BW Book 7) tenancy law",
  tenancyTerm: "tenancy (huurovereenkomst)", depositTerm: "deposit (waarborgsom)", taxLabel: "Box 3 / rental income",
  tenancyTypes: [
    { label: "Indefinite tenancy", description: "Open-ended; strong security of tenure." },
    { label: "Temporary tenancy", description: "Limited use since the 2024 Fixed-term reform." },
  ],
  compliance: [
    { label: "Points system (WWS)", note: "The puntensysteem sets the maximum rent for regulated homes." },
    { label: "Affordable Rent Act", note: "Mid-market caps apply from 2024; rent increases limited." },
    { label: "Energy label", note: "A valid energy label is required and affects the rent points." },
  ],
  deposit: { cap: "Typically 1-2 months' rent (max ~2 months in practice).", protection: "Returned within 14 days of handover (less damages)." },
  checklist: ["Huurovereenkomst", "Inspection report", "Energy label", "Deposit receipt"],
  notices: [
    { label: "Notice to end", when: "Landlord ends on legal ground", period: "3-6 months by tenancy length" },
    { label: "Rent increase notice", when: "Annual increase", period: "Capped; Huurcommissie oversight" },
  ],
  notes: ["Disputes: the Huurcommissie (Rent Tribunal).", "Private landlords are generally taxed under Box 3."],
};

const SG: RegionRuleset = {
  country: "SG", countryName: "Singapore", currency: "SGD",
  governingLaw: "Contract-based (no rent control); CEA for agents",
  tenancyTerm: "tenancy agreement", depositTerm: "security deposit", taxLabel: "IRAS rental income",
  tenancyTypes: [
    { label: "Private residential lease", description: "Typically 1-2 year tenancy agreement." },
    { label: "HDB lease", description: "Subject to HDB subletting approval and conditions." },
  ],
  compliance: [
    { label: "Stamp duty", note: "Tenancy must be stamped with IRAS (tenant usually pays)." },
    { label: "HDB approval", note: "Subletting an HDB flat needs HDB approval and minimum occupation period." },
    { label: "Occupancy limits", note: "Maximum occupants per URA/HDB rules." },
  ],
  deposit: { cap: "Commonly 1 month's deposit per year of lease.", protection: "Refunded at end of term less damages; no statutory scheme." },
  checklist: ["Tenancy agreement", "Stamp duty certificate", "Inventory list", "Handover checklist"],
  notices: [
    { label: "Notice to terminate", when: "Per the diplomatic/break clause", period: "Per agreement (often 2 months)" },
    { label: "Renewal notice", when: "Renew the tenancy", period: "Per agreement" },
  ],
  notes: ["No rent control; terms are largely contractual.", "Declare rental income to IRAS; expenses deductible."],
};

const IT: RegionRuleset = {
  country: "IT", countryName: "Italy", currency: "EUR",
  governingLaw: "Legge 392/1978 & Legge 431/1998", tenancyTerm: "lease (contratto di locazione)", depositTerm: "deposit (deposito cauzionale)", taxLabel: "Redditi da locazione (cedolare secca / IRPEF)",
  tenancyTypes: [{ label: "4+4 free-market lease", description: "Standard residential lease: 4 years + 4 years renewal." }, { label: "3+2 agreed-rent lease", description: "Canone concordato with tax relief." }],
  compliance: [{ label: "Registration with Agenzia Entrate", note: "Register the lease and pay registration tax (or opt for cedolare secca)." }, { label: "APE energy certificate", note: "Attestato di Prestazione Energetica required." }, { label: "Habitability", note: "Certificato di agibilità for the dwelling." }],
  deposit: { cap: "Up to 3 months' rent (deposito cauzionale).", protection: "Returned with legal interest at the end of the lease." },
  checklist: ["Contratto di locazione", "Lease registration", "APE certificate", "Inventory"],
  notices: [{ label: "Disdetta (notice)", when: "End at term", period: "6 months" }, { label: "Rent update", when: "Annual ISTAT indexation", period: "Per ISTAT; not under cedolare secca" }],
  notes: ["Cedolare secca is a flat-tax option on rent.", "Registration is mandatory within 30 days."],
};

const PT: RegionRuleset = {
  country: "PT", countryName: "Portugal", currency: "EUR",
  governingLaw: "Novo Regime do Arrendamento Urbano (NRAU)", tenancyTerm: "lease (contrato de arrendamento)", depositTerm: "deposit (caução)", taxLabel: "IRS Categoria F (rental income)",
  tenancyTypes: [{ label: "Contrato de arrendamento", description: "Standard urban lease; minimum terms apply." }, { label: "Short-term / non-permanent", description: "Limited-purpose lease." }],
  compliance: [{ label: "Lease communicated to AT", note: "Report the lease to the tax authority (Finanças)." }, { label: "Energy certificate", note: "Certificado energético required to let." }, { label: "Habitation licence", note: "Licença de utilização for the dwelling." }],
  deposit: { cap: "Commonly 1-2 months' rent (caução).", protection: "Returned at the end of the lease less amounts owed." },
  checklist: ["Contrato de arrendamento", "Energy certificate", "Habitation licence", "Rent receipts (recibos)"],
  notices: [{ label: "Denúncia (notice)", when: "End the lease", period: "Per term & duration" }, { label: "Rent update", when: "Annual coefficient", period: "Per official coefficient" }],
  notes: ["Issue electronic rent receipts via Finanças.", "Category F income taxed at 25% (or option to aggregate)."],
};

const CH: RegionRuleset = {
  country: "CH", countryName: "Switzerland", currency: "CHF",
  governingLaw: "Swiss Code of Obligations (CO) art. 253ff", tenancyTerm: "tenancy (Mietvertrag / bail)", depositTerm: "deposit (Mietkaution)", taxLabel: "Rental income (federal & cantonal tax)",
  tenancyTypes: [{ label: "Open-ended tenancy", description: "Standard ongoing lease." }, { label: "Fixed-term tenancy", description: "Ends without notice on the agreed date." }],
  compliance: [{ label: "Deposit in blocked account", note: "Kaution (max 3 months) held in a tenant-named blocked bank account." }, { label: "Official rent form", note: "Initial rent notified on the cantonal form where required." }, { label: "Handover protocol", note: "Übergabeprotokoll at move-in and move-out." }],
  deposit: { cap: "Max 3 months' rent, in a blocked account.", protection: "Released only with both parties' consent or a court order." },
  checklist: ["Mietvertrag / bail", "Handover protocol", "Blocked deposit account", "House rules (Hausordnung)"],
  notices: [{ label: "Termination (official form)", when: "Landlord ends tenancy", period: "3 months (homes), official form" }, { label: "Rent increase", when: "On reference rate change", period: "Official form; contestable" }],
  notes: ["Tenants can challenge abusive rent via the conciliation authority.", "Deposit must sit in a blocked account in the tenant's name."],
};

const JP: RegionRuleset = {
  country: "JP", countryName: "Japan", currency: "JPY",
  governingLaw: "Act on Land and Building Leases", tenancyTerm: "lease (chintai)", depositTerm: "deposit (shikikin)", taxLabel: "Real estate income (kakutei shinkoku)",
  tenancyTypes: [{ label: "Ordinary lease (futsu shakuya)", description: "Strong renewal rights for the tenant." }, { label: "Fixed-term lease (teiki shakka)", description: "Ends at term; no renewal right." }],
  compliance: [{ label: "Fire / earthquake safety", note: "Building safety standards apply." }, { label: "Important matters explanation", note: "Juyo jiko setsumei by a licensed agent before signing." }, { label: "Renewal handling", note: "Renewal fee (koshinryo) often applies." }],
  deposit: { cap: "Shikikin (deposit) typically 1-2 months; plus key money (reikin) in some areas.", protection: "Refunded less restoration costs (genjo kaifuku)." },
  checklist: ["Lease agreement", "Important matters explanation", "Guarantor / guarantee company", "Inventory"],
  notices: [{ label: "Termination notice", when: "End the lease", period: "Typically 1 month (tenant)" }, { label: "Non-renewal", when: "Landlord refuses renewal", period: "6 months + just cause" }],
  notes: ["Landlords need just cause to refuse renewal of an ordinary lease.", "Declare via kakutei shinkoku (tax return)."],
};

const MX: RegionRuleset = {
  country: "MX", countryName: "Mexico", currency: "MXN",
  governingLaw: "State Civil Codes (Códigos Civiles)", tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (depósito)", taxLabel: "ISR arrendamiento (SAT)",
  tenancyTypes: [{ label: "Contrato de arrendamiento", description: "Residential lease, commonly 1 year." }, { label: "Renewable lease", description: "Renews by agreement (tácita reconducción)." }],
  compliance: [{ label: "Lease registration (some states)", note: "Registration / ratification required in some states." }, { label: "Fiador / guarantee", note: "Fiador or póliza jurídica commonly required." }, { label: "CFDI invoicing", note: "Issue CFDI electronic invoices for rent via SAT." }],
  deposit: { cap: "Commonly 1 month's deposit.", protection: "Refunded at the end less damages/arrears." },
  checklist: ["Contrato de arrendamiento", "Fiador / guarantee", "CFDI rent invoices", "Inventory (inventario)"],
  notices: [{ label: "Aviso (notice)", when: "End the lease", period: "Per contract / state code" }, { label: "Rent update", when: "Annual increase", period: "Per contract / inflation" }],
  notes: ["Rules vary by state civil code.", "Issue CFDI and declare ISR on rental income."],
};

const BR: RegionRuleset = {
  country: "BR", countryName: "Brazil", currency: "BRL",
  governingLaw: "Lei do Inquilinato (Lei 8.245/1991)", tenancyTerm: "lease (contrato de locação)", depositTerm: "deposit (caução)", taxLabel: "IRPF aluguéis (carnê-leão)",
  tenancyTypes: [{ label: "Residential lease (30 months+)", description: "Allows end at term without cause." }, { label: "Shorter residential lease", description: "Renews and limits end without cause." }],
  compliance: [{ label: "Guarantee (garantia)", note: "Caução, fiador or seguro-fiança - only one allowed." }, { label: "Vistoria (inspection)", note: "Entry and exit inspection reports." }, { label: "Condominium rules", note: "Convenção de condomínio where applicable." }],
  deposit: { cap: "Caução up to 3 months' rent (if deposit is the chosen guarantee).", protection: "Returned with savings-account interest at the end." },
  checklist: ["Contrato de locação", "Vistoria de entrada", "Guarantee document", "Rent receipts"],
  notices: [{ label: "Notificação (notice)", when: "End the lease", period: "30 days (after term) / per contract" }, { label: "Reajuste", when: "Annual indexation", period: "Per index (IGP-M / IPCA)" }],
  notes: ["Only one guarantee type may be required.", "Declare rent monthly via carnê-leão; annual IRPF."],
};

const BE: RegionRuleset = {
  country: "BE", countryName: "Belgium", currency: "EUR",
  governingLaw: "Regional housing codes (Brussels, Flanders, Wallonia)", tenancyTerm: "lease (bail / huurovereenkomst)", depositTerm: "deposit (garantie locative)", taxLabel: "Cadastral & rental income",
  tenancyTypes: [{ label: "Main residence lease", description: "9-year lease is the default in most regions." }, { label: "Short lease", description: "3 years or less." }],
  compliance: [{ label: "Lease registration", note: "Registration of the lease is mandatory (free)." }, { label: "Energy certificate (PEB/EPC)", note: "Required to let." }, { label: "Blocked deposit account", note: "Deposit in a blocked account in the tenant's name." }],
  deposit: { cap: "Up to 2-3 months in a blocked account (region-dependent).", protection: "Released with both parties' agreement or a judge's order." },
  checklist: ["Lease (bail)", "Lease registration", "Energy certificate", "Move-in inventory (état des lieux)"],
  notices: [{ label: "Notice (congé)", when: "End the lease", period: "Region & ground dependent" }, { label: "Rent indexation", when: "Annual", period: "Per health index" }],
  notes: ["Housing law differs by region (Brussels/Flanders/Wallonia).", "An entry inventory is strongly advised."],
};

const AT: RegionRuleset = {
  country: "AT", countryName: "Austria", currency: "EUR",
  governingLaw: "Mietrechtsgesetz (MRG)", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", taxLabel: "Einkünfte aus Vermietung (E1b)",
  tenancyTypes: [{ label: "Unlimited tenancy", description: "Open-ended Mietvertrag." }, { label: "Fixed-term", description: "Min. 3 years for MRG-regulated flats." }],
  compliance: [{ label: "Deposit invested", note: "Kaution (usually ~3 months) held with interest for the tenant." }, { label: "Richtwert / rent caps", note: "Reference-value caps for older buildings." }, { label: "Operating costs", note: "Betriebskosten statement required." }],
  deposit: { cap: "Typically 3 months' rent.", protection: "Returned with interest, less justified claims." },
  checklist: ["Mietvertrag", "Handover protocol", "Deposit confirmation", "Operating cost schedule"],
  notices: [{ label: "Termination", when: "Landlord ends (MRG grounds)", period: "Court / statutory grounds" }, { label: "Rent increase", when: "Index/Richtwert", period: "Per index" }],
  notes: ["MRG applies fully to many older buildings.", "Stamp duty (Gebühr) may apply to leases."],
};

const PL: RegionRuleset = {
  country: "PL", countryName: "Poland", currency: "PLN",
  governingLaw: "Civil Code & Tenant Protection Act", tenancyTerm: "lease (umowa najmu)", depositTerm: "deposit (kaucja)", taxLabel: "Ryczałt / PIT rental income",
  tenancyTypes: [{ label: "Standard lease", description: "Civil-code lease with tenant protections." }, { label: "Occasional lease", description: "Najem okazjonalny with notarised submission." }],
  compliance: [{ label: "Deposit cap", note: "Kaucja capped at up to 12 months (commonly 1)." }, { label: "Handover protocol", note: "Protokół zdawczo-odbiorczy at move-in." }, { label: "Occasional lease registration", note: "Notarial declaration + tax office notice." }],
  deposit: { cap: "Up to 12 months (commonly 1 month).", protection: "Returned within 1 month of handover." },
  checklist: ["Umowa najmu", "Handover protocol", "Deposit receipt", "Occasional-lease notarial act (if used)"],
  notices: [{ label: "Termination", when: "End the lease", period: "Per Civil Code / contract" }, { label: "Rent increase", when: "Raise rent", period: "3 months' notice" }],
  notes: ["Occasional lease gives faster eviction via a notarial act.", "Ryczałt flat tax (8.5%/12.5%) is a common option."],
};

const SA: RegionRuleset = {
  country: "SA", countryName: "Saudi Arabia", currency: "SAR",
  governingLaw: "Ejar network & tenancy regulations", tenancyTerm: "lease (Ejar contract)", depositTerm: "security deposit", taxLabel: "No personal income tax; VAT records",
  tenancyTypes: [{ label: "Annual lease", description: "Standard 12-month Ejar-registered contract." }],
  compliance: [{ label: "Ejar registration", note: "Contracts registered on the Ejar network (required for many services)." }, { label: "Utilities clearance", note: "SEC/water clearance at move-out." }],
  deposit: { cap: "Commonly 1 month (negotiable).", protection: "Refunded at end of contract less damages." },
  checklist: ["Ejar contract", "Tenant ID (Iqama/National ID)", "Utilities account", "Inventory"],
  notices: [{ label: "Eviction", when: "Valid grounds", period: "Via Ejar / committee" }, { label: "Non-renewal", when: "End at term", period: "Per contract" }],
  notes: ["Ejar registration underpins dispute resolution.", "No personal income tax; VAT applies to commercial leases."],
};

const QA: RegionRuleset = {
  country: "QA", countryName: "Qatar", currency: "QAR",
  governingLaw: "Law No. 4 of 2008 (rental)", tenancyTerm: "lease contract", depositTerm: "security deposit", taxLabel: "No personal income tax",
  tenancyTypes: [{ label: "Annual lease", description: "Standard 12-month contract." }],
  compliance: [{ label: "Lease registration", note: "Register the lease with the municipality." }, { label: "Kahramaa utilities", note: "Electricity/water account and clearance." }],
  deposit: { cap: "Commonly 1-2 months.", protection: "Refunded at end of contract less damages." },
  checklist: ["Lease contract", "Lease registration", "Kahramaa account", "Inventory"],
  notices: [{ label: "Eviction", when: "Valid grounds", period: "Rental Dispute Committee" }, { label: "Rent increase", when: "Increase rent", period: "Per committee rules" }],
  notes: ["Disputes: the Rental Dispute Settlement Committee.", "No personal income tax."],
};

const HK: RegionRuleset = {
  country: "HK", countryName: "Hong Kong", currency: "HKD",
  governingLaw: "Landlord and Tenant (Consolidation) Ordinance", tenancyTerm: "tenancy agreement", depositTerm: "deposit", taxLabel: "Property tax (IRD)",
  tenancyTypes: [{ label: "Fixed-term tenancy", description: "Common 1+1 year (with break clause)." }, { label: "Periodic tenancy", description: "Rolling tenancy." }],
  compliance: [{ label: "Stamp duty", note: "Tenancy must be stamped with the IRD." }, { label: "Property tax", note: "Property tax payable on rental income." }, { label: "Building management", note: "Deed of mutual covenant / management rules." }],
  deposit: { cap: "Typically 2 months' rent.", protection: "Refunded at end of term less damages." },
  checklist: ["Tenancy agreement", "Stamping (IRD)", "Inventory", "Handover checklist"],
  notices: [{ label: "Notice to quit", when: "End the tenancy", period: "Per agreement / break clause" }, { label: "Rent review", when: "On renewal", period: "Per agreement" }],
  notes: ["Stamp the tenancy promptly to avoid penalties.", "Property tax is charged on net assessable value."],
};

function cadenceLabel(c: string): string {
  return ({ annual: "every year", biennial: "every 2 years", three_yearly: "every 3 years", five_yearly: "every 5 years", once: "one-off", ongoing: "ongoing" } as Record<string, string>)[c] ?? c;
}

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
    compliance: j.complianceItems.map((c) => ({
      label: c.label,
      note: c.statutoryBasis,
      detail: [
        `Statutory basis: ${c.statutoryBasis}.`,
        `Renewal: ${cadenceLabel(c.cadence)}.`,
        c.conditional ? "Applies only in certain cases (e.g. HMOs or where gas/electrics are present)." : "Applies to this tenancy.",
        c.reminderDaysBefore && c.reminderDaysBefore.length ? `Lintel reminds you ${c.reminderDaysBefore.join(", ")} days before it expires.` : "Tracked in your compliance vault.",
      ].join(" "),
    })),
    deposit: { cap: j.depositRules.capDescription, protection: `Protect within ${j.depositRules.protectionDeadlineDays} ${j.depositRules.protectionDeadlineBasis} days (${j.depositRules.schemes.join(", ")}).` },
    checklist: j.documentChecklist.map((d) => d.label),
    notices: j.noticeTemplates.map((n) => ({
      label: n.label,
      when: n.statutoryBasis,
      period: n.noticePeriodDays ? `${n.noticePeriodDays} days` : "Grounds-dependent",
      detail: `${n.description} Statutory basis: ${n.statutoryBasis}.${n.noticePeriodDays ? ` Minimum notice period: ${n.noticePeriodDays} days.` : " The notice period depends on the grounds relied upon."} Build and print this in the Notice generator.`,
    })),
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
  extraCompliance?: { label: string; note: string }[];
  extraNotes?: string[];
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

  // Australia (states/territories)
  au_nsw: { name: "New South Wales", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Released via Rental Bonds Online after the exit report.", extraCompliance: [{ label: "NSW minimum standards", note: "Residential Tenancies Act 2010; smoke alarms maintained." }], extraNotes: ["Rent increase: 60 days' notice; once per 12 months (periodic)."] },
  au_vic: { name: "Victoria", depositCap: "Bond max 1 month's rent (rent under threshold).", depositReturn: "Lodged with the RTBA; released after the exit report.", extraCompliance: [{ label: "Victorian minimum standards", note: "Residential Tenancies Act 1997; rental minimum standards apply." }], extraNotes: ["Rent increase: 60 days' notice; once per 12 months."] },
  au_qld: { name: "Queensland", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Lodged with the RTA; released after the exit condition report.", extraCompliance: [{ label: "QLD minimum housing standards", note: "Residential Tenancies and Rooming Accommodation Act 2008." }], extraNotes: ["Rent increase: 2 months' notice; once per 12 months."] },
  au_wa: { name: "Western Australia", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Lodged with the Bond Administrator.", extraCompliance: [{ label: "WA standards", note: "Residential Tenancies Act 1987." }], extraNotes: ["Rent increase: 60 days' notice; not within 6 months of the last."] },

  // Canada (provinces)
  ca_on: { name: "Ontario", depositCap: "No security deposit; last-month-rent deposit only.", depositReturn: "Applied to the final month; interest payable.", extraCompliance: [{ label: "Standard lease form", note: "Ontario's standard lease is mandatory for most tenancies." }], extraNotes: ["Disputes: Landlord and Tenant Board (LTB).", "Rent increase: annual guideline + 90 days' notice."] },
  ca_bc: { name: "British Columbia", depositCap: "Deposit max half a month's rent (plus pet deposit).", depositReturn: "Return within 15 days of tenancy end or claim via RTB.", extraCompliance: [{ label: "Condition inspection", note: "Move-in and move-out inspection reports required." }], extraNotes: ["Disputes: Residential Tenancy Branch (RTB).", "Rent increase: annual cap + 3 months' notice."] },
  ca_ab: { name: "Alberta", depositCap: "Security deposit max 1 month's rent.", depositReturn: "Return within 10 days with a statement.", extraCompliance: [{ label: "Inspection report", note: "Move-in/out inspection reports required." }], extraNotes: ["Disputes: RTDRS.", "No rent control; notice rules apply."] },
  ca_qc: { name: "Quebec", depositCap: "Deposits are not permitted.", depositReturn: "Not applicable - no deposit allowed.", extraCompliance: [{ label: "Lease (TAL form)", note: "Use the mandatory TAL lease; disclose prior rent (Section G)." }], extraNotes: ["Disputes: Tribunal administratif du logement (TAL).", "Lease may be required in French."] },
  // Italy (regions) - canone concordato local agreements
  it_lazio: { name: "Lazio", extraCompliance: [{ label: "Rome local agreement", note: "Canone concordato accordo territoriale sets reduced rents with tax relief." }], extraNotes: ["High-demand area; check accordo territoriale rates."] },
  it_lombardy: { name: "Lombardy", extraCompliance: [{ label: "Milan local agreement", note: "Canone concordato accordo territoriale applies in Milan." }], extraNotes: ["Strong rental market; agreed-rent leases common."] },
  it_campania: { name: "Campania", extraCompliance: [{ label: "Naples local agreement", note: "Local accordo territoriale for agreed-rent leases." }], extraNotes: [] },
  it_sicily: { name: "Sicily", extraNotes: ["National rules apply; check local agreed-rent agreements."] },
  // Switzerland (cantons) - initial-rent form mandatory in several cantons
  ch_zurich: { name: "Zurich", extraCompliance: [{ label: "Official rent form", note: "Initial rent must be notified on the official form (Formular)." }], extraNotes: ["Disputes: Schlichtungsbehörde (conciliation authority)."] },
  ch_geneva: { name: "Geneva", extraCompliance: [{ label: "Formule officielle", note: "Initial rent on the official form is mandatory; LDTR limits conversions." }], extraNotes: ["Strong tenant protection; ASLOCA active."] },
  ch_vaud: { name: "Vaud", extraCompliance: [{ label: "Formule officielle", note: "Initial rent on the official form is mandatory." }], extraNotes: ["Disputes via the commission de conciliation."] },
  ch_ticino: { name: "Ticino", extraNotes: ["Official initial-rent form applies; conciliation authority handles disputes."] },
  // Japan (prefectures)
  jp_tokyo: { name: "Tokyo", extraCompliance: [{ label: "Key money & guarantor", note: "Reikin (1-2 months) and a guarantor company are standard." }], extraNotes: ["High demand; renewal fee (koshinryo) common."] },
  jp_osaka: { name: "Osaka", extraCompliance: [{ label: "Shikibiki custom", note: "Kansai-style deposit deduction (shikibiki) may apply." }], extraNotes: ["Deposit customs differ from Tokyo."] },
  // Brazil (states)
  br_sao_paulo: { name: "São Paulo", extraCompliance: [{ label: "Seguro-fiança common", note: "Rental insurance widely used as the guarantee." }], extraNotes: ["High demand; Juizado handles smaller disputes."] },
  br_rio_de_janeiro: { name: "Rio de Janeiro", extraNotes: ["National Lei do Inquilinato applies; state courts handle disputes."] },
};

function withSub(base: RegionRuleset, code?: string | null): RegionRuleset {
  const r = code ? SUBREGION_RULES[code] : undefined;
  if (!r) return base;
  return {
    ...base,
    subregionName: r.name,
    deposit: r.depositCap ? { cap: r.depositCap, protection: r.depositReturn ?? base.deposit.protection } : base.deposit,
    compliance: [...base.compliance, ...(r.extraCompliance ?? [])],
    notes: [...(r.extraNotes ?? []), ...base.notes],
  };
}

export function resolveRegion(country?: string | null, region?: string | null, regionCode?: string | null): RegionRuleset {
  const cc = (country ?? "GB").toUpperCase();
  if (cc === "US") return withSub(US, regionCode);
  if (cc === "AE") return withSub(UAE, regionCode);
  if (cc === "ZA") return withSub(ZA, regionCode);
  if (cc === "AU") return withSub(AU, regionCode);
  if (cc === "NZ") return NZ;
  if (cc === "CA") return withSub(CA, regionCode);
  if (cc === "IE") return IE;
  if (cc === "DE") return DE;
  if (cc === "ES") return ES;
  if (cc === "IN") return IN;
  if (cc === "FR") return FR;
  if (cc === "NL") return NL;
  if (cc === "SG") return SG;
  if (cc === "IT") return withSub(IT, regionCode);
  if (cc === "PT") return PT;
  if (cc === "CH") return withSub(CH, regionCode);
  if (cc === "JP") return withSub(JP, regionCode);
  if (cc === "MX") return MX;
  if (cc === "BR") return withSub(BR, regionCode);
  if (cc === "BE") return BE;
  if (cc === "AT") return AT;
  if (cc === "PL") return PL;
  if (cc === "SA") return SA;
  if (cc === "QA") return QA;
  if (cc === "HK") return HK;
  const key = (["england", "wales", "scotland", "northern_ireland"].includes(region ?? "") ? region : "england") as JurisdictionKey;
  return ukToRuleset(resolveJurisdiction(key));
}

export const INTERNATIONAL_RULESETS = { US, UAE, ZA, AU, NZ, CA, IE, DE, ES, IN, FR, NL, SG, IT, PT, CH, JP, MX, BR, BE, AT, PL, SA, QA, HK };
