// Self-contained region rulesets for mobile (mirrors the web layer). Guidance only.
export interface RegionRuleset {
  countryName: string;
  subregionName?: string;
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
  countryName: "United States",
  governingLaw: "State landlord–tenant law + the federal Fair Housing Act",
  tenancyTerm: "lease", depositTerm: "security deposit", taxLabel: "Schedule E (Form 1040)",
  tenancyTypes: [
    { label: "Fixed-term lease", description: "Set term (often 12 months) that renews or ends." },
    { label: "Month-to-month", description: "Rolling tenancy terminable on state-set notice." },
  ],
  compliance: [
    { label: "Lead-based paint disclosure", note: "Pre-1978 housing.", detail: "Federal Title X requires disclosure of known lead hazards and the EPA pamphlet before signing. Keep the signed form 3 years." },
    { label: "Smoke & CO detectors", note: "Working detectors required.", detail: "Most states require smoke and CO alarms (where fuel-burning equipment/garage). Count and placement vary; test at move-in and record it." },
    { label: "Warranty of habitability", note: "Safe and livable.", detail: "Implied in nearly every state: heat, water, plumbing, sound structure. Fix within a reasonable time or face rent withholding / repair-and-deduct." },
    { label: "Security deposit handling", note: "Caps & itemised deductions vary.", detail: "Many states cap the deposit (1-2 months), require a separate/interest account, and an itemised statement within 14-30 days. Late = forfeit deductions." },
    { label: "Fair Housing compliance", note: "Anti-discrimination rules.", detail: "Fair Housing Act bans bias on race, color, religion, sex, origin, disability, familial status; many states add more. Screen everyone identically." },
  ],
  deposit: { cap: "Varies by state — often 1–2 months' rent.", protection: "Return within the state deadline with an itemised statement." },
  checklist: ["Written lease", "Lead paint disclosure (pre-1978)", "Move-in inspection", "State-required disclosures"],
  notices: [
    { label: "Notice to Pay Rent or Quit", when: "Rent unpaid", period: "3-14 days (state-specific)", detail: "Served when rent is overdue. Cure window is state-set (3-14 days), in writing with the exact amount due, before you can file." },
    { label: "Notice to Cure or Quit", when: "Lease violation", period: "Varies by state", detail: "For non-rent breaches (e.g. unauthorised pet). Gives a state-set window to fix before eviction." },
    { label: "Notice to Terminate (no cause)", when: "End a month-to-month", period: "30-60 days", detail: "Ends a month-to-month without fault, usually 30 days (60+ longer/tenant-protective states). Just-cause states (CA, OR) restrict it." },
  ],
  notes: ["Rules differ by state (CA, OR, NY are stronger).", "Report income/expenses on Schedule E; 1099 contractors paid $600+."],
};

const AE: RegionRuleset = {
  countryName: "United Arab Emirates",
  governingLaw: "Emirate rental laws & RERA", tenancyTerm: "tenancy contract", depositTerm: "security deposit",
  taxLabel: "VAT records (residential rent generally exempt)",
  tenancyTypes: [{ label: "Annual tenancy contract", description: "12-month contract, renewable; registered." }],
  compliance: [
    { label: "Ejari / Tawtheeq registration", note: "Tenancy contracts must be registered.", detail: "Tenancy contracts must be registered (Ejari in Dubai via the DLD, Tawtheeq in Abu Dhabi). Registration is needed for visas, DEWA and to file a dispute." },
    { label: "RERA rental index", note: "Rent increases capped by the official index.", detail: "Rent increases are capped by the RERA rental index calculator and Decree No. 43 of 2013 — no increase is allowed unless the index shows the rent is below market by set thresholds." },
    { label: "Eviction notice", note: "Generally 12 months' notarised notice on valid grounds.", detail: "Eviction on valid grounds (owner use, sale, demolition, major works) requires 12 months' notice via notary public or registered mail under Law No. 33 of 2008." },
  ],
  deposit: { cap: "Typically 5% (unfurnished) or 10% (furnished) of annual rent.", protection: "Refundable at end of contract less damages." },
  checklist: ["Tenancy contract", "Ejari/Tawtheeq registration", "Title deed copy", "Tenant ID", "Cheque schedule"],
  notices: [
    { label: "Eviction notice", when: "Valid grounds", period: "12 months, notarised", detail: "12 months' notarised or registered notice on valid statutory grounds; it must be served through a notary or registered mail to be enforceable." },
    { label: "Non-renewal / vary terms", when: "Change rent or terms", period: "90 days before expiry" },
  ],
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
  notices: [
    { label: "Breach notice", when: "Tenant breach", period: "20 business days to remedy" },
    { label: "Cancellation (CPA)", when: "Early cancellation", period: "20 business days notice" },
    { label: "Notice to vacate", when: "End a month-to-month", period: "1 month" },
  ],
  notes: ["Deductions supported by the outgoing inspection.", "Declare income on ITR12; provisional tax twice yearly."],
};

