import type { AgreementSpec } from "./types";

/**
 * United Kingdom, four nations. Housing is devolved, so these are genuinely
 * different legal regimes rather than variations on one. Nothing about England
 * may leak into Scotland, Wales or Northern Ireland.
 */

export const ENGLAND_SPEC: AgreementSpec = {
  key: "GB-ENG",
  countryName: "United Kingdom",
  regionName: "England",
  documentTitle: "Assured Shorthold Tenancy Agreement",
  version: "ENG-2024.1",
  statutoryBasis: "Housing Act 1988, Housing Act 2004, Deregulation Act 2015, Homes (Fitness for Human Habitation) Act 2018, Tenant Fees Act 2019",
  legislationUrl: "https://www.legislation.gov.uk/ukpga/1988/50/contents",
  fields: [
    { key: "deposit_scheme", label: "Deposit protection scheme", type: "select", options: ["Deposit Protection Service (DPS)", "MyDeposits", "Tenancy Deposit Scheme (TDS)"], required: true, hint: "The deposit must be protected within 30 days of receipt and the prescribed information given to the tenant. Miss this and you cannot serve a Section 21 notice, and the tenant can claim up to three times the deposit." },
    { key: "deposit_ref", label: "Deposit scheme reference", type: "text", hint: "Add once the deposit is protected." },
    { key: "epc_rating", label: "EPC rating", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"], required: true, hint: "It is unlawful to let a property rated F or G unless a valid exemption is registered." },
    { key: "gas_safety_date", label: "Gas safety certificate date", type: "date", hint: "Required where there is any gas appliance. Must be given to the tenant before they move in." },
    { key: "eicr_date", label: "EICR date", type: "date", required: true, hint: "Electrical Installation Condition Report, required every 5 years. A copy must go to the tenant before occupation." },
    { key: "how_to_rent_date", label: "How to Rent guide served on", type: "date", required: true, hint: "The current version must be served. Serving an out of date version invalidates a later Section 21 notice." },
    { key: "licence_type", label: "Property licence", type: "select", options: ["Not licensable", "Mandatory HMO licence", "Additional HMO licence", "Selective licence"], hint: "Check the local council. Letting an unlicensed licensable property blocks Section 21 and risks a rent repayment order." },
    { key: "licence_number", label: "Licence number", type: "text" },
    { key: "right_to_rent_date", label: "Right to Rent check completed", type: "date", required: true, hint: "A civil penalty applies for letting to someone without the right to rent in England." },
  ],
  clauses: [
    {
      id: "eng_type",
      heading: "Type of tenancy",
      statutory: true,
      basis: "Housing Act 1988 s.19A and Sch 2A",
      body:
        "This agreement creates an assured shorthold tenancy within the meaning of the Housing Act 1988, as amended.\n\n" +
        "The Tenant has security of tenure for the fixed term. After the fixed term ends the tenancy continues as a statutory periodic tenancy on the same terms until it is lawfully brought to an end.",
    },
    {
      id: "eng_deposit",
      heading: "Deposit protection",
      statutory: true,
      basis: "Housing Act 2004 ss.213-215",
      body:
        "The deposit of {{deposit_amount}} will be protected in the {{deposit_scheme}} within 30 days of receipt. Scheme reference: {{deposit_ref}}.\n\n" +
        "The Landlord will give the Tenant the prescribed information about the scheme within the same 30 days.\n\n" +
        "The deposit is capped by the Tenant Fees Act 2019 at five weeks' rent where the annual rent is under 50,000 pounds, or six weeks' rent where it is 50,000 pounds or more.\n\n" +
        "At the end of the tenancy the deposit will be returned within 10 days of the parties agreeing the amount due. If the parties do not agree, the scheme's free dispute resolution service may decide the matter.",
    },
    {
      id: "eng_fees",
      heading: "Permitted payments",
      statutory: true,
      basis: "Tenant Fees Act 2019",
      body:
        "The Landlord may only require the Tenant to make payments permitted by the Tenant Fees Act 2019. These are the rent, a capped tenancy deposit, a capped holding deposit, payments on variation or assignment at the Tenant's request capped at 50 pounds unless higher costs are evidenced, payments on early termination at the Tenant's request, utilities, communication services, television licence and council tax, and a default fee for a lost key or for interest on rent more than 14 days late.\n\n" +
        "Any other fee is a prohibited payment. If the Landlord charges one, it must be repaid, and a Section 21 notice cannot be served until it is.",
    },
    {
      id: "eng_fitness",
      heading: "Fitness for human habitation",
      statutory: true,
      basis: "Homes (Fitness for Human Habitation) Act 2018; Landlord and Tenant Act 1985 s.11",
      body:
        "The Landlord must ensure the Property is fit for human habitation at the start of the tenancy and throughout it. The Tenant may enforce this directly in the county court and may seek an order for works and damages.\n\n" +
        "The Landlord must keep in repair the structure and exterior, and the installations for water, gas, electricity, sanitation, space heating and water heating.",
    },
    {
      id: "eng_safety",
      heading: "Safety obligations",
      statutory: true,
      basis: "Gas Safety (Installation and Use) Regulations 1998; Electrical Safety Standards Regulations 2020; Smoke and Carbon Monoxide Alarm (England) Regulations 2015 as amended 2022",
      body:
        "Gas: a Gas Safe registered engineer checks every gas appliance and flue every 12 months. The current certificate is dated {{gas_safety_date}}. A copy has been given to the Tenant.\n\n" +
        "Electricity: the installation is inspected at least every 5 years. The current EICR is dated {{eicr_date}}. A copy has been given to the Tenant.\n\n" +
        "Alarms: a smoke alarm is fitted on every storey used as living accommodation, and a carbon monoxide alarm is fitted in every room with a fixed combustion appliance other than a gas cooker. The Landlord will repair or replace any alarm reported as faulty as soon as reasonably practicable.\n\n" +
        "Energy: the Property has an EPC rating of {{epc_rating}}. A copy of the EPC has been given to the Tenant.",
    },
    {
      id: "eng_docs",
      heading: "Documents given to the Tenant",
      statutory: true,
      basis: "Deregulation Act 2015 s.38; Assured Shorthold Tenancy Notices and Prescribed Requirements (England) Regulations 2015",
      body:
        "Before the Tenant took occupation the Landlord gave the Tenant: the current How to Rent guide, on {{how_to_rent_date}}; the Energy Performance Certificate; the Gas Safety Record where gas is present; and the Electrical Installation Condition Report.\n\n" +
        "Licence: {{licence_type}}. Licence number: {{licence_number}}.\n\n" +
        "The Landlord acknowledges that failing to serve these documents prevents a valid Section 21 notice being given.",
    },
    {
      id: "eng_ending",
      heading: "Ending an assured shorthold tenancy",
      statutory: true,
      basis: "Housing Act 1988 ss.5, 8, 21",
      body:
        "The Landlord may end the tenancy only by serving a valid statutory notice and, if the Tenant does not leave, by obtaining a possession order from the county court. The Landlord may not evict the Tenant without a court order and a warrant executed by a county court bailiff or High Court enforcement officer.\n\n" +
        "A Section 8 notice may be served where a statutory ground for possession applies. The notice period depends on the ground.\n\n" +
        "A Section 21 notice may be served where the statutory preconditions are met. It cannot be served in the first four months of the tenancy, is valid for six months, and cannot be served where the deposit is unprotected, the prescribed documents were not given, the property is unlicensed but licensable, or a prohibited payment has not been repaid.\n\n" +
        "The Tenant may end a periodic tenancy by giving at least one month's notice in writing expiring at the end of a rental period.\n\n" +
        "Government policy in this area is under active reform. Check the current position before serving any notice.",
    },
    {
      id: "eng_right_to_rent",
      heading: "Right to Rent",
      statutory: true,
      basis: "Immigration Act 2014 ss.20-37",
      body:
        "The Landlord carried out a Right to Rent check on {{right_to_rent_date}} for every adult who will occupy the Property as their only or main home.\n\n" +
        "Where an occupier has a time limited right to rent, the Landlord will carry out a follow up check before that right expires and must report to the Home Office if it lapses.",
    },
  ],
  attachments: [
    { label: "How to Rent guide (current version)", note: "Serve the version in force on the day the tenancy starts. An out of date copy invalidates a later Section 21." },
    { label: "Energy Performance Certificate", note: "Must be E or better unless an exemption is registered." },
    { label: "Gas Safety Record", note: "Required before the tenant takes occupation where any gas appliance is present." },
    { label: "Electrical Installation Condition Report", note: "Give within 28 days of the inspection and to a new tenant before occupation." },
    { label: "Inventory and schedule of condition", note: "Your single most useful document in a deposit dispute." },
    { label: "Deposit prescribed information", note: "Within 30 days of receiving the deposit." },
  ],
  warnings: [
    "The Renters' Rights reforms will abolish assured shorthold tenancies and Section 21. Confirm the position in force on the day you let before you rely on this template.",
    "The deposit cap, the prescribed information deadline and the licensing position are the three things that most often invalidate a possession claim. Check all three.",
  ],
  constraints: [
    {
      field: "epc_rating",
      rule: "notEqual",
      value: "F",
      severity: "warning",
      message: "An EPC rating of F cannot be let unless you have registered a valid exemption on the PRS Exemptions Register.",
    },
    {
      field: "epc_rating",
      rule: "notEqual",
      value: "G",
      severity: "warning",
      message: "An EPC rating of G cannot be let unless you have registered a valid exemption on the PRS Exemptions Register.",
    },
  ],
};

export const WALES_SPEC: AgreementSpec = {
  key: "GB-WLS",
  countryName: "United Kingdom",
  regionName: "Wales",
  documentTitle: "Occupation Contract (Standard Contract) Written Statement",
  version: "WLS-2022.1",
  statutoryBasis: "Renting Homes (Wales) Act 2016",
  legislationUrl: "https://www.legislation.gov.uk/anaw/2016/1/contents",
  prescribedForm: {
    name: "Written statement of the occupation contract",
    url: "https://www.gov.wales/renting-homes-model-written-statements",
    note: "Wales requires a written statement containing all the fundamental and supplementary terms, given to the contract holder within 14 days of the occupation date. Use the Welsh Government model statement as your base; this draft is a preparation aid, not a substitute.",
  },
  fields: [
    { key: "rsw_number", label: "Rent Smart Wales registration number", type: "text", required: true, hint: "Landlords must register, and anyone carrying out letting or management work must be licensed. Letting without it is a criminal offence and blocks a section 173 notice." },
    { key: "deposit_scheme", label: "Deposit protection scheme", type: "select", options: ["Deposit Protection Service (DPS)", "MyDeposits", "Tenancy Deposit Scheme (TDS)"], required: true },
    { key: "deposit_ref", label: "Deposit scheme reference", type: "text" },
    { key: "epc_rating", label: "EPC rating", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"], required: true },
    { key: "gas_safety_date", label: "Gas safety certificate date", type: "date" },
    { key: "eicr_date", label: "EICR date", type: "date", required: true },
    { key: "occupation_date", label: "Occupation date", type: "date", required: true, hint: "The written statement must be given within 14 days of this date. Late delivery entitles the contract holder to compensation." },
  ],
  clauses: [
    {
      id: "wls_type",
      heading: "Type of contract",
      statutory: true,
      basis: "Renting Homes (Wales) Act 2016 s.8",
      body:
        "This is an occupation contract under the Renting Homes (Wales) Act 2016. The Landlord is the landlord and the Tenant is the contract holder. The occupation date is {{occupation_date}}.\n\n" +
        "The Act replaced tenancies and licences in Wales. Terminology from the Housing Act 1988, including assured shorthold tenancy and Section 21, has no application in Wales.",
    },
    {
      id: "wls_statement",
      heading: "Written statement",
      statutory: true,
      basis: "Renting Homes (Wales) Act 2016 ss.31-38",
      body:
        "The Landlord must give the contract holder a written statement of the occupation contract within 14 days of the occupation date.\n\n" +
        "The statement must set out the key matters, the fundamental terms, the supplementary terms and any additional terms. Fundamental terms may only be modified or excluded where the Act allows, and only if the change does not disadvantage the contract holder.\n\n" +
        "If the statement is late, the contract holder is entitled to compensation equal to a day's rent for each day of delay, up to two months' rent.",
    },
    {
      id: "wls_fitness",
      heading: "Fitness for human habitation",
      statutory: true,
      basis: "Renting Homes (Wales) Act 2016 ss.91-94; Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022",
      body:
        "The Landlord must ensure the dwelling is fit for human habitation on the occupation date and throughout the contract.\n\n" +
        "Fitness is assessed against 29 matters and circumstances. The dwelling is not fit unless it has a working smoke alarm on each storey, a carbon monoxide alarm in every room with a gas appliance, an oil fired combustion appliance or a solid fuel burning appliance, and electrical safety testing at least every 5 years.\n\n" +
        "If the dwelling is unfit, rent is not payable for the period it remains unfit.",
    },
    {
      id: "wls_ending",
      heading: "Ending an occupation contract",
      statutory: true,
      basis: "Renting Homes (Wales) Act 2016 ss.173, 182, 186-189",
      body:
        "The Landlord may end a periodic standard contract by a notice under section 173 giving at least 6 months. A section 173 notice may not be given in the first 6 months of the occupation date, and may not be given where the Landlord has failed to give the written statement, has not protected the deposit, is not registered and licensed with Rent Smart Wales, or has not given the required safety documents.\n\n" +
        "Where a fixed term contract contains a break clause, section 186 restrictions apply.\n\n" +
        "The Landlord may also serve notice on a breach of contract ground, including serious rent arrears, or on an estate management ground.\n\n" +
        "The contract holder may end a periodic contract by giving at least 4 weeks' notice in writing.\n\n" +
        "Possession still requires a court order where the contract holder does not leave.",
    },
    {
      id: "wls_licensing",
      heading: "Rent Smart Wales",
      statutory: true,
      basis: "Housing (Wales) Act 2014 Part 1",
      body:
        "The Landlord is registered with Rent Smart Wales under registration number {{rsw_number}}. Where the Landlord carries out letting or management work themselves, the Landlord holds a licence to do so; otherwise that work is carried out by a licensed agent.",
    },
    {
      id: "wls_deposit",
      heading: "Deposit",
      statutory: true,
      basis: "Renting Homes (Wales) Act 2016 Sch 5",
      body:
        "The deposit of {{deposit_amount}} is protected in the {{deposit_scheme}}, reference {{deposit_ref}}, and the prescribed information will be given to the contract holder within 30 days of receipt.\n\n" +
        "A deposit may only be taken in money. Taking a deposit in any other form, such as goods, is prohibited.",
    },
  ],
  attachments: [
    { label: "Written statement of the occupation contract", note: "Within 14 days of the occupation date. Compensation is payable if it is late." },
    { label: "Energy Performance Certificate", note: "" },
    { label: "Gas Safety Record", note: "Where any gas appliance is present." },
    { label: "Electrical Installation Condition Report", note: "At least every 5 years." },
    { label: "Deposit prescribed information", note: "Within 30 days of receipt." },
  ],
  warnings: [
    "Wales requires a prescribed written statement. Use the Welsh Government model statement and treat this draft as preparation only.",
    "Terminology matters in Wales. A document referring to an assured shorthold tenancy, a tenant, or Section 21 is drafted against the wrong law.",
  ],
};

export const SCOTLAND_SPEC: AgreementSpec = {
  key: "GB-SCT",
  countryName: "United Kingdom",
  regionName: "Scotland",
  documentTitle: "Private Residential Tenancy Agreement",
  version: "SCT-2017.1",
  statutoryBasis: "Private Housing (Tenancies) (Scotland) Act 2016",
  legislationUrl: "https://www.legislation.gov.uk/asp/2016/19/contents",
  prescribedForm: {
    name: "Scottish Government Model Private Residential Tenancy Agreement",
    url: "https://www.gov.scot/publications/model-private-residential-tenancy-agreement/",
    note: "Where the model agreement is not used, the landlord must provide the Easy Read Notes and all nine statutory terms. Using the model agreement is the safest route.",
  },
  fields: [
    { key: "landlord_reg_number", label: "Landlord registration number", type: "text", required: true, hint: "Every private landlord must be registered with the local authority. Letting while unregistered is an offence and can lead to a rent penalty notice." },
    { key: "letting_agent_reg", label: "Letting agent registration number", type: "text" },
    { key: "deposit_scheme", label: "Deposit scheme", type: "select", options: ["SafeDeposits Scotland", "Letting Protection Service Scotland", "mydeposits Scotland"], required: true, hint: "Must be lodged within 30 working days of the tenancy start." },
    { key: "epc_rating", label: "EPC rating", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"], required: true },
    { key: "gas_safety_date", label: "Gas safety certificate date", type: "date" },
    { key: "eicr_date", label: "EICR date", type: "date", required: true },
    { key: "repairing_standard", label: "Repairing Standard confirmed", type: "checkbox", required: true, hint: "The landlord must confirm the property meets the Repairing Standard before the tenancy starts." },
  ],
  clauses: [
    {
      id: "sct_type",
      heading: "Type of tenancy",
      statutory: true,
      basis: "Private Housing (Tenancies) (Scotland) Act 2016 s.1",
      body:
        "This agreement creates a private residential tenancy under the Private Housing (Tenancies) (Scotland) Act 2016.\n\n" +
        "A private residential tenancy is open ended. It has no fixed term and no end date. Any term purporting to fix an end date, or to create an assured or short assured tenancy, has no effect. Those tenancy types were abolished for new lets from 1 December 2017.",
    },
    {
      id: "sct_rent",
      heading: "Rent and rent increases",
      statutory: true,
      basis: "Private Housing (Tenancies) (Scotland) Act 2016 ss.18-24",
      body:
        "The rent is {{rent_amount}} {{rent_period}}.\n\n" +
        "The rent may be increased no more than once in any 12 month period. The Landlord must use a rent increase notice giving at least 3 months' notice.\n\n" +
        "If the Tenant considers the increase unfair, the Tenant may refer it to a rent officer before the increase takes effect. The rent officer's decision may be appealed to the First-tier Tribunal.",
    },
    {
      id: "sct_deposit",
      heading: "Deposit",
      statutory: true,
      basis: "Tenancy Deposit Schemes (Scotland) Regulations 2011",
      body:
        "The deposit of {{deposit_amount}} will be lodged with {{deposit_scheme}}, an approved scheme, within 30 working days of the start of the tenancy, and the prescribed information given to the Tenant.\n\n" +
        "A deposit may not exceed two months' rent.\n\n" +
        "At the end of the tenancy either party may apply to the scheme for repayment. The scheme adjudicates any dispute free of charge.",
    },
    {
      id: "sct_repairing",
      heading: "Repairing Standard",
      statutory: true,
      basis: "Housing (Scotland) Act 2006 ss.13-14",
      body:
        "The Landlord must ensure the Property meets the Repairing Standard at the start of the tenancy and at all times during it.\n\n" +
        "The Repairing Standard requires the Property to be wind and watertight and reasonably fit for human habitation, with installations in reasonable repair and proper working order, fixtures and fittings in reasonable repair, appliances safe, satisfactory fire detection including interlinked smoke alarms and a heat alarm in the kitchen, carbon monoxide detection where there is a fixed combustion appliance, safe electrical installations with an EICR at least every 5 years, safe and secure common doors, and residual current devices.\n\n" +
        "If the Landlord fails to meet the Repairing Standard, the Tenant may apply to the First-tier Tribunal (Housing and Property Chamber) for a Repairing Standard Enforcement Order.",
    },
    {
      id: "sct_registration",
      heading: "Landlord registration",
      statutory: true,
      basis: "Antisocial Behaviour etc. (Scotland) Act 2004 Part 8",
      body:
        "The Landlord is registered with the local authority under registration number {{landlord_reg_number}}. Where a letting agent is used, the agent is registered under number {{letting_agent_reg}} and complies with the Letting Agent Code of Practice.",
    },
    {
      id: "sct_ending",
      heading: "Ending a private residential tenancy",
      statutory: true,
      basis: "Private Housing (Tenancies) (Scotland) Act 2016 ss.44-56, Sch 3",
      body:
        "The Tenant may end the tenancy at any time by giving the Landlord 28 days' notice in writing, unless a longer period is agreed in writing after the tenancy has started.\n\n" +
        "The Landlord may only end the tenancy by serving a Notice to Leave stating one or more of the 18 statutory eviction grounds, and then, if the Tenant does not leave, by applying to the First-tier Tribunal for an eviction order.\n\n" +
        "The notice period is 28 days where the Tenant has lived in the Property for 6 months or less, and 84 days where the Tenant has lived there for more than 6 months.\n\n" +
        "The Tribunal must consider whether it is reasonable to grant eviction. There is no no fault ground: the Landlord must prove a ground.\n\n" +
        "Eviction without a Tribunal order is unlawful.",
    },
    {
      id: "sct_terms",
      heading: "Statutory terms",
      statutory: true,
      basis: "Private Residential Tenancies (Statutory Terms) (Scotland) Regulations 2017",
      body:
        "The nine statutory terms apply to this tenancy whether or not they are written into it. They cover the tenancy being open ended, the Landlord's duty to provide written terms, subletting requiring consent, the Landlord's access rights on 48 hours' notice, the Landlord's repairing obligations, the Tenant's duty to allow access for repairs, the Tenant's duty not to abandon, the rent increase procedure, and the Tenant's right to end the tenancy on 28 days' notice.",
    },
  ],
  attachments: [
    { label: "Easy Read Notes", note: "Required where the Scottish Government model agreement is not used." },
    { label: "Energy Performance Certificate", note: "" },
    { label: "Gas Safety Record", note: "Where any gas appliance is present." },
    { label: "Electrical Installation Condition Report", note: "At least every 5 years, including a PAT report for supplied appliances." },
    { label: "Legionella risk assessment", note: "Expected as part of the landlord's duty of care." },
    { label: "Inventory and schedule of condition", note: "" },
  ],
  warnings: [
    "There is no equivalent of Section 21 in Scotland. Every eviction requires a ground and a Tribunal order.",
  ],
  constraints: [
    {
      field: "end_date",
      rule: "empty",
      severity: "error",
      message:
        "A Scottish private residential tenancy is open ended and cannot have an end date. Clear the end date before generating, otherwise the agreement would contradict itself.",
    },
    {
      field: "term_type",
      rule: "notEqual",
      value: "Fixed term",
      severity: "error",
      message:
        "A private residential tenancy cannot be a fixed term. Choose Periodic (rolling). Assured and short assured tenancies were abolished for new lets from 1 December 2017.",
    },
  ],
};

export const NI_SPEC: AgreementSpec = {
  key: "GB-NIR",
  countryName: "United Kingdom",
  regionName: "Northern Ireland",
  documentTitle: "Private Tenancy Agreement",
  version: "NIR-2022.1",
  statutoryBasis: "Private Tenancies (Northern Ireland) Order 2006; Private Tenancies Act (Northern Ireland) 2022",
  legislationUrl: "https://www.legislation.gov.uk/nia/2022/5/contents",
  fields: [
    { key: "landlord_reg_number", label: "Landlord registration number", type: "text", required: true, hint: "Registration with the Landlord Registration Scheme is mandatory in Northern Ireland." },
    { key: "deposit_scheme", label: "Deposit scheme", type: "select", options: ["TDS Northern Ireland", "MyDeposits Northern Ireland", "Letting Protection Service NI"], required: true, hint: "Must be protected within 28 days and the tenant told within 35 days." },
    { key: "epc_rating", label: "EPC rating", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"], required: true },
    { key: "gas_safety_date", label: "Gas safety certificate date", type: "date" },
    { key: "eicr_date", label: "Electrical safety check date", type: "date", hint: "Required at least every 5 years for tenancies from 1 April 2024." },
    { key: "rent_book_issued", label: "Rent book issued", type: "checkbox", required: true, hint: "A rent book is a legal requirement in Northern Ireland." },
  ],
  clauses: [
    {
      id: "ni_type",
      heading: "Type of tenancy",
      statutory: true,
      basis: "Private Tenancies (Northern Ireland) Order 2006",
      body:
        "This agreement creates a private tenancy governed by the Private Tenancies (Northern Ireland) Order 2006 as amended by the Private Tenancies Act (Northern Ireland) 2022.\n\n" +
        "Housing law in Northern Ireland is separate from that in England and Wales. The Housing Act 1988, assured shorthold tenancies and Section 21 have no application here.",
    },
    {
      id: "ni_statement",
      heading: "Written notice of tenancy terms",
      statutory: true,
      basis: "Private Tenancies Act (Northern Ireland) 2022 s.1",
      body:
        "The Landlord must give the Tenant a written statement of the tenancy terms within 28 days of the start of the tenancy. Failure to do so is an offence and may result in a fixed penalty.",
    },
    {
      id: "ni_rentbook",
      heading: "Rent book",
      statutory: true,
      basis: "Private Tenancies (Northern Ireland) Order 2006 Part III",
      body:
        "The Landlord will provide the Tenant with a rent book containing the information required by law, and will keep it up to date. Failing to provide a rent book is an offence.",
    },
    {
      id: "ni_deposit",
      heading: "Deposit",
      statutory: true,
      basis: "Tenancy Deposit Schemes Regulations (Northern Ireland) 2012 as amended 2022",
      body:
        "The deposit of {{deposit_amount}} will be protected with {{deposit_scheme}} within 28 days of receipt, and the Landlord will give the Tenant the prescribed information within 35 days of receipt.\n\n" +
        "A deposit may not exceed one month's rent.",
    },
    {
      id: "ni_safety",
      heading: "Safety obligations",
      statutory: true,
      basis: "Private Tenancies Act (Northern Ireland) 2022 s.8-9; Smoke, Heat and Carbon Monoxide Alarms Regulations (NI) 2024",
      body:
        "Gas: the current gas safety certificate is dated {{gas_safety_date}}.\n\n" +
        "Electricity: the installation and any supplied appliance are inspected at least every 5 years. The current report is dated {{eicr_date}}.\n\n" +
        "Alarms: smoke alarms, a heat alarm in the kitchen and carbon monoxide alarms are fitted and maintained as the regulations require.",
    },
    {
      id: "ni_ending",
      heading: "Ending the tenancy",
      statutory: true,
      basis: "Private Tenancies (Northern Ireland) Order 2006 art.14; Private Tenancies Act (NI) 2022 s.6",
      body:
        "The Landlord must serve a valid Notice to Quit. The notice period depends on how long the Tenant has lived in the Property: at least 4 weeks where the tenancy has lasted 12 months or less, at least 8 weeks where it has lasted more than 12 months but not more than 10 years, and at least 12 weeks where it has lasted more than 10 years.\n\n" +
        "The Tenant must give at least 4 weeks' notice to quit.\n\n" +
        "If the Tenant does not leave, the Landlord must apply to the court for an order for possession. Eviction without an order is unlawful.\n\n" +
        "The rent may not be increased more than once in any 12 month period, and the Landlord must give at least 3 months' notice of an increase.",
    },
  ],
  attachments: [
    { label: "Written statement of tenancy terms", note: "Within 28 days of the start of the tenancy." },
    { label: "Rent book", note: "A legal requirement." },
    { label: "Energy Performance Certificate", note: "" },
    { label: "Gas Safety Record", note: "Where any gas appliance is present." },
    { label: "Electrical safety report", note: "At least every 5 years." },
    { label: "Deposit prescribed information", note: "Within 35 days of receipt." },
  ],
  warnings: [
    "Northern Ireland has its own housing law. Nothing from the Housing Act 1988 applies here.",
    "The deposit cap in Northern Ireland is one month's rent, not five weeks.",
  ],
};

export const UK_SPECS = [ENGLAND_SPEC, WALES_SPEC, SCOTLAND_SPEC, NI_SPEC];
