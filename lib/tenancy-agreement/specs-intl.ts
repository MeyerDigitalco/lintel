import type { AgreementSpec } from "./types";

/**
 * International agreement specs.
 *
 * Each spec carries the details that region actually requires on top of the
 * universal set in core.ts, plus the statutory clauses that make the document
 * recognisable to a local lawyer. Where a country mandates a registered or
 * notarised instrument, prescribedForm is set and the UI leads with it.
 */

export const IE_SPEC: AgreementSpec = {
  key: "IE",
  countryName: "Ireland",
  documentTitle: "Residential Tenancy Agreement",
  version: "IE-2024.1",
  statutoryBasis: "Residential Tenancies Act 2004 as amended, including the Residential Tenancies (Amendment) Acts 2019 to 2024",
  legislationUrl: "https://www.irishstatutebook.ie/eli/2004/act/27/enacted/en/html",
  fields: [
    { key: "rtb_number", label: "RTB registration number", type: "text", required: true, hint: "Every tenancy must be registered with the Residential Tenancies Board within one month of commencement, and re-registered annually. An unregistered landlord cannot use the RTB dispute service." },
    { key: "ber_rating", label: "BER rating", type: "text", required: true, hint: "A Building Energy Rating certificate must be given to the tenant." },
    { key: "rpz", label: "Rent Pressure Zone", type: "select", options: ["Property is in a Rent Pressure Zone", "Property is not in a Rent Pressure Zone"], required: true, hint: "In an RPZ, rent increases are restricted by formula and cannot be reviewed more than once a year. Check the RTB's RPZ calculator." },
  ],
  clauses: [
    { id: "ie_type", heading: "Type of tenancy", statutory: true, basis: "Residential Tenancies Act 2004 Part 4",
      body: "This is a residential tenancy under the Residential Tenancies Act 2004.\n\nAfter 6 months' continuous occupation the Tenant acquires Part 4 rights and may remain for the duration of the tenancy cycle, subject only to the statutory grounds for termination. Since 11 June 2022 tenancies of unlimited duration apply: a tenancy that has lasted more than 6 months becomes a tenancy of unlimited duration and does not expire." },
    { id: "ie_rtb", heading: "RTB registration", statutory: true, basis: "Residential Tenancies Act 2004 Part 7",
      body: "The Landlord will register this tenancy with the Residential Tenancies Board within one month of commencement. RTB registration number: {{rtb_number}}.\n\nRegistration must be renewed annually. Failure to register is an offence and prevents the Landlord using the RTB dispute resolution service, while the Tenant may still use it." },
    { id: "ie_rent", heading: "Rent and rent review", statutory: true, basis: "Residential Tenancies Act 2004 ss.19-24; Residential Tenancies (Amendment) Act 2021",
      body: "The rent is {{rent_amount}} {{rent_period}}. Rent may not exceed market rent.\n\nRent Pressure Zone status: {{rpz}}.\n\nRent may be reviewed no more than once in any 12 month period. The Landlord must give at least 90 days' notice of a new rent, in the prescribed form, with details of three comparable properties.\n\nWhere the property is in a Rent Pressure Zone, any increase is capped by the statutory formula. Setting a rent above the cap is unlawful and the tenant may recover the excess." },
    { id: "ie_deposit", heading: "Deposit", statutory: true, basis: "Residential Tenancies Act 2004 s.12; Residential Tenancies (Amendment) Act 2021 s.6",
      body: "The deposit is {{deposit_amount}}. A deposit and any advance rent payment together may not exceed the equivalent of two months' rent.\n\nThe deposit must be returned promptly at the end of the tenancy less any lawful deduction, with reasons given in writing. Deposit disputes go to the RTB." },
    { id: "ie_ending", heading: "Ending the tenancy", statutory: true, basis: "Residential Tenancies Act 2004 Part 5, s.34 and Table 1 to s.66",
      body: "The Landlord may terminate only on a statutory ground and only by a valid notice of termination in the prescribed form, containing the prescribed information and the correct notice period.\n\nNotice periods increase with the length of the tenancy, from 90 days for a tenancy under 6 months up to 224 days for a tenancy of 8 years or more.\n\nA notice served for reasons of sale, refurbishment or occupation by the landlord or a family member must be accompanied by a statutory declaration, and the tenant may have a right of first refusal if the property is re-let.\n\nDisputes are determined by the RTB, not the courts. Self help eviction is unlawful." },
    { id: "ie_standards", heading: "Minimum standards", statutory: true, basis: "Housing (Standards for Rented Houses) Regulations 2019",
      body: "The Property meets the minimum standards for rented houses, covering structural condition, sanitary facilities, heating, ventilation, light, safety of gas, oil and electrical installations, fire safety including a fire blanket and self contained smoke alarms, refuse facilities and the provision of specified appliances.\n\nA Building Energy Rating certificate rated {{ber_rating}} has been given to the Tenant." },
  ],
  attachments: [
    { label: "BER certificate", note: "Must be given to the tenant." },
    { label: "RTB registration confirmation", note: "Within one month of commencement, renewed annually." },
    { label: "Inventory and schedule of condition", note: "" },
  ],
  warnings: [
    "Tenancies of unlimited duration apply since June 2022. A fixed end date does not end a Part 4 tenancy.",
    "In a Rent Pressure Zone the rent you may charge is capped by formula. Use the RTB calculator before setting or reviewing rent.",
  ],
};