const AU: RegionRuleset = {
  countryName: "Australia",
  governingLaw: "State & territory Residential Tenancies Acts", tenancyTerm: "tenancy", depositTerm: "bond",
  taxLabel: "ATO rental schedule (individual tax return)",
  tenancyTypes: [
    { label: "Fixed-term agreement", description: "Set term, then continues as periodic." },
    { label: "Periodic agreement", description: "Rolling agreement on state-set notice." },
  ],
  compliance: [
    { label: "Minimum housing standards", note: "Each state sets safety/weatherproofing standards.", detail: "Each state sets minimum standards (structural soundness, weatherproofing, working facilities); Victoria and Queensland have detailed rental minimum standards." },
    { label: "Smoke alarms", note: "Compliant smoke alarms required.", detail: "Compliant, regularly tested smoke alarms are mandatory; some states (e.g. QLD) require interconnected photoelectric alarms." },
    { label: "Bond lodged with authority", note: "Lodged with the state bond authority (RTBA, RTA, Rental Bonds Online).", detail: "The bond must be lodged with the state authority (RTBA in VIC, RTA in QLD, Rental Bonds Online in NSW) within set days — never held by the landlord." },
    { label: "Entry condition report", note: "Required at move-in.", detail: "A condition report at move-in (and exit) is required to support any bond claim." },
  ],
  deposit: { cap: "Bond typically 4 weeks' rent (varies by state).", protection: "Lodged with the state bond authority; released after the exit report." },
  checklist: ["Residential tenancy agreement", "Entry condition report", "Bond lodgement", "State tenant information statement"],
  notices: [
    { label: "Notice to remedy breach", when: "Tenant breach", period: "Varies by state (often 14 days)", detail: "Issued for breaches such as arrears; the remedy period is state-set (often 14 days) before you can apply to terminate." },
    { label: "Notice to vacate", when: "End the tenancy", period: "Varies by state & ground" },
    { label: "Rent increase notice", when: "Increase rent", period: "60 days (most states)", detail: "Most states require 60 days' written notice and limit increases to once every 12 months." },
  ],
  notes: ["Law and bond authorities differ by state/territory.", "Report income to the ATO; negative gearing may apply."],
};

const NZ: RegionRuleset = {
  countryName: "New Zealand",
  governingLaw: "Residential Tenancies Act 1986", tenancyTerm: "tenancy", depositTerm: "bond",
  taxLabel: "IR3 rental income (Inland Revenue)",
  tenancyTypes: [
    { label: "Periodic tenancy", description: "Open-ended; ended on statutory notice." },
    { label: "Fixed-term tenancy", description: "Set term; becomes periodic unless agreed." },
  ],
  compliance: [
    { label: "Healthy Homes Standards", note: "Heating, insulation, ventilation, moisture, draughts." },
    { label: "Smoke alarms", note: "Working smoke alarms required." },
    { label: "Insulation statement", note: "Ceiling & underfloor insulation disclosed." },
    { label: "Bond lodged with Tenancy Services", note: "Lodged within 23 working days." },
  ],
  deposit: { cap: "Bond max 4 weeks' rent.", protection: "Lodged with Tenancy Services (MBIE) within 23 working days." },
  checklist: ["Tenancy agreement", "Healthy Homes compliance statement", "Insulation statement", "Bond lodgement form"],
  notices: [
    { label: "14-day notice to remedy", when: "Tenant breach", period: "14 days" },
    { label: "Termination notice", when: "Landlord ends periodic tenancy", period: "90 days (42 on set grounds)" },
    { label: "Rent increase notice", when: "Increase rent", period: "60 days; once per 12 months" },
  ],
  notes: ["Healthy Homes compliance is mandatory.", "Declare income on IR3; ring-fencing limits loss offset."],
};

const CA: RegionRuleset = {
  countryName: "Canada",
  governingLaw: "Provincial Residential Tenancies Acts", tenancyTerm: "tenancy", depositTerm: "deposit",
  taxLabel: "T776 - Statement of Real Estate Rentals",
  tenancyTypes: [
    { label: "Fixed-term tenancy", description: "Set term, then continues month-to-month." },
    { label: "Periodic (month-to-month)", description: "Rolling tenancy on provincial notice." },
  ],
  compliance: [
    { label: "Provincial maintenance standards", note: "Each province sets health & safety standards.", detail: "Each province's Residential Tenancies Act sets health, safety and maintenance standards (heat, water, pest control). Tenants can apply to the provincial board if repairs are ignored." },
    { label: "Smoke & CO alarms", note: "Working smoke and CO alarms required.", detail: "Working smoke and carbon-monoxide alarms are required across provinces; testing and placement follow provincial fire codes." },
    { label: "Condition inspection report", note: "Move-in/out inspection where required.", detail: "Provinces such as BC and Alberta require joint move-in and move-out inspection reports to support any deposit deductions." },
    { label: "Deposit handling", note: "Deposit rules vary by province (some allow none).", detail: "Rules vary sharply: Ontario allows only a last-month-rent deposit (no damage deposit), BC caps at half a month, Quebec bans deposits entirely. Interest is payable in several provinces." },
  ],
  deposit: { cap: "Varies by province - Ontario last-month only; BC up to half a month.", protection: "Held per provincial rules; interest payable in several provinces." },
  checklist: ["Tenancy agreement", "Condition inspection report", "Deposit receipt", "Provincial tenant information"],
  notices: [
    { label: "Notice to end for cause", when: "Tenant breach", period: "Varies by province", detail: "Served for breaches such as arrears or damage; the form and cure period are set by the provincial board (e.g. Ontario's N4 for non-payment)." },
    { label: "Notice to end (no fault)", when: "Owner use / sale", period: "Often 60 days", detail: "For landlord or buyer use; compensation and longer notice often apply (e.g. one month's rent in Ontario for own-use)." },
    { label: "Rent increase notice", when: "Increase rent", period: "90 days (most provinces)", detail: "Most provinces require about 90 days' written notice on the official form, once every 12 months, within the annual guideline where one applies." },
  ],
  notes: ["Tribunals differ by province (LTB, RTB, TAL).", "Report rental income on T776."],
};

const IE: RegionRuleset = {
  countryName: "Ireland",
  governingLaw: "Residential Tenancies Acts 2004-2022", tenancyTerm: "tenancy", depositTerm: "deposit",
  taxLabel: "Form 11 rental income (Revenue)",
  tenancyTypes: [
    { label: "Tenancy of unlimited duration", description: "Open-ended after 6 months (2022 reform)." },
    { label: "Fixed-term tenancy", description: "Set term with Part 4 protections." },
  ],
  compliance: [
    { label: "RTB registration", note: "Register with the Residential Tenancies Board (annual)." },
    { label: "Minimum standards", note: "S.I. No. 17/2019 minimum standards." },
    { label: "BER certificate", note: "Valid Building Energy Rating required." },
    { label: "Rent Pressure Zone caps", note: "In RPZs, rent increases are capped." },
  ],
  deposit: { cap: "Typically 1 month's rent.", protection: "Returned less arrears/damage; RTB adjudicates." },
  checklist: ["Written tenancy agreement", "RTB registration", "BER certificate", "Rent book"],
  notices: [
    { label: "Notice of termination", when: "End the tenancy", period: "By tenancy length (90-224 days)" },
    { label: "Rent review notice", when: "Review rent (max once/yr)", period: "90 days; RPZ caps" },
  ],
  notes: ["RTB registration is mandatory and annual.", "Declare income on Form 11."],
};

const DE: RegionRuleset = {
  countryName: "Germany",
  governingLaw: "German Civil Code (BGB) tenancy provisions", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)",
  taxLabel: "Anlage V (income tax return)",
  tenancyTypes: [
    { label: "Unlimited tenancy", description: "Open-ended Mietvertrag - the standard lease." },
    { label: "Fixed-term (Zeitmietvertrag)", description: "Allowed only with a statutory reason." },
  ],
  compliance: [
    { label: "Deposit in separate account", note: "Kaution max 3 months' cold rent, separate interest-bearing account.", detail: "The Kaution is capped at three months' cold rent (Kaltmiete), may be paid in three instalments, and must be held in a separate account earning interest for the tenant." },
    { label: "Mietspiegel rent index", note: "Rent benchmarked to the local rent index.", detail: "Rent and increases are benchmarked to the local Mietspiegel; raising rent to the local comparable level needs tenant consent and is capped (Kappungsgrenze)." },
    { label: "Mietpreisbremse", note: "Rent caps in tight housing markets.", detail: "In designated tight markets the initial rent may not exceed the local reference rent by more than 10%." },
    { label: "Operating cost statement", note: "Annual Betriebskostenabrechnung required.", detail: "Where advance payments are taken, an annual Betriebskostenabrechnung must be issued within 12 months." },
  ],
  deposit: { cap: "Max 3 months' cold rent.", protection: "Separate interest-bearing account; returned after handover." },
  checklist: ["Mietvertrag", "Handover protocol", "Deposit account confirmation", "Operating cost schedule"],
  notices: [
    { label: "Ordinary termination", when: "Landlord with legitimate interest", period: "3-9 months by length", detail: "A landlord needs a legitimate interest (e.g. own use); notice periods run from 3 to 9 months by length of tenancy." },
    { label: "Rent increase notice", when: "To local comparable rent", period: "Capped; Mietspiegel", detail: "To the local comparable rent: written justification via the Mietspiegel, capped by the Kappungsgrenze, with the tenant's agreement required." },
  ],
  notes: ["Strong tenant protection; termination needs legitimate interest.", "Declare income via Anlage V."],
};

const ES: RegionRuleset = {
  countryName: "Spain",
  governingLaw: "Ley de Arrendamientos Urbanos (LAU)", tenancyTerm: "lease (contrato)", depositTerm: "deposit (fianza)",
  taxLabel: "IRPF rental income",
  tenancyTypes: [
    { label: "Vivienda habitual", description: "Primary residence; extendable to 5 years (7 if company)." },
    { label: "Temporary lease", description: "Non-residential / seasonal." },
  ],
  compliance: [
    { label: "Fianza deposit lodged", note: "1 month lodged with the regional housing authority." },
    { label: "Energy certificate", note: "Certificado de eficiencia energetica required." },
    { label: "Stressed-area caps", note: "Rent caps in declared stressed areas." },
    { label: "Habitability certificate", note: "Cedula de habitabilidad in several regions." },
  ],
  deposit: { cap: "1 month (residential); extra guarantee max 2 months.", protection: "Fianza lodged with the autonomous community." },
  checklist: ["Contrato de arrendamiento", "Energy certificate", "Fianza lodgement", "Inventory"],
  notices: [
    { label: "Notice not to renew", when: "End at statutory term", period: "4 months (landlord) / 2 (tenant)" },
    { label: "Rent update notice", when: "Annual update", period: "Per index; caps in stressed areas" },
  ],
  notes: ["Strong renewal rights up to 5-7 years.", "Declare on IRPF; reductions for habitual residence."],
};

const IN: RegionRuleset = {
  countryName: "India",
  governingLaw: "Model Tenancy Act 2021 & state rent acts", tenancyTerm: "rent agreement", depositTerm: "security deposit",
  taxLabel: "ITR - income from house property (TDS)",
  tenancyTypes: [
    { label: "Leave & licence", description: "Common 11-month renewable arrangement." },
    { label: "Lease", description: "Longer term; registration over set durations." },
  ],
  compliance: [
    { label: "Agreement registration", note: "Register and lodge with the Rent Authority (MTA)." },
    { label: "Police verification", note: "Tenant verification required in many cities." },
    { label: "Security deposit cap", note: "MTA caps residential deposits at 2 months." },
    { label: "TDS on rent", note: "Tenants deduct TDS over thresholds." },
  ],
  deposit: { cap: "Max 2 months (MTA); higher in some states.", protection: "Refunded within 1 month of vacating, less dues." },
  checklist: ["Rent agreement", "Agreement registration", "Police verification", "Deposit receipt"],
  notices: [
    { label: "Notice to vacate", when: "End the tenancy", period: "Per agreement (often 1-2 months)" },
    { label: "Eviction (Rent Authority)", when: "Default / breach", period: "Via the Rent Court" },
  ],
  notes: ["MTA is adopted state-by-state; check your state.", "Claim 30% standard deduction on house property income."],
};