export const US_SPEC: AgreementSpec = {
  key: "US",
  countryName: "United States",
  documentTitle: "Residential Lease Agreement",
  version: "US-2024.1",
  statutoryBasis: "State landlord tenant law, plus the federal Fair Housing Act and, for pre-1978 housing, the Residential Lead-Based Paint Hazard Reduction Act",
  legislationUrl: "https://www.hud.gov/topics/rental_assistance/tenantrights",
  fields: [
    { key: "us_state", label: "State", type: "text", required: true, hint: "Landlord tenant law is state law and varies enormously. Deposit caps, notice periods and disclosure duties all change at the state line." },
    { key: "built_before_1978", label: "Built before 1978", type: "select", options: ["Yes", "No"], required: true, hint: "If yes, federal law requires the lead based paint disclosure and the EPA pamphlet before the tenant is obligated." },
    { key: "deposit_holding", label: "Where the deposit is held", type: "text", hint: "Several states require a separate or interest bearing account and disclosure of the institution." },
    { key: "late_fee", label: "Late fee", type: "text", hint: "Many states cap late fees or require a grace period." },
    { key: "state_disclosures", label: "State required disclosures made", type: "longtext", hint: "For example mold, bed bugs, flooding history, methamphetamine contamination, rent control status, radon, megan's law." },
  ],
  clauses: [
    { id: "us_law", heading: "Governing law", statutory: true, basis: "State landlord tenant statute",
      body: "This lease is governed by the landlord tenant law of the State of {{us_state}} and by any applicable county or city ordinance, including any rent stabilisation or just cause eviction ordinance.\n\nWhere a term of this lease conflicts with that law, the law prevails and the term is void to the extent of the conflict." },
    { id: "us_fair_housing", heading: "Fair housing", statutory: true, basis: "Fair Housing Act, 42 U.S.C. 3601 et seq.",
      body: "The Landlord does not discriminate on the basis of race, colour, national origin, religion, sex including sexual orientation and gender identity, familial status or disability, and complies with any additional protected class recognised by state or local law.\n\nThe Landlord will make reasonable accommodations and permit reasonable modifications for a tenant with a disability, including allowing an assistance animal regardless of any pet restriction in this lease and without a pet deposit." },
    { id: "us_lead", heading: "Lead based paint disclosure", statutory: true, basis: "42 U.S.C. 4852d; 24 CFR Part 35; 40 CFR Part 745",
      body: "Property built before 1978: {{built_before_1978}}.\n\nWhere the Property was built before 1978, the Landlord has disclosed all known lead based paint and lead based paint hazards, provided any available records and reports, and given the Tenant the EPA pamphlet Protect Your Family From Lead In Your Home. The Tenant has had the opportunity to review that information before becoming obligated under this lease.\n\nFailure to comply carries civil and criminal penalties and treble damages." },
    { id: "us_deposit", heading: "Security deposit", statutory: true, basis: "State security deposit statute",
      body: "The security deposit is {{deposit_amount}}, held at {{deposit_holding}}.\n\nState law governs the maximum deposit, whether it must be held separately or bear interest, the deadline for return, and the itemisation required. The Landlord will comply with those requirements.\n\nMany states impose multiple damages where a deposit is wrongfully withheld or the itemisation deadline is missed." },
    { id: "us_disclosures", heading: "State and local disclosures", statutory: true, basis: "State and local disclosure statutes",
      body: "The following disclosures have been made to the Tenant: {{state_disclosures}}" },
    { id: "us_ending", heading: "Termination and eviction", statutory: true, basis: "State forcible entry and detainer / unlawful detainer statute",
      body: "Termination requires the notice the law of {{us_state}} prescribes for the ground relied on.\n\nThe Landlord may not evict by self help. Changing the locks, removing the Tenant's belongings, or shutting off utilities to force the Tenant out is unlawful in every state and exposes the Landlord to damages. Possession requires a court judgment and execution by a sheriff or marshal.\n\nRetaliatory eviction, meaning termination because the Tenant complained to a code authority or exercised a legal right, is prohibited." },
    { id: "us_habitability", heading: "Implied warranty of habitability", statutory: true, basis: "State common law and housing codes",
      body: "The Landlord must maintain the Property in a habitable condition, meeting applicable building and housing codes materially affecting health and safety, for the duration of the tenancy.\n\nThis warranty cannot be waived by the Tenant. Depending on the state, the Tenant may have the remedy of repair and deduct, rent withholding, or termination where the Landlord fails to repair after notice." },
  ],
  attachments: [
    { label: "Lead based paint disclosure and EPA pamphlet", note: "Federal requirement for any property built before 1978." },
    { label: "State required disclosures", note: "Varies by state. Check your state's list." },
    { label: "Move in condition checklist", note: "Required in many states before a deposit deduction can be made." },
  ],
  warnings: [
    "United States landlord tenant law is state law. This template is a general framework and must be adjusted to your state, and to any local rent control or just cause ordinance.",
    "City ordinances can be stricter than state law. New York City, San Francisco, Los Angeles, Seattle, Chicago and Washington DC all have their own regimes.",
  ],
};