const FR: RegionRuleset = {
  countryName: "France",
  governingLaw: "Loi n. 89-462 du 6 juillet 1989", tenancyTerm: "lease (bail)", depositTerm: "deposit (depot de garantie)",
  taxLabel: "Revenus fonciers (micro-foncier / reel)",
  tenancyTypes: [
    { label: "Bail vide (unfurnished)", description: "3-year lease (6 if company)." },
    { label: "Bail meuble (furnished)", description: "1-year lease (9 months students)." },
  ],
  compliance: [
    { label: "Diagnostics (DDT)", note: "DPE, lead, asbestos and risk diagnostics attached." },
    { label: "Decent housing standard", note: "Logement decent required." },
    { label: "Encadrement des loyers", note: "Rent caps in tense zones (Paris, Lille)." },
  ],
  deposit: { cap: "1 month (unfurnished) / 2 (furnished), excl. charges.", protection: "Returned within 1-2 months of handover." },
  checklist: ["Bail (lease)", "Etat des lieux", "Diagnostics (DDT)", "Deposit receipt"],
  notices: [
    { label: "Conge (notice to leave)", when: "Landlord ends at term", period: "6 months (unfurnished) / 3 (furnished)" },
    { label: "Rent revision", when: "Annual indexation", period: "Per IRL index" },
  ],
  notes: ["Valid grounds needed to end an unfurnished lease.", "Declare under revenus fonciers."],
};

const NL: RegionRuleset = {
  countryName: "Netherlands",
  governingLaw: "Dutch Civil Code (BW Book 7)", tenancyTerm: "tenancy (huurovereenkomst)", depositTerm: "deposit (waarborgsom)",
  taxLabel: "Box 3 / rental income",
  tenancyTypes: [
    { label: "Indefinite tenancy", description: "Open-ended; strong security of tenure." },
    { label: "Temporary tenancy", description: "Limited since the 2024 reform." },
  ],
  compliance: [
    { label: "Points system (WWS)", note: "Puntensysteem sets maximum rent for regulated homes." },
    { label: "Affordable Rent Act", note: "Mid-market caps from 2024." },
    { label: "Energy label", note: "Required; affects rent points." },
  ],
  deposit: { cap: "Typically 1-2 months' rent.", protection: "Returned within 14 days of handover." },
  checklist: ["Huurovereenkomst", "Inspection report", "Energy label", "Deposit receipt"],
  notices: [
    { label: "Notice to end", when: "Landlord on legal ground", period: "3-6 months by length" },
    { label: "Rent increase notice", when: "Annual increase", period: "Capped; Huurcommissie" },
  ],
  notes: ["Disputes: the Huurcommissie.", "Private landlords generally taxed under Box 3."],
};

const SG: RegionRuleset = {
  countryName: "Singapore",
  governingLaw: "Contract-based (no rent control)", tenancyTerm: "tenancy agreement", depositTerm: "security deposit",
  taxLabel: "IRAS rental income",
  tenancyTypes: [
    { label: "Private residential lease", description: "Typically 1-2 year agreement." },
    { label: "HDB lease", description: "Needs HDB subletting approval." },
  ],
  compliance: [
    { label: "Stamp duty", note: "Tenancy stamped with IRAS." },
    { label: "HDB approval", note: "Subletting an HDB flat needs approval + MOP." },
    { label: "Occupancy limits", note: "Max occupants per URA/HDB rules." },
  ],
  deposit: { cap: "Commonly 1 month per year of lease.", protection: "Refunded at end less damages; no statutory scheme." },
  checklist: ["Tenancy agreement", "Stamp duty certificate", "Inventory list", "Handover checklist"],
  notices: [
    { label: "Notice to terminate", when: "Per break/diplomatic clause", period: "Per agreement (often 2 months)" },
    { label: "Renewal notice", when: "Renew the tenancy", period: "Per agreement" },
  ],
  notes: ["No rent control; terms are contractual.", "Declare rental income to IRAS."],
};

const IT: RegionRuleset = {
  countryName: "Italy",
  governingLaw: "Legge 392/1978 & 431/1998", tenancyTerm: "lease (contratto)", depositTerm: "deposit (deposito cauzionale)", taxLabel: "Redditi da locazione (cedolare secca / IRPEF)",
  tenancyTypes: [{ label: "4+4 free-market lease", description: "4 years + 4 renewal." }, { label: "3+2 agreed-rent", description: "Canone concordato with tax relief." }],
  compliance: [{ label: "Lease registration", note: "Register with Agenzia Entrate or opt for cedolare secca." }, { label: "APE certificate", note: "Energy certificate required." }, { label: "Habitability", note: "Certificato di agibilità." }],
  deposit: { cap: "Up to 3 months' rent.", protection: "Returned with legal interest." },
  checklist: ["Contratto di locazione", "Lease registration", "APE certificate", "Inventory"],
  notices: [{ label: "Disdetta", when: "End at term", period: "6 months" }, { label: "Rent update", when: "Annual ISTAT", period: "Per ISTAT" }],
  notes: ["Cedolare secca is a flat-tax option.", "Register within 30 days."],
};

const PT: RegionRuleset = {
  countryName: "Portugal",
  governingLaw: "Novo Regime do Arrendamento Urbano (NRAU)", tenancyTerm: "lease (contrato)", depositTerm: "deposit (caução)", taxLabel: "IRS Categoria F",
  tenancyTypes: [{ label: "Contrato de arrendamento", description: "Standard urban lease." }, { label: "Short-term", description: "Limited-purpose lease." }],
  compliance: [{ label: "Lease reported to AT", note: "Report the lease to Finanças." }, { label: "Energy certificate", note: "Certificado energético required." }, { label: "Habitation licence", note: "Licença de utilização." }],
  deposit: { cap: "Commonly 1-2 months' rent.", protection: "Returned at end less amounts owed." },
  checklist: ["Contrato de arrendamento", "Energy certificate", "Habitation licence", "Rent receipts"],
  notices: [{ label: "Denúncia", when: "End the lease", period: "Per term" }, { label: "Rent update", when: "Annual coefficient", period: "Per coefficient" }],
  notes: ["Issue electronic rent receipts.", "Category F taxed at 25%."],
};