export const AU_SPEC: AgreementSpec = {
  key: "AU",
  countryName: "Australia",
  documentTitle: "Residential Tenancy Agreement",
  version: "AU-2024.1",
  statutoryBasis: "State and territory Residential Tenancies Acts",
  legislationUrl: "https://www.legislation.gov.au/",
  prescribedForm: {
    name: "State or territory standard form residential tenancy agreement",
    url: "https://www.fairtrading.nsw.gov.au/housing-and-property/renting",
    note: "Every Australian state and territory prescribes a standard form agreement. Using anything else risks the agreement being non compliant. Use the standard form for your state and treat this as preparation.",
  },
  fields: [
    { key: "au_state", label: "State or territory", type: "select", options: ["New South Wales", "Victoria", "Queensland", "South Australia", "Western Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"], required: true },
    { key: "bond_number", label: "Bond lodgement number", type: "text", hint: "The bond must be lodged with the state bond authority, usually within 10 working days." },
    { key: "condition_report_date", label: "Entry condition report date", type: "date", required: true, hint: "Without an entry condition report you will struggle to claim against the bond." },
    { key: "min_standards", label: "Minimum standards met", type: "checkbox", required: true, hint: "Most states now set minimum rental standards covering heating, ventilation, locks, and safety." },
  ],
  clauses: [
    { id: "au_law", heading: "Governing law", statutory: true, basis: "State/territory Residential Tenancies Act",
      body: "This agreement is governed by the Residential Tenancies Act applying in {{au_state}}.\n\nThe standard terms prescribed by that Act apply to this agreement whether or not they are written in it. A term that is inconsistent with the Act, or that purports to exclude or limit the Act, is void." },
    { id: "au_bond", heading: "Bond", statutory: true, basis: "State/territory bond lodgement requirements",
      body: "The bond is {{deposit_amount}} and will be lodged with the bond authority for {{au_state}}. Lodgement number: {{bond_number}}.\n\nThe bond is generally capped at 4 weeks' rent. It must be lodged with the authority, not held by the Landlord or agent.\n\nAt the end of the tenancy the bond is released by agreement or by determination of the relevant tribunal, against the entry and exit condition reports." },
    { id: "au_condition", heading: "Condition report", statutory: true, basis: "State/territory Residential Tenancies Act",
      body: "An entry condition report dated {{condition_report_date}} has been prepared and given to the Tenant before or at the start of the tenancy. The Tenant should complete their part and return it within the statutory period.\n\nAn exit condition report will be completed at the end of the tenancy. The bond is assessed against the difference between the two, allowing for fair wear and tear." },
    { id: "au_rent", heading: "Rent increases", statutory: true, basis: "State/territory Residential Tenancies Act",
      body: "Rent may not be increased during a fixed term unless the agreement expressly provides for it.\n\nFor a periodic agreement the Landlord must give written notice of an increase in the prescribed form. The notice period is at least 60 days in most jurisdictions.\n\nSeveral jurisdictions now limit increases to once in any 12 month period. The Tenant may apply to the tribunal if an increase is excessive." },
    { id: "au_ending", heading: "Ending the tenancy", statutory: true, basis: "State/territory Residential Tenancies Act",
      body: "Termination requires a notice in the prescribed form giving the notice period the Act requires for the ground relied on.\n\nNo grounds terminations have been abolished or restricted in a growing number of jurisdictions. Confirm what applies in {{au_state}} before giving notice.\n\nIf the Tenant does not leave, the Landlord must apply to the tribunal for a termination and possession order. Self help eviction is unlawful." },
    { id: "au_standards", heading: "Minimum standards and safety", statutory: true, basis: "State/territory minimum standards regulations",
      body: "The Property meets the minimum standards applying in {{au_state}}, which typically cover functioning locks, adequate ventilation, hot and cold water, a functioning stovetop, window coverings in bedrooms and living areas, and a fixed heater in the main living area.\n\nSmoke alarms are installed and maintained as required, and are tested at the start of each tenancy.\n\nWhere the Property has a swimming pool or spa, a compliant safety barrier and certificate are in place." },
  ],
  attachments: [
    { label: "State standard form agreement", note: "Prescribed in every state and territory." },
    { label: "Tenant information statement", note: "For example the NSW Tenant Information Statement, or the Victorian Renting a home guide." },
    { label: "Entry condition report", note: "" },
    { label: "Bond lodgement receipt", note: "" },
  ],
  warnings: [
    "Australian residential tenancy law is state and territory law and each jurisdiction prescribes its own standard form. Use it.",
    "Bond must go to the state authority. Holding it yourself is an offence.",
  ],
};