const CH: RegionRuleset = {
  countryName: "Switzerland",
  governingLaw: "Swiss Code of Obligations (CO) art. 253ff", tenancyTerm: "tenancy (Mietvertrag / bail)", depositTerm: "deposit (Mietkaution)", taxLabel: "Rental income (federal & cantonal)",
  tenancyTypes: [{ label: "Open-ended tenancy", description: "Standard ongoing lease." }, { label: "Fixed-term", description: "Ends without notice at the date." }],
  compliance: [{ label: "Blocked deposit account", note: "Max 3 months in a tenant-named blocked account." }, { label: "Official rent form", note: "Initial rent on cantonal form." }, { label: "Handover protocol", note: "At move-in and out." }],
  deposit: { cap: "Max 3 months' rent, blocked account.", protection: "Released with both parties' consent or court order." },
  checklist: ["Mietvertrag / bail", "Handover protocol", "Blocked deposit account", "House rules"],
  notices: [{ label: "Termination (form)", when: "Landlord ends", period: "3 months, official form" }, { label: "Rent increase", when: "Reference-rate change", period: "Official form" }],
  notes: ["Rent can be challenged via conciliation.", "Deposit sits in a blocked account."],
};

const JP: RegionRuleset = {
  countryName: "Japan",
  governingLaw: "Act on Land and Building Leases", tenancyTerm: "lease (chintai)", depositTerm: "deposit (shikikin)", taxLabel: "Real estate income (kakutei shinkoku)",
  tenancyTypes: [{ label: "Ordinary lease", description: "Strong renewal rights." }, { label: "Fixed-term lease", description: "Ends at term; no renewal." }],
  compliance: [{ label: "Building safety", note: "Fire/earthquake standards." }, { label: "Important matters explanation", note: "Juyo jiko setsumei before signing." }, { label: "Renewal fee", note: "Koshinryo often applies." }],
  deposit: { cap: "Shikikin 1-2 months; reikin in some areas.", protection: "Refunded less restoration (genjo kaifuku)." },
  checklist: ["Lease agreement", "Important matters explanation", "Guarantor / guarantee company", "Inventory"],
  notices: [{ label: "Termination", when: "End the lease", period: "~1 month (tenant)" }, { label: "Non-renewal", when: "Landlord refuses", period: "6 months + just cause" }],
  notes: ["Just cause needed to refuse renewal.", "Declare via kakutei shinkoku."],
};

const MX: RegionRuleset = {
  countryName: "Mexico",
  governingLaw: "State Civil Codes", tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (depósito)", taxLabel: "ISR arrendamiento (SAT)",
  tenancyTypes: [{ label: "Contrato de arrendamiento", description: "Residential lease, often 1 year." }, { label: "Renewable", description: "Tácita reconducción." }],
  compliance: [{ label: "Registration (some states)", note: "Ratification required in some states." }, { label: "Fiador / guarantee", note: "Fiador or póliza jurídica common." }, { label: "CFDI invoicing", note: "Issue CFDI invoices via SAT." }],
  deposit: { cap: "Commonly 1 month's deposit.", protection: "Refunded less damages/arrears." },
  checklist: ["Contrato de arrendamiento", "Fiador / guarantee", "CFDI rent invoices", "Inventario"],
  notices: [{ label: "Aviso", when: "End the lease", period: "Per contract/state" }, { label: "Rent update", when: "Annual", period: "Per contract/inflation" }],
  notes: ["Rules vary by state code.", "Issue CFDI; declare ISR."],
};

const BR: RegionRuleset = {
  countryName: "Brazil",
  governingLaw: "Lei do Inquilinato (8.245/1991)", tenancyTerm: "lease (contrato de locação)", depositTerm: "deposit (caução)", taxLabel: "IRPF aluguéis (carnê-leão)",
  tenancyTypes: [{ label: "Residential 30 months+", description: "Allows end at term." }, { label: "Shorter lease", description: "Renews; limits end without cause." }],
  compliance: [{ label: "Guarantee", note: "Caução, fiador or seguro-fiança - one only." }, { label: "Vistoria", note: "Entry and exit inspections." }, { label: "Condominium rules", note: "Convenção de condomínio." }],
  deposit: { cap: "Caução up to 3 months' rent.", protection: "Returned with savings interest." },
  checklist: ["Contrato de locação", "Vistoria de entrada", "Guarantee document", "Rent receipts"],
  notices: [{ label: "Notificação", when: "End the lease", period: "30 days / per contract" }, { label: "Reajuste", when: "Annual", period: "Per IGP-M / IPCA" }],
  notes: ["Only one guarantee type allowed.", "Declare via carnê-leão; annual IRPF."],
};

const BE: RegionRuleset = {
  countryName: "Belgium",
  governingLaw: "Regional housing codes", tenancyTerm: "lease (bail)", depositTerm: "deposit (garantie locative)", taxLabel: "Cadastral & rental income",
  tenancyTypes: [{ label: "Main residence lease", description: "9-year default in most regions." }, { label: "Short lease", description: "3 years or less." }],
  compliance: [{ label: "Lease registration", note: "Mandatory (free)." }, { label: "Energy certificate", note: "PEB/EPC required." }, { label: "Blocked deposit", note: "Tenant-named blocked account." }],
  deposit: { cap: "2-3 months in a blocked account.", protection: "Released with both parties or a judge." },
  checklist: ["Lease", "Lease registration", "Energy certificate", "Inventory"],
  notices: [{ label: "Congé", when: "End the lease", period: "Region/ground dependent" }, { label: "Indexation", when: "Annual", period: "Per health index" }],
  notes: ["Law differs by region.", "Entry inventory advised."],
};