export const NZ_SPEC: AgreementSpec = {
  key: "NZ",
  countryName: "New Zealand",
  documentTitle: "Residential Tenancy Agreement",
  version: "NZ-2024.1",
  statutoryBasis: "Residential Tenancies Act 1986; Residential Tenancies (Healthy Homes Standards) Regulations 2019",
  legislationUrl: "https://www.legislation.govt.nz/act/public/1986/0120/latest/DLM94278.html",
  fields: [
    { key: "healthy_homes_statement", label: "Healthy Homes compliance statement attached", type: "checkbox", required: true, hint: "Every new or renewed tenancy agreement must include a signed Healthy Homes compliance statement. Failure is an unlawful act with a penalty up to 7,200 dollars." },
    { key: "bond_number", label: "Bond lodgement number", type: "text", hint: "Bond must be lodged with Tenancy Services within 23 working days of receipt." },
    { key: "insulation_statement", label: "Insulation statement", type: "longtext", required: true, hint: "The agreement must state the location, type and condition of insulation." },
    { key: "healthy_homes_date", label: "Healthy Homes compliance date", type: "date", hint: "All private rentals have been required to comply since 1 July 2025." },
  ],
  clauses: [
    { id: "nz_law", heading: "Governing law", statutory: true, basis: "Residential Tenancies Act 1986",
      body: "This agreement is governed by the Residential Tenancies Act 1986 and is subject to the jurisdiction of the Tenancy Tribunal.\n\nThe Act applies whether or not its terms are written into this agreement. A term that contradicts the Act has no effect. Contracting out of the Act is prohibited." },
    { id: "nz_healthy", heading: "Healthy Homes Standards", statutory: true, basis: "Residential Tenancies (Healthy Homes Standards) Regulations 2019",
      body: "The Property complies with the Healthy Homes Standards as at {{healthy_homes_date}}. A signed Healthy Homes compliance statement forms part of this agreement.\n\nThe standards cover five areas: a fixed heater in the main living room able to reach 18 degrees Celsius, ceiling and underfloor insulation meeting the 2008 Building Code or the alternative standard, extractor fans in kitchens and bathrooms and openable windows in habitable rooms, efficient drainage and guttering with a ground moisture barrier where there is an enclosed subfloor, and the blocking of unreasonable gaps and draughts.\n\nInsulation statement: {{insulation_statement}}" },
    { id: "nz_bond", heading: "Bond", statutory: true, basis: "Residential Tenancies Act 1986 ss.18-22A",
      body: "The bond is {{deposit_amount}}, which may not exceed 4 weeks' rent.\n\nThe Landlord must lodge the bond with Tenancy Services within 23 working days of receiving it. Bond number: {{bond_number}}. Holding the bond rather than lodging it is an unlawful act.\n\nThe bond is refunded by agreement or by order of the Tenancy Tribunal." },
    { id: "nz_rent", heading: "Rent increases", statutory: true, basis: "Residential Tenancies Act 1986 ss.24-27",
      body: "The rent may not be increased within 12 months of the start of the tenancy or of the last increase.\n\nThe Landlord must give at least 60 days' written notice of an increase.\n\nRequiring or accepting more than 2 weeks' rent in advance is prohibited. Requesting rent bidding is prohibited: the Landlord must state a fixed rent and may not invite offers above it." },
    { id: "nz_ending", heading: "Ending the tenancy", statutory: true, basis: "Residential Tenancies Act 1986 ss.50-60A",
      body: "For a periodic tenancy the Tenant must give at least 28 days' notice.\n\nThe Landlord's notice periods depend on the ground relied on. Confirm the current periods with Tenancy Services before serving notice, as this area has been amended repeatedly.\n\nWhere the Tenant is in rent arrears the Landlord must give a 14 day notice to remedy before applying to the Tribunal.\n\nThe Landlord may not evict without a Tenancy Tribunal order. Retaliatory notice, meaning notice given because the Tenant exercised a right under the Act, may be declared of no effect by the Tribunal." },
    { id: "nz_smoke", heading: "Smoke alarms and safety", statutory: true, basis: "Residential Tenancies (Smoke Alarms and Insulation) Regulations 2016",
      body: "Working smoke alarms are installed within 3 metres of each bedroom door, and on every level of a multi storey property. The Landlord is responsible for installation and for ensuring they work at the start of each tenancy. The Tenant is responsible for replacing batteries during the tenancy and must not tamper with an alarm." },
    { id: "nz_tax", heading: "Tax record keeping", basis: "Income Tax Act 2007",
      body: "The Landlord keeps records of rental income and deductible expenses for the purposes of the IR3 return and any residential rental deduction rules that apply." },
  ],
  attachments: [
    { label: "Healthy Homes compliance statement", note: "Must be signed and attached to every new or renewed tenancy agreement." },
    { label: "Insulation statement", note: "Location, type and condition." },
    { label: "Bond lodgement form", note: "Within 23 working days." },
    { label: "Property inspection report", note: "" },
  ],
  warnings: [
    "A New Zealand agreement without a signed Healthy Homes compliance statement is an unlawful act carrying a penalty of up to 7,200 dollars.",
    "Rent bidding is prohibited and no more than 2 weeks' rent may be taken in advance.",
  ],
};

export const CA_SPEC: AgreementSpec = {
  key: "CA",
  countryName: "Canada",
  documentTitle: "Residential Tenancy Agreement",
  version: "CA-2024.1",
  statutoryBasis: "Provincial and territorial Residential Tenancies legislation",
  legislationUrl: "https://www.cmhc-schl.gc.ca/consumers/renting-a-home",
  prescribedForm: {
    name: "Provincial standard form tenancy agreement",
    url: "https://www.ontario.ca/page/renting-ontario-your-rights",
    note: "Ontario mandates the Standard Lease (Form 2229E) for most residential tenancies. British Columbia, Alberta and others have their own required forms and terms. Use your province's form.",
  },
  fields: [
    { key: "ca_province", label: "Province or territory", type: "select", options: ["Ontario", "British Columbia", "Alberta", "Quebec", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island", "Yukon", "Northwest Territories", "Nunavut"], required: true },
    { key: "rent_control", label: "Rent control applies", type: "select", options: ["Yes", "No", "Unsure, check provincial guideline"], hint: "Ontario exempts units first occupied after 15 November 2018 from the rent increase guideline." },
    { key: "deposit_type", label: "Deposit taken", type: "text", hint: "Ontario prohibits a damage deposit. Only a rent deposit of up to one month is allowed, and it must earn interest at the guideline rate." },
  ],
  clauses: [
    { id: "ca_law", heading: "Governing law", statutory: true, basis: "Provincial Residential Tenancies Act",
      body: "This agreement is governed by the residential tenancies legislation of {{ca_province}} and is subject to the jurisdiction of that province's tenancy tribunal or board.\n\nThe statutory terms apply whether or not written into this agreement. A term that conflicts with the legislation is void and unenforceable." },
    { id: "ca_deposit", heading: "Deposits", statutory: true, basis: "Provincial Residential Tenancies Act",
      body: "Deposit taken: {{deposit_type}}. Amount: {{deposit_amount}}.\n\nDeposit rules vary sharply by province. Ontario prohibits damage deposits entirely and permits only a rent deposit of at most one month's rent, which must be applied to the last month's rent and must earn interest annually at the rent increase guideline. British Columbia permits a security deposit of half a month's rent and a pet damage deposit of half a month's rent.\n\nThe Landlord will comply with the rules of {{ca_province}}." },
    { id: "ca_rent", heading: "Rent increases", statutory: true, basis: "Provincial rent increase guideline",
      body: "Rent control applies: {{rent_control}}.\n\nRent may generally be increased only once in any 12 month period, on at least 90 days' written notice in the prescribed form, and only by the provincial guideline percentage where rent control applies.\n\nAn increase above the guideline generally requires an application to the board." },
    { id: "ca_ending", heading: "Ending the tenancy", statutory: true, basis: "Provincial Residential Tenancies Act",
      body: "A fixed term tenancy does not end automatically. In most provinces it continues as a month to month tenancy on the same terms unless the parties agree otherwise.\n\nThe Landlord may terminate only on a statutory ground, using the prescribed form and notice period, and must apply to the board for an eviction order if the tenant does not leave.\n\nTermination for landlord's own use or for renovation attracts compensation obligations and, in several provinces, a right for the tenant to return. Bad faith use of these grounds attracts substantial penalties.\n\nThe Landlord may not evict without an order and enforcement by the sheriff." },
    { id: "ca_maintenance", heading: "Maintenance and vital services", statutory: true, basis: "Provincial Residential Tenancies Act; municipal property standards by-laws",
      body: "The Landlord must keep the Property in a good state of repair and fit for habitation, and must comply with health, safety, housing and maintenance standards, regardless of whether the Tenant was aware of a defect before entering into the agreement.\n\nThe Landlord may not withhold or deliberately interfere with the reasonable supply of a vital service such as heat, electricity, fuel, gas or hot or cold water." },
    { id: "ca_privacy", heading: "Entry", statutory: true, basis: "Provincial Residential Tenancies Act",
      body: "The Landlord must give at least 24 hours' written notice before entering, stating the reason and a time between 8am and 8pm, except in an emergency or where the Tenant consents at the time of entry." },
  ],
  attachments: [
    { label: "Provincial standard form lease", note: "Mandatory in Ontario. Check your province." },
    { label: "Provincial tenant information guide", note: "" },
    { label: "Condition inspection report", note: "Required in British Columbia at move in and move out; without it the deposit claim is extinguished." },
  ],
  warnings: [
    "Canadian tenancy law is provincial. Quebec operates under the Civil Code and the Tribunal administratif du logement, which is materially different from the common law provinces.",
    "Ontario prohibits damage deposits. Taking one is unlawful.",
  ],
};

export const ZA_SPEC: AgreementSpec = {
  key: "ZA",
  countryName: "South Africa",
  documentTitle: "Residential Lease Agreement",
  version: "ZA-2024.1",
  statutoryBasis: "Rental Housing Act 50 of 1999 as amended; Consumer Protection Act 68 of 2008; Prevention of Illegal Eviction from and Unlawful Occupation of Land Act 19 of 1998",
  legislationUrl: "https://www.gov.za/documents/rental-housing-act",
  fields: [
    { key: "deposit_account", label: "Interest bearing account details", type: "text", required: true, hint: "The Rental Housing Act requires the deposit to be invested in an interest bearing account, with the interest accruing to the tenant." },
    { key: "incoming_inspection_date", label: "Incoming inspection date", type: "date", required: true, hint: "The landlord and tenant must jointly inspect before occupation. Without it, the landlord is deemed to have received the property in good condition and cannot claim against the deposit." },
    { key: "cpa_applies", label: "Consumer Protection Act applies", type: "select", options: ["Yes, landlord lets in the ordinary course of business", "No, private landlord not in the business of letting"], required: true, hint: "If the CPA applies, the tenant may cancel on 20 business days' notice regardless of the fixed term, and the maximum fixed term is 24 months." },
  ],
  clauses: [
    { id: "za_law", heading: "Governing law", statutory: true, basis: "Rental Housing Act 50 of 1999",
      body: "This lease is governed by the Rental Housing Act 50 of 1999 and, where applicable, the Consumer Protection Act 68 of 2008.\n\nConsumer Protection Act applies: {{cpa_applies}}.\n\nDisputes may be referred to the Rental Housing Tribunal for the province, free of charge. A Tribunal ruling has the effect of an order of a Magistrate's Court." },
    { id: "za_deposit", heading: "Deposit", statutory: true, basis: "Rental Housing Act 50 of 1999 s.5",
      body: "The deposit of {{deposit_amount}} will be invested by the Landlord in an interest bearing account with a financial institution: {{deposit_account}}. The interest accrues to the Tenant and may not be less than the rate applicable to a savings account with that institution.\n\nThe Tenant may require the Landlord to provide written proof of the interest earned, and the Landlord must provide it on request.\n\nThe deposit and interest, less any amount lawfully owed, must be refunded within 7 days of the expiry of the lease where the outgoing inspection took place, or within 14 days where the Landlord deducts for repairs, with receipts provided. Where no inspection took place, the full deposit and interest must be refunded within 21 days." },
    { id: "za_inspection", heading: "Inspections", statutory: true, basis: "Rental Housing Act 50 of 1999 s.5(3)",
      body: "The Landlord and the Tenant jointly inspected the Property on {{incoming_inspection_date}} before the Tenant took occupation, and recorded any defects or damage in writing.\n\nIf the Landlord fails to inspect the Property together with the Tenant before occupation, the Landlord is deemed to have received the Property in good and proper condition and has no claim against the Tenant for damage.\n\nA joint outgoing inspection will take place within 3 days before the expiry of the lease. If the Landlord fails to inspect, the Landlord is deemed to have no claim against the deposit." },
    { id: "za_rights", heading: "Tenant's rights", statutory: true, basis: "Rental Housing Act 50 of 1999 s.4-4A; Constitution s.26",
      body: "The Landlord may not, in respect of this lease, discriminate on any ground listed in section 9 of the Constitution.\n\nThe Tenant's right to privacy includes the right not to have the Property, the Tenant's person or the Tenant's possessions searched, and not to have the Tenant's communications infringed. The Landlord may not enter without the Tenant's consent except as this lease and the law allow.\n\nThe Landlord may not lock out the Tenant, cut off water or electricity, or seize the Tenant's goods to enforce payment. Such conduct is unlawful and may be a criminal offence." },
    { id: "za_ending", heading: "Ending the lease and eviction", statutory: true, basis: "PIE Act 19 of 1998; Consumer Protection Act 68 of 2008 s.14",
      body: "Where the Consumer Protection Act applies, the Tenant may cancel this lease at any time on 20 business days' written notice, subject to a reasonable cancellation penalty, notwithstanding any fixed term. The maximum fixed term is 24 months unless a longer term demonstrably benefits the Tenant. The Landlord must give 40 to 80 business days' notice before expiry of a fixed term of the Landlord's intention not to renew.\n\nEviction requires an order of court under the Prevention of Illegal Eviction from and Unlawful Occupation of Land Act. The court must consider whether eviction is just and equitable, taking account of the rights of the elderly, children, disabled persons and households headed by women.\n\nSelf help eviction is unlawful, regardless of arrears." },
    { id: "za_maintenance", heading: "Maintenance", statutory: true, basis: "Rental Housing Act 50 of 1999 s.5(3)(g)-(h)",
      body: "The Landlord must maintain the exterior and interior of the Property in a habitable condition and keep it structurally sound, and must ensure the Property complies with any applicable municipal by-law.\n\nThe Tenant must not damage the Property and must notify the Landlord of any defect or damage promptly." },
  ],
  attachments: [
    { label: "Incoming inspection report", note: "Without it you lose your claim against the deposit." },
    { label: "Proof of interest bearing deposit account", note: "The tenant may demand it." },
    { label: "House rules or body corporate conduct rules", note: "" },
    { label: "Electrical Certificate of Compliance", note: "Required on transfer, and good practice on letting." },
  ],
  warnings: [
    "If you do not carry out a joint incoming inspection, the law deems you to have received the property in good condition and you cannot claim against the deposit.",
    "The deposit must be in an interest bearing account and the interest belongs to the tenant.",
  ],
};

export const AE_SPEC: AgreementSpec = {
  key: "AE",
  countryName: "United Arab Emirates",
  documentTitle: "Residential Tenancy Contract",
  version: "AE-2024.1",
  statutoryBasis: "Emirate level rental law, for Dubai Law No. 26 of 2007 as amended by Law No. 33 of 2008 and Decree No. 43 of 2013; for Abu Dhabi Law No. 20 of 2006 as amended",
  legislationUrl: "https://dubailand.gov.ae/en/eservices/ejari/",
  prescribedForm: {
    name: "Ejari (Dubai) or Tawtheeq (Abu Dhabi) registered contract",
    url: "https://dubailand.gov.ae/en/eservices/ejari/",
    note: "A tenancy contract must be registered. In Dubai an unregistered contract cannot be enforced at the Rental Disputes Centre, and utilities connection and visa sponsorship depend on registration.",
  },
  fields: [
    { key: "emirate", label: "Emirate", type: "select", options: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"], required: true },
    { key: "registration_number", label: "Ejari / Tawtheeq number", type: "text", required: true },
    { key: "title_deed", label: "Title deed number", type: "text", required: true },
    { key: "cheque_schedule", label: "Cheque schedule", type: "longtext", hint: "Rent is customarily paid by post dated cheques. State the number of cheques and the dates." },
    { key: "dewa_premise", label: "Utility premise number", type: "text", hint: "DEWA in Dubai, ADDC in Abu Dhabi." },
  ],
  clauses: [
    { id: "ae_law", heading: "Governing law and registration", statutory: true, basis: "Dubai Law No. 26/2007 and Law No. 33/2008; Abu Dhabi Law No. 20/2006",
      body: "This contract is governed by the rental law of the Emirate of {{emirate}} and by the federal law of the United Arab Emirates.\n\nThe contract is registered under number {{registration_number}}. Title deed: {{title_deed}}.\n\nRegistration is mandatory. An unregistered contract in Dubai cannot be relied on before the Rental Disputes Settlement Centre." },
    { id: "ae_rent", heading: "Rent and payment", statutory: true, basis: "Dubai Decree No. 43 of 2013",
      body: "The annual rent is {{rent_amount}}, payable as follows: {{cheque_schedule}}\n\nRent increases in Dubai are capped by Decree No. 43 of 2013 by reference to how far the current rent sits below the RERA rental index average: no increase where the rent is up to 10 percent below the average, then 5, 10, 15 and up to 20 percent as the gap widens.\n\nThe Landlord must give at least 90 days' notice before the expiry of the contract of any change to the rent or other terms, unless a different period is agreed." },
    { id: "ae_deposit", heading: "Security deposit", basis: "Market practice; Dubai Law No. 26/2007",
      body: "The Tenant has paid a security deposit of {{deposit_amount}}, customarily 5 percent of the annual rent for an unfurnished property and 10 percent for a furnished property.\n\nThe deposit is refundable at the end of the contract, less the cost of making good any damage beyond normal wear and tear and any outstanding utility charges." },
    { id: "ae_maintenance", heading: "Maintenance", statutory: true, basis: "Dubai Law No. 26/2007 art.16",
      body: "Unless otherwise agreed in writing, the Landlord is responsible for the maintenance of the Property during the term and must repair any defect or damage that affects the Tenant's intended use.\n\nThe Tenant is responsible for minor maintenance and for any damage the Tenant causes.\n\nThe Landlord may not make any change to the Property that affects the Tenant's intended use." },
    { id: "ae_ending", heading: "Ending the contract", statutory: true, basis: "Dubai Law No. 33/2008 art.25; Law No. 26/2007 art.7",
      body: "A tenancy contract does not terminate on the sale of the Property, on the death of the Landlord or the Tenant, or on the expiry of the term where the Tenant remains in occupation. It transfers with the Property.\n\nThe Landlord may seek eviction during the term only on the specific grounds in article 25(1), such as non payment within 30 days of a formal notice, unlawful subletting, or use for an illegal purpose.\n\nThe Landlord may seek eviction on expiry only on the article 25(2) grounds, being demolition or major reconstruction, comprehensive maintenance requiring vacancy, the owner's own use or use by a first degree relative, or sale, and must give 12 months' notice through a notary public or registered post.\n\nWhere the Landlord evicts for personal use, the Property may not be re-let to another tenant for at least 2 years for residential use, or the Tenant may claim compensation." },
    { id: "ae_utilities", heading: "Utilities", basis: "Emirate utility regulations",
      body: "Utility premise number: {{dewa_premise}}. The Tenant is responsible for connecting utilities in the Tenant's name and for all consumption charges during the term, and must settle the final bill and obtain a clearance certificate before the deposit is returned." },
  ],
  attachments: [
    { label: "Ejari or Tawtheeq registration certificate", note: "Mandatory." },
    { label: "Title deed copy", note: "" },
    { label: "Landlord passport or Emirates ID copy", note: "" },
    { label: "Tenant passport, visa and Emirates ID copies", note: "" },
    { label: "Post dated cheques", note: "Per the agreed schedule." },
  ],
  warnings: [
    "An unregistered contract cannot be enforced at the Rental Disputes Centre in Dubai. Register it.",
    "Eviction on expiry requires 12 months' notice through a notary public or registered post. Notice by email or letter is not sufficient.",
  ],
};

export const IL_SPEC: AgreementSpec = {
  key: "IL",
  countryName: "Israel",
  documentTitle: "Residential Lease Agreement",
  version: "IL-2024.1",
  statutoryBasis: "Rental and Borrowing Law 5731-1971, including the Fair Rental Law amendment 5777-2017",
  legislationUrl: "https://www.gov.il/en/departments/topics/rent_apartment",
  fields: [
    { key: "guarantee_type", label: "Security given", type: "text", hint: "The Fair Rental Law caps combined securities at one third of the total rent for the term, or the equivalent of three months' rent, whichever is lower." },
    { key: "arnona_liable", label: "Who pays arnona", type: "select", options: ["Tenant", "Landlord"], required: true },
    { key: "vaad_bayit", label: "Building committee fees paid by", type: "select", options: ["Tenant", "Landlord"] },
  ],
  clauses: [
    { id: "il_law", heading: "Governing law", statutory: true, basis: "Rental and Borrowing Law 5731-1971, chapter on fair rental",
      body: "This lease is governed by the Rental and Borrowing Law 5731-1971 as amended by the Fair Rental Law.\n\nThe fair rental provisions are mandatory for residential leases within their scope. A term less favourable to the Tenant than the Law allows is void." },
    { id: "il_fitness", heading: "Fitness of the apartment", statutory: true, basis: "Fair Rental Law amendment 5777-2017",
      body: "The Landlord confirms the apartment is fit for residential use. An apartment is not fit if it lacks a drainage system connected to a sewer or a proper alternative, a functioning electrical system, ventilation and natural light in each room, a water supply, or if it has a defect endangering the occupants.\n\nThe Landlord must repair a defect that is not the Tenant's responsibility within a reasonable time, and within 3 days where the defect prevents reasonable use of the apartment.\n\nIf the Landlord fails to repair, the Tenant may repair and deduct the reasonable cost from the rent." },
    { id: "il_security", heading: "Securities", statutory: true, basis: "Fair Rental Law amendment 5777-2017",
      body: "Security given: {{guarantee_type}}. Amount: {{deposit_amount}}.\n\nThe combined value of all securities may not exceed one third of the total rent for the lease term, or the equivalent of three months' rent, whichever is lower.\n\nThe Landlord may realise a security only after giving the Tenant written notice and a reasonable opportunity to remedy, and only for a sum actually owed." },
    { id: "il_costs", heading: "Charges", statutory: true, basis: "Fair Rental Law amendment 5777-2017",
      body: "Arnona (municipal tax) is payable by: {{arnona_liable}}. Building committee fees are payable by: {{vaad_bayit}}.\n\nThe Landlord bears the costs of insuring the apartment and of any fee charged by an agent acting for the Landlord. A term requiring the Tenant to pay the Landlord's agent or the Landlord's insurance is void." },
    { id: "il_ending", heading: "Ending the lease", basis: "Rental and Borrowing Law 5731-1971",
      body: "The lease ends on the date stated. Where the Tenant remains with the Landlord's consent, the lease continues on the same terms.\n\nThe Landlord may not evict the Tenant by self help. Eviction requires a court judgment and enforcement through the Execution Office.\n\nThe Landlord must give the Tenant reasonable notice, and not less than 90 days, of an intention not to renew a lease that has run for more than a year, where the fair rental provisions apply." },
  ],
  attachments: [
    { label: "Apartment condition protocol", note: "Photograph everything at handover." },
    { label: "Arnona registration", note: "" },
  ],
  warnings: [
    "The Fair Rental Law caps the securities you may take and voids terms that shift the landlord's insurance or agent fees onto the tenant.",
    "Have the Hebrew version prepared and treat it as the operative text. A Hebrew court will work from the Hebrew.",
  ],
};