const AT: RegionRuleset = {
  countryName: "Austria",
  governingLaw: "Mietrechtsgesetz (MRG)", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", taxLabel: "Einkünfte aus Vermietung (E1b)",
  tenancyTypes: [{ label: "Unlimited tenancy", description: "Open-ended." }, { label: "Fixed-term", description: "Min. 3 years for MRG flats." }],
  compliance: [{ label: "Deposit invested", note: "~3 months held with interest." }, { label: "Richtwert caps", note: "Reference-value caps for old buildings." }, { label: "Operating costs", note: "Betriebskosten statement." }],
  deposit: { cap: "Typically 3 months.", protection: "Returned with interest less claims." },
  checklist: ["Mietvertrag", "Handover protocol", "Deposit confirmation", "Operating costs"],
  notices: [{ label: "Termination", when: "MRG grounds", period: "Court/statutory" }, { label: "Rent increase", when: "Index/Richtwert", period: "Per index" }],
  notes: ["MRG applies to many old buildings.", "Stamp duty may apply."],
};

const PL: RegionRuleset = {
  countryName: "Poland",
  governingLaw: "Civil Code & Tenant Protection Act", tenancyTerm: "lease (umowa najmu)", depositTerm: "deposit (kaucja)", taxLabel: "Ryczałt / PIT",
  tenancyTypes: [{ label: "Standard lease", description: "Civil-code lease." }, { label: "Occasional lease", description: "Najem okazjonalny with notary." }],
  compliance: [{ label: "Deposit cap", note: "Up to 12 months (commonly 1)." }, { label: "Handover protocol", note: "Protokół at move-in." }, { label: "Occasional registration", note: "Notarial + tax office." }],
  deposit: { cap: "Up to 12 months (commonly 1).", protection: "Returned within 1 month." },
  checklist: ["Umowa najmu", "Handover protocol", "Deposit receipt", "Notarial act (if used)"],
  notices: [{ label: "Termination", when: "End lease", period: "Per code/contract" }, { label: "Rent increase", when: "Raise rent", period: "3 months' notice" }],
  notes: ["Occasional lease eases eviction.", "Ryczałt flat tax common."],
};

const SA: RegionRuleset = {
  countryName: "Saudi Arabia",
  governingLaw: "Ejar network & tenancy rules", tenancyTerm: "lease (Ejar contract)", depositTerm: "security deposit", taxLabel: "No income tax; VAT records",
  tenancyTypes: [{ label: "Annual lease", description: "12-month Ejar contract." }],
  compliance: [{ label: "Ejar registration", note: "Register on the Ejar network." }, { label: "Utilities clearance", note: "SEC/water at move-out." }],
  deposit: { cap: "Commonly 1 month.", protection: "Refunded less damages." },
  checklist: ["Ejar contract", "Tenant ID", "Utilities account", "Inventory"],
  notices: [{ label: "Eviction", when: "Valid grounds", period: "Via Ejar/committee" }, { label: "Non-renewal", when: "End at term", period: "Per contract" }],
  notes: ["Ejar underpins disputes.", "No personal income tax."],
};

const QA: RegionRuleset = {
  countryName: "Qatar",
  governingLaw: "Law No. 4 of 2008", tenancyTerm: "lease contract", depositTerm: "security deposit", taxLabel: "No income tax",
  tenancyTypes: [{ label: "Annual lease", description: "12-month contract." }],
  compliance: [{ label: "Lease registration", note: "Register with the municipality." }, { label: "Kahramaa utilities", note: "Account and clearance." }],
  deposit: { cap: "Commonly 1-2 months.", protection: "Refunded less damages." },
  checklist: ["Lease contract", "Lease registration", "Kahramaa account", "Inventory"],
  notices: [{ label: "Eviction", when: "Valid grounds", period: "Rental Dispute Committee" }, { label: "Rent increase", when: "Increase rent", period: "Per committee" }],
  notes: ["Disputes: Rental Dispute Committee.", "No personal income tax."],
};

const HK: RegionRuleset = {
  countryName: "Hong Kong",
  governingLaw: "Landlord and Tenant (Consolidation) Ordinance", tenancyTerm: "tenancy agreement", depositTerm: "deposit", taxLabel: "Property tax (IRD)",
  tenancyTypes: [{ label: "Fixed-term tenancy", description: "Common 1+1 year." }, { label: "Periodic tenancy", description: "Rolling." }],
  compliance: [{ label: "Stamp duty", note: "Stamp the tenancy with IRD." }, { label: "Property tax", note: "On rental income." }, { label: "Building management", note: "DMC / management rules." }],
  deposit: { cap: "Typically 2 months.", protection: "Refunded less damages." },
  checklist: ["Tenancy agreement", "Stamping (IRD)", "Inventory", "Handover checklist"],
  notices: [{ label: "Notice to quit", when: "End tenancy", period: "Per agreement" }, { label: "Rent review", when: "On renewal", period: "Per agreement" }],
  notes: ["Stamp promptly to avoid penalties.", "Property tax on net assessable value."],
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
      { label: "Gas safety certificate", note: "Annual (where gas present).", detail: "CP12 by a Gas Safe engineer every 12 months where gas appliances are present; give the tenant a copy. Lintel reminds you before it expires." },
      { label: "EICR (electrical)", note: "Every 5 years.", detail: "Electrical Installation Condition Report at least every 5 years (England). Supply to the tenant within 28 days and remedy C1/C2 faults promptly." },
      { label: "EPC", note: "Valid certificate required to let.", detail: "A valid Energy Performance Certificate (min band E in England/Wales) is required to let and lasts 10 years." },
      { label: "Deposit protection", note: "Protect within the deadline.", detail: "Protect the deposit in an approved scheme and serve prescribed information within 30 days; failure blocks Section 21 and risks penalties." },
    ],
    deposit: { cap: "5 weeks' rent (annual rent < £50k), else 6 weeks.", protection: "Protect within 30 days in an approved scheme." },
    checklist: ["Tenancy agreement", "EPC", "Gas safety certificate", region === "england" ? "Right to Rent check" : "Deposit prescribed information"],
    notices: [
      { label: "Possession notice", when: "Statutory grounds", period: "Grounds-dependent", detail: "Possession is on statutory grounds; the notice period depends on the grounds relied upon. Build and print it in the Notice generator." },
      { label: "Rent increase notice", when: "Increase rent", period: region === "scotland" ? "3 months" : "1-2 months" },
    ],
    notes: ["Jurisdiction-correct notices and court-readiness in the web app.", "Records map to SA105 for Self Assessment / MTD."],
  };
}


const SUBREGION_RULES: Record<string, { name: string; depositCap?: string; depositReturn?: string; extra: { label: string; note: string }[]; notes: string[] }> = {
  us_ca: { name: "California", depositCap: "Max 1 month's rent (2 for small landlords) — AB 12.", depositReturn: "Itemised return within 21 days.", extra: [{ label: "Just-cause & rent cap", note: "AB 1482: increases capped 5% + CPI (max 10%)." }, { label: "State disclosures", note: "Lead, Megan's Law, mold, bed bugs, flood, Prop 65." }], notes: ["Notice: 30 days (<1 yr), 60 days (≥1 yr).", "LA & SF add local rent control."] },
  us_tx: { name: "Texas", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extra: [{ label: "Security devices", note: "Statutory locks and smoke detectors required." }], notes: ["Notice: 30 days.", "No state rent control."] },
  us_ny: { name: "New York", depositCap: "Max 1 month's rent — HSTPA 2019.", depositReturn: "Itemised return within 14 days.", extra: [{ label: "Rent stabilization", note: "NYC stabilized units have renewal & increase limits." }], notes: ["Notice: 30/60/90 days by length.", "Good-cause eviction in NYC & opt-in areas."] },
  us_fl: { name: "Florida", depositCap: "No statutory cap.", depositReturn: "15 days (no deductions) or 30 with notice.", extra: [{ label: "Deposit holding disclosure", note: "Disclose where the deposit is held within 30 days." }], notes: ["Notice: 30 days (15 weekly).", "No state rent control."] },
  us_il: { name: "Illinois", depositCap: "No state cap.", depositReturn: "30–45 days; interest in larger buildings.", extra: [{ label: "Chicago RLTO", note: "Adds deposit interest, receipts and summaries." }], notes: ["Notice: 30 days.", "No statewide rent control."] },
  us_wa: { name: "Washington", depositCap: "No statutory cap.", depositReturn: "Itemised return within 21 days.", extra: [{ label: "Just cause to end", note: "Statewide just-cause required (2021)." }], notes: ["Rent increase notice: 60 days.", "Seattle adds protections."] },
  us_ga: { name: "Georgia", depositCap: "No statutory cap.", depositReturn: "Itemised return within 30 days.", extra: [{ label: "Move-in/out inspection", note: "Required where a deposit is held." }], notes: ["Notice: 30 days (landlord 60).", "No rent control."] },
  us_nj: { name: "New Jersey", depositCap: "Max 1.5 months' rent.", depositReturn: "30 days, with interest.", extra: [{ label: "Truth in Renting", note: "Provide the statement (non-owner-occupied)." }], notes: ["Local rent control is common.", "Notice to quit varies by ground."] },
  us_co: { name: "Colorado", depositCap: "No statutory cap.", depositReturn: "30 days (up to 60 if the lease says).", extra: [{ label: "Warranty of habitability", note: "Strengthened repair timelines." }], notes: ["Rent increase notice: 60 days.", "No statewide rent control."] },
  us_az: { name: "Arizona", depositCap: "Max 1.5 months' rent.", depositReturn: "Within 14 business days.", extra: [{ label: "Move-in checklist", note: "Tenant may request a condition form." }], notes: ["Notice: 30 days.", "No rent control."] },

  us_pa: { name: "Pennsylvania", depositCap: "Max 2 months (yr 1), 1 month thereafter.", depositReturn: "Within 30 days.", extra: [{ label: "Escrow over $100", note: "Deposits over $100 held 2+ years in escrow with interest." }], notes: ["Notice to quit: 15-30 days.", "No state rent control."] },
  us_oh: { name: "Ohio", depositCap: "No statutory cap.", depositReturn: "Within 30 days.", extra: [{ label: "Deposit interest", note: "Interest over $50 / 6+ months." }], notes: ["Notice: 30 days.", "No rent control."] },
  us_nc: { name: "North Carolina", depositCap: "1.5 months (m-t-m) / 2 months (longer).", depositReturn: "Within 30 days (up to 60).", extra: [{ label: "Trust account", note: "Held in a NC trust account or bonded." }], notes: ["Notice: 7 days.", "No rent control."] },
  us_mi: { name: "Michigan", depositCap: "Max 1.5 months.", depositReturn: "Within 30 days.", extra: [{ label: "Inventory checklist", note: "Required to keep a deposit." }], notes: ["Notice: 30 days.", "No rent control."] },
  us_va: { name: "Virginia", depositCap: "Max 2 months.", depositReturn: "Within 45 days.", extra: [{ label: "VRLTA disclosures", note: "Move-in report and statutory disclosures." }], notes: ["Notice: 30 days.", "No rent control."] },
  ae_dubai: { name: "Dubai", depositCap: "5% (unfurnished) / 10% (furnished) of annual rent.", depositReturn: "Refunded at end less damages.", extra: [{ label: "Ejari registration", note: "Contracts registered with Ejari (RERA/DLD)." }, { label: "RERA rental index", note: "Increases capped; Decree 43 of 2013." }, { label: "Eviction notice", note: "12 months' notarised notice (Law 33/2008)." }], notes: ["Disputes: Dubai Rental Dispute Centre.", "Cheque-based rent is standard."] },
  ae_abu_dhabi: { name: "Abu Dhabi", depositCap: "5% (unfurnished) / 10% (furnished).", depositReturn: "Refunded at end less damages.", extra: [{ label: "Tawtheeq registration", note: "Contracts registered via Tawtheeq (ADM)." }], notes: ["Check current ADREC rent-cap rules.", "Cheque-based rent is standard."] },
  ae_sharjah: { name: "Sharjah", extra: [{ label: "Municipality registration", note: "Contracts attested via Sharjah Municipality." }], notes: ["Disputes via the Sharjah rent committee."] },

  za_gauteng: { name: "Gauteng", extra: [{ label: "Gauteng Rental Housing Tribunal", note: "Free dispute resolution; provincial regulations apply." }], notes: ["Deposit + interest returned within 7–14 days after outgoing inspection."] },
  za_western_cape: { name: "Western Cape", extra: [{ label: "Western Cape Rental Housing Tribunal", note: "Free dispute resolution; provincial regulations apply." }], notes: ["Deposit must be invested; interest to the tenant."] },
  za_kwazulu_natal: { name: "KwaZulu-Natal", extra: [{ label: "KZN Rental Housing Tribunal", note: "Free dispute resolution; provincial regulations apply." }], notes: ["Joint incoming and outgoing inspections required."] },

  au_nsw: { name: "New South Wales", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Via Rental Bonds Online after exit report.", extra: [{ label: "NSW standards", note: "Residential Tenancies Act 2010." }], notes: ["Rent increase: 60 days; once per 12 months."] },
  au_vic: { name: "Victoria", depositCap: "Bond max 1 month's rent.", depositReturn: "Lodged with the RTBA.", extra: [{ label: "Victorian minimum standards", note: "Residential Tenancies Act 1997." }], notes: ["Rent increase: 60 days; once per 12 months."] },
  au_qld: { name: "Queensland", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Lodged with the RTA.", extra: [{ label: "QLD minimum housing standards", note: "RTRA Act 2008." }], notes: ["Rent increase: 2 months; once per 12 months."] },
  au_wa: { name: "Western Australia", depositCap: "Bond max 4 weeks' rent.", depositReturn: "Lodged with the Bond Administrator.", extra: [{ label: "WA standards", note: "Residential Tenancies Act 1987." }], notes: ["Rent increase: 60 days; not within 6 months."] },

  ca_on: { name: "Ontario", depositCap: "No security deposit; last-month-rent only.", depositReturn: "Applied to final month; interest payable.", extra: [{ label: "Standard lease form", note: "Ontario standard lease mandatory for most tenancies." }], notes: ["Disputes: Landlord and Tenant Board (LTB).", "Rent increase: guideline + 90 days."] },
  ca_bc: { name: "British Columbia", depositCap: "Max half a month's rent (+ pet deposit).", depositReturn: "Within 15 days or claim via RTB.", extra: [{ label: "Condition inspection", note: "Move-in/out inspection reports required." }], notes: ["Disputes: Residential Tenancy Branch (RTB).", "Rent increase: annual cap + 3 months."] },
  ca_ab: { name: "Alberta", depositCap: "Max 1 month's rent.", depositReturn: "Within 10 days with a statement.", extra: [{ label: "Inspection report", note: "Move-in/out reports required." }], notes: ["Disputes: RTDRS.", "No rent control."] },
  ca_qc: { name: "Quebec", depositCap: "Deposits not permitted.", depositReturn: "Not applicable.", extra: [{ label: "Lease (TAL form)", note: "Mandatory TAL lease; disclose prior rent (Section G)." }], notes: ["Disputes: Tribunal administratif du logement (TAL).", "Lease may be in French."] },
  it_lazio: { name: "Lazio", extra: [{ label: "Rome local agreement", note: "Canone concordato reduces rent with tax relief." }], notes: ["High demand; check accordo territoriale."] },
  it_lombardy: { name: "Lombardy", extra: [{ label: "Milan local agreement", note: "Canone concordato applies in Milan." }], notes: [] },
  it_campania: { name: "Campania", extra: [{ label: "Naples local agreement", note: "Local agreed-rent agreement." }], notes: [] },
  it_sicily: { name: "Sicily", extra: [], notes: ["Check local agreed-rent agreements."] },
  ch_zurich: { name: "Zurich", extra: [{ label: "Official rent form", note: "Initial rent on the official form." }], notes: ["Disputes: Schlichtungsbehörde."] },
  ch_geneva: { name: "Geneva", extra: [{ label: "Formule officielle", note: "Mandatory initial-rent form; LDTR limits conversions." }], notes: ["Strong tenant protection."] },
  ch_vaud: { name: "Vaud", extra: [{ label: "Formule officielle", note: "Mandatory initial-rent form." }], notes: [] },
  ch_ticino: { name: "Ticino", extra: [], notes: ["Official form applies; conciliation handles disputes."] },
  jp_tokyo: { name: "Tokyo", extra: [{ label: "Key money & guarantor", note: "Reikin and guarantor company standard." }], notes: ["Renewal fee common."] },
  jp_osaka: { name: "Osaka", extra: [{ label: "Shikibiki custom", note: "Kansai-style deposit deduction." }], notes: [] },
  br_sao_paulo: { name: "São Paulo", extra: [{ label: "Seguro-fiança common", note: "Rental insurance widely used." }], notes: [] },
  br_rio_de_janeiro: { name: "Rio de Janeiro", extra: [], notes: ["State courts handle disputes."] },
};

function withSub(base: RegionRuleset, code?: string | null): RegionRuleset {
  const r = code ? SUBREGION_RULES[code] : undefined;
  if (!r) return base;
  return { ...base, subregionName: r.name, deposit: r.depositCap ? { cap: r.depositCap, protection: r.depositReturn ?? base.deposit.protection } : base.deposit, compliance: [...base.compliance, ...r.extra], notes: [...r.notes, ...base.notes] };
}

export function resolveRegion(country?: string | null, region?: string | null, regionCode?: string | null): RegionRuleset {
  const cc = (country ?? "GB").toUpperCase();
  if (cc === "US") return withSub(US, regionCode);
  if (cc === "AE") return withSub(AE, regionCode);
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
  return uk(region);
}

