import type { AgreementSpec } from "./types";

/**
 * Remaining supported countries. Civil law jurisdictions in particular give
 * tenants strong mandatory protection that a contract cannot override, so each
 * spec leads with the mandatory-law clause.
 */

export const DE_SPEC: AgreementSpec = {
  key: "DE",
  countryName: "Germany",
  documentTitle: "Mietvertrag (Residential Lease Agreement)",
  version: "DE-2024.1",
  statutoryBasis: "Bürgerliches Gesetzbuch (BGB) sections 535-580a; Mietpreisbremse under BGB 556d-556g",
  legislationUrl: "https://www.gesetze-im-internet.de/bgb/",
  fields: [
    { key: "wohnflaeche", label: "Living space (Wohnfläche) in square metres", type: "number", required: true, hint: "An overstatement of more than 10 percent entitles the tenant to reduce the rent permanently." },
    { key: "mietpreisbremse", label: "Rent brake area", type: "select", options: ["Yes, Mietpreisbremse applies", "No", "Unsure, check the Land regulation"], required: true, hint: "Where it applies, rent may not exceed the local comparative rent (Mietspiegel) by more than 10 percent." },
    { key: "nebenkosten", label: "Operating costs (Nebenkosten) advance", type: "money", hint: "Must be itemised and reconciled annually under the Betriebskostenverordnung." },
    { key: "staffel_index", label: "Rent adjustment type", type: "select", options: ["None", "Staffelmiete (stepped)", "Indexmiete (index linked)"] },
  ],
  clauses: [
    { id: "de_law", heading: "Mandatory law", statutory: true, basis: "BGB 535 ff.",
      body: "This lease is governed by the Bürgerliches Gesetzbuch. German tenancy law is largely mandatory in favour of the tenant. Any term that deviates from it to the tenant's disadvantage is void, and the statutory rule applies in its place.\n\nLiving space: {{wohnflaeche}} square metres. A material overstatement of the living space entitles the Tenant to a permanent rent reduction." },
    { id: "de_rent", heading: "Rent and rent increases", statutory: true, basis: "BGB 557-561, 556d-556g",
      body: "The rent is {{rent_amount}} {{rent_period}} net cold, plus an advance for operating costs of {{nebenkosten}}. Adjustment type: {{staffel_index}}.\n\nRent brake: {{mietpreisbremse}}. Where the Mietpreisbremse applies, the agreed rent may not exceed the local comparative rent by more than 10 percent, and the Landlord must disclose the previous rent on request. Excess rent may be reclaimed.\n\nAn increase to the local comparative rent requires the Tenant's consent, must not exceed the Kappungsgrenze of 20 percent, or 15 percent in a designated area, over 3 years, and may not be made within 12 months of the last increase." },
    { id: "de_nebenkosten", heading: "Operating costs", statutory: true, basis: "Betriebskostenverordnung; BGB 556",
      body: "Only the operating cost categories listed in the Betriebskostenverordnung may be passed to the Tenant, and only where this lease says so.\n\nThe Landlord must provide an itemised statement within 12 months of the end of each accounting period. A statement served late cannot support a claim for arrears." },
    { id: "de_ending", heading: "Termination", statutory: true, basis: "BGB 573, 573c",
      body: "The Landlord may terminate an open ended residential lease only where the Landlord has a legitimate interest, principally the Tenant's culpable breach, the Landlord's own need for the dwelling (Eigenbedarf), or prevention of appropriate economic use. Termination without a stated legitimate interest is void.\n\nThe Landlord's notice period is 3 months, extending to 6 months after 5 years of the tenancy and 9 months after 8 years. The Tenant's notice period is 3 months regardless of length.\n\nThe Tenant may object under the Sozialklausel where termination would cause hardship. Eviction requires a court judgment; self help is unlawful." },
    { id: "de_kaution", heading: "Deposit (Kaution)", statutory: true, basis: "BGB 551",
      body: "The deposit is {{deposit_amount}} and may not exceed three months' net cold rent. The Tenant may pay it in three equal monthly instalments.\n\nThe Landlord must hold the deposit separately from the Landlord's own assets, at the interest rate for savings deposits with three months' notice. The interest belongs to the Tenant." },
    { id: "de_schoenheit", heading: "Decorative repairs", statutory: true, basis: "BGB 535(1); Bundesgerichtshof case law",
      body: "Where the dwelling was handed over unrenovated, a clause obliging the Tenant to carry out decorative repairs (Schönheitsreparaturen) is void in its entirety and the obligation remains with the Landlord.\n\nRigid renovation schedules and final renovation clauses are void." },
  ],
  attachments: [
    { label: "Übergabeprotokoll (handover protocol)", note: "" },
    { label: "Energieausweis", note: "Must be shown at viewing and handed over." },
    { label: "Mietspiegel extract", note: "Where the rent brake applies." },
  ],
  warnings: [
    "German tenancy law is mandatory. Most landlord friendly clauses copied from English leases are simply void here.",
    "Eigenbedarf terminations are heavily litigated. Document the need carefully.",
  ],
};

export const FR_SPEC: AgreementSpec = {
  key: "FR",
  countryName: "France",
  documentTitle: "Contrat de location (Residential Lease)",
  version: "FR-2024.1",
  statutoryBasis: "Loi n° 89-462 du 6 juillet 1989; loi ALUR; loi ELAN; loi Climat et Résilience",
  legislationUrl: "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000509310/",
  prescribedForm: {
    name: "Contrat type de location (décret n° 2015-587)",
    url: "https://www.service-public.fr/particuliers/vosdroits/F920",
    note: "France prescribes a model lease by decree, with a mandatory information notice annexed. Use the contrat type.",
  },
  fields: [
    { key: "surface_habitable", label: "Surface habitable (m2)", type: "number", required: true, hint: "Loi Boutin. An understatement of more than 5 percent entitles the tenant to a rent reduction." },
    { key: "dpe", label: "DPE energy class", type: "select", options: ["A", "B", "C", "D", "E", "F", "G"], required: true, hint: "Class G has been prohibited for new lets since 1 January 2025, and class F follows in 2028. A property classed G may not lawfully be let." },
    { key: "encadrement", label: "Rent control zone (encadrement des loyers)", type: "select", options: ["Yes", "No"], required: true, hint: "Applies in Paris, Lille, Lyon, Bordeaux, Montpellier and others. Rent may not exceed the loyer de référence majoré." },
    { key: "meuble", label: "Furnished or unfurnished", type: "select", options: ["Non meublé (unfurnished, 3 year term)", "Meublé (furnished, 1 year term)"], required: true },
  ],
  clauses: [
    { id: "fr_law", heading: "Ordre public", statutory: true, basis: "Loi du 6 juillet 1989 art.2",
      body: "This lease is governed by the loi du 6 juillet 1989. Its provisions are of public order. A clause contrary to them is réputée non écrite, meaning it is treated as never written, and the statutory rule applies.\n\nSurface habitable: {{surface_habitable}} m2. Type: {{meuble}}." },
    { id: "fr_duree", heading: "Duration", statutory: true, basis: "Loi du 6 juillet 1989 art.10, 25-7",
      body: "An unfurnished lease from a natural person runs for a minimum of 3 years, or 6 years where the landlord is a legal person. A furnished lease runs for a minimum of 1 year, or 9 months for a student.\n\nThe lease renews automatically (tacite reconduction) unless validly terminated." },
    { id: "fr_loyer", heading: "Rent", replaces: "rent", statutory: true, basis: "Loi ALUR; loi ELAN art.140",
      body: "The rent is {{rent_amount}} {{rent_period}}. Rent control zone: {{encadrement}}.\n\nWhere encadrement des loyers applies, the rent may not exceed the loyer de référence majoré fixed by prefectoral order, save for a justified complément de loyer which must be stated and reasoned in the lease.\n\nAnnual revision is permitted only where the lease provides for it, by reference to the IRL index published by INSEE. Since the loi Climat et Résilience, rent on a property classed F or G may not be increased or revised at all." },
    { id: "fr_dpe", heading: "Energy performance", statutory: true, basis: "Loi Climat et Résilience art.160; CCH L173-2",
      body: "DPE class: {{dpe}}.\n\nA dwelling classed G has been a logement indécent since 1 January 2025 and may not lawfully be newly let. Class F follows on 1 January 2028 and class E on 1 January 2034.\n\nA tenant of an indecent dwelling may require the landlord to carry out works, and a court may suspend or reduce the rent until they are done." },
    { id: "fr_depot", heading: "Dépôt de garantie", statutory: true, basis: "Loi du 6 juillet 1989 art.22",
      body: "The deposit is {{deposit_amount}}, capped at one month's rent excluding charges for an unfurnished lease and two months for a furnished lease. No deposit may be taken where rent is payable more than two months in advance.\n\nThe deposit must be returned within 1 month of the return of the keys where the exit inventory matches the entry inventory, or 2 months otherwise. Late return attracts a penalty of 10 percent of the monthly rent for each month of delay." },
    { id: "fr_conge", heading: "Termination", statutory: true, basis: "Loi du 6 juillet 1989 art.15",
      body: "The Tenant may terminate at any time on 3 months' notice, reduced to 1 month in a zone tendue, for a furnished lease, or in cases such as job loss or a health related move.\n\nThe Landlord may give congé only at the expiry of the lease, on 6 months' notice for an unfurnished lease or 3 months for a furnished lease, and only for sale, for the Landlord's own occupation or that of a close relative, or for a legitimate and serious reason such as the Tenant's breach. Congé for sale gives the Tenant a right of pre-emption.\n\nEviction requires a court order and, outside the trêve hivernale, enforcement by a commissaire de justice. No eviction may take place during the winter truce." },
  ],
  attachments: [
    { label: "Notice d'information", note: "Annexed to the contrat type by decree." },
    { label: "Dossier de diagnostic technique", note: "DPE, lead, asbestos, gas, electricity, risks." },
    { label: "État des lieux d'entrée", note: "" },
    { label: "Copy of the building rules", note: "Where in a copropriété." },
  ],
  warnings: [
    "Rent on a property classed F or G cannot be increased or revised at all.",
  ],
  constraints: [
    {
      field: "dpe",
      rule: "notEqual",
      value: "G",
      severity: "error",
      message:
        "A dwelling classed G is a logement indécent and may not lawfully be newly let in France since 1 January 2025. Carry out the works and obtain a new DPE before letting.",
    },
    {
      field: "dpe",
      rule: "notEqual",
      value: "F",
      severity: "warning",
      message:
        "A dwelling classed F may still be let until 1 January 2028, but its rent cannot be increased or revised at all.",
    },
  ],
};

export const ES_SPEC: AgreementSpec = {
  key: "ES",
  countryName: "Spain",
  documentTitle: "Contrato de Arrendamiento de Vivienda",
  version: "ES-2024.1",
  statutoryBasis: "Ley 29/1994 de Arrendamientos Urbanos; Ley 12/2023 por el derecho a la vivienda",
  legislationUrl: "https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003",
  fields: [
    { key: "zona_tensionada", label: "Stressed market area (zona tensionada)", type: "select", options: ["Yes", "No", "Unsure, check the autonomous community"], required: true, hint: "Ley 12/2023 lets autonomous communities declare stressed areas where rent is capped by index." },
    { key: "gran_tenedor", label: "Landlord is a gran tenedor", type: "select", options: ["No", "Yes, 5 or more dwellings", "Yes, 10 or more dwellings"], required: true, hint: "Large holders face extra obligations in stressed areas." },
    { key: "cee", label: "Energy certificate rating", type: "text", required: true },
    { key: "fianza_deposit", label: "Fianza deposited with the regional body", type: "text", hint: "Most autonomous communities require the one month fianza to be deposited with a regional housing body." },
  ],
  clauses: [
    { id: "es_law", heading: "Mandatory law", statutory: true, basis: "LAU art.4, 6",
      body: "This contract is governed by the Ley de Arrendamientos Urbanos. Titles I, IV and the provisions on duration and deposit are mandatory. A clause prejudicing the Tenant's rights under them is null and void." },
    { id: "es_duracion", heading: "Duration", statutory: true, basis: "LAU art.9-10",
      body: "The Tenant has a right to compulsory extension (prórroga obligatoria) to 5 years where the Landlord is a natural person, or 7 years where the Landlord is a legal person, in yearly increments at the Tenant's option.\n\nAt the end of that period the contract extends by tacit renewal for up to 3 further years unless the Landlord gives 4 months' notice or the Tenant gives 2 months' notice.\n\nThe Landlord may recover the dwelling for the Landlord's own use or that of a first degree relative only where the contract expressly says so and on 2 months' notice, and only after the first year." },
    { id: "es_renta", heading: "Rent", replaces: "rent", statutory: true, basis: "LAU art.17-18; Ley 12/2023",
      body: "The rent is {{rent_amount}} {{rent_period}}. Stressed area: {{zona_tensionada}}. Landlord status: {{gran_tenedor}}.\n\nAnnual revision applies only where agreed, and is capped by the reference index published by the INE. In a stressed area the rent on a new contract may not exceed the previous contract's rent adjusted by the index, and where the Landlord is a gran tenedor it may not exceed the reference price index.\n\nThe Landlord bears the estate agency fees. A clause passing them to the Tenant is void." },
    { id: "es_fianza", heading: "Fianza", statutory: true, basis: "LAU art.36",
      body: "The Tenant pays a mandatory fianza of one month's rent: {{deposit_amount}}. Deposit reference: {{fianza_deposit}}.\n\nThe Landlord must deposit the fianza with the housing body of the autonomous community. Additional guarantees may not exceed two further months' rent.\n\nThe fianza must be returned within 1 month of the return of the keys. Late return accrues interest." },
    { id: "es_desahucio", heading: "Termination and eviction", statutory: true, basis: "LEC art.440, 549; Ley 12/2023",
      body: "Eviction requires a judicial procedure (desahucio). Self help is unlawful.\n\nWhere the Tenant is in a situation of economic vulnerability, the court must suspend the proceedings while the social services report is obtained, and a gran tenedor must show that a conciliation procedure has been attempted before the claim is admitted.\n\nAn eviction claim must state a precise date and time for the eviction." },
  ],
  attachments: [
    { label: "Certificado de eficiencia energética", note: "" },
    { label: "Cédula de habitabilidad", note: "Where the autonomous community requires it." },
    { label: "Inventario y estado del inmueble", note: "" },
    { label: "Fianza deposit receipt", note: "" },
  ],
  warnings: [
    "The 5 or 7 year compulsory extension is the tenant's right and cannot be contracted away. A 12 month contract does not end after 12 months.",
    "Agency fees are the landlord's, not the tenant's.",
  ],
};

export const NL_SPEC: AgreementSpec = {
  key: "NL",
  countryName: "Netherlands",
  documentTitle: "Huurovereenkomst Woonruimte",
  version: "NL-2024.1",
  statutoryBasis: "Burgerlijk Wetboek Boek 7 titel 4; Wet betaalbare huur 2024",
  legislationUrl: "https://wetten.overheid.nl/BWBR0005290/",
  fields: [
    { key: "wws_points", label: "WWS points (woningwaarderingsstelsel)", type: "number", required: true, hint: "The points score sets the maximum lawful rent. Since the Wet betaalbare huur the regulated band extends to 186 points." },
    { key: "energy_label", label: "Energy label", type: "text", required: true, hint: "The label affects the WWS score." },
    { key: "servicekosten", label: "Service costs", type: "money", hint: "Must be specified and accounted for annually." },
  ],
  clauses: [
    { id: "nl_law", heading: "Mandatory law (dwingend recht)", statutory: true, basis: "BW 7:242",
      body: "Dutch residential tenancy law is dwingend recht. A term deviating from it to the Tenant's disadvantage may be annulled by the Tenant, and the statutory rule applies instead." },
    { id: "nl_huurprijs", heading: "Rent and the points system", statutory: true, basis: "Wet betaalbare huur 2024; Uitvoeringswet huurprijzen woonruimte",
      body: "WWS points: {{wws_points}}. Energy label: {{energy_label}}. Rent: {{rent_amount}} {{rent_period}}. Service costs: {{servicekosten}}.\n\nThe woningwaarderingsstelsel sets a maximum lawful rent for the dwelling. Since 1 July 2024 the points system is binding up to 186 points, covering the regulated and mid market segments.\n\nThe Landlord must state the points score and the corresponding maximum rent in the agreement. The Tenant may ask the Huurcommissie to reduce a rent set above the maximum, and may do so at any time during the tenancy for a mid market dwelling." },
    { id: "nl_duur", heading: "Duration and termination", statutory: true, basis: "BW 7:271, 7:274; Wet vaste huurcontracten 2024",
      body: "Since 1 July 2024 an open ended contract is the norm. Fixed term contracts for residential space are permitted only in the limited cases the law lists.\n\nThe Landlord may terminate only on one of the statutory grounds in BW 7:274, principally the Tenant's poor conduct, the Landlord's urgent own use, refusal of a reasonable new offer, or a zoning plan. The Landlord's notice period is 3 months, plus one month for each year of the tenancy, to a maximum of 6 months.\n\nThe Tenant may terminate on one month's notice.\n\nIf the Tenant does not agree to the termination, the tenancy continues until the court ends it. Eviction requires a court judgment." },
    { id: "nl_borg", heading: "Deposit", replaces: "deposit", statutory: true, basis: "Wet goed verhuurderschap 2023",
      body: "The deposit is {{deposit_amount}} and may not exceed two months' bare rent.\n\nThe Landlord must return it within 14 days of the end of the tenancy, or within 30 days where a deduction is made, with a written specification. Late return doubles and then quadruples the sum owed." },
    { id: "nl_goed", heading: "Good landlordship", statutory: true, basis: "Wet goed verhuurderschap 2023",
      body: "The Landlord observes the statutory rules of good landlordship: no discrimination, no intimidation, a written agreement, written information about rights and the deposit, no double agency fees charged to the Tenant, and service costs specified and accounted for.\n\nMunicipalities enforce these rules and may impose fines or take over management of the property." },
  ],
  attachments: [
    { label: "Energy label", note: "" },
    { label: "WWS points calculation", note: "Must be provided to the tenant." },
    { label: "Opleveringsrapport", note: "" },
  ],
  warnings: [
    "The points system caps your rent by law. Charging above the maximum invites a Huurcommissie reduction backdated to the start.",
    "Fixed term residential contracts are largely abolished since July 2024.",
  ],
};

export const IN_SPEC: AgreementSpec = {
  key: "IN",
  countryName: "India",
  documentTitle: "Leave and Licence / Rental Agreement",
  version: "IN-2024.1",
  statutoryBasis: "State Rent Control Acts; Model Tenancy Act 2021 where adopted; Registration Act 1908; Transfer of Property Act 1882",
  legislationUrl: "https://mohua.gov.in/",
  fields: [
    { key: "in_state", label: "State", type: "text", required: true, hint: "Rent law is a state subject. The Model Tenancy Act 2021 only applies where the state has adopted it." },
    { key: "registration_status", label: "Registration", type: "select", options: ["Registered", "To be registered", "Not required for this term"], required: true, hint: "An agreement for 12 months or more generally must be registered. An unregistered instrument is inadmissible as evidence of its terms." },
    { key: "stamp_duty_paid", label: "Stamp duty paid", type: "text", required: true, hint: "Stamp duty is state specific. An insufficiently stamped document cannot be relied on in court until the duty and penalty are paid." },
    { key: "notarised", label: "Notarised", type: "select", options: ["Yes", "No"] },
  ],
  clauses: [
    { id: "in_law", heading: "Governing law", statutory: true, basis: "State Rent Control Act; Model Tenancy Act 2021 where adopted",
      body: "This agreement is governed by the law of {{in_state}}.\n\nRent and tenancy law in India is a state subject. Where the state has adopted the Model Tenancy Act 2021, the tenancy must be registered with the Rent Authority within 2 months, the deposit is capped at 2 months' rent for residential premises, and disputes go to the Rent Court rather than the civil court." },
    { id: "in_registration", heading: "Registration and stamping", statutory: true, basis: "Registration Act 1908 s.17, 49; Indian Stamp Act 1899",
      body: "Registration status: {{registration_status}}. Stamp duty: {{stamp_duty_paid}}. Notarised: {{notarised}}.\n\nAn agreement creating a tenancy for a term of 12 months or more requires compulsory registration. An unregistered instrument that requires registration cannot be received as evidence of any transaction affecting the property.\n\nMany landlords use an 11 month leave and licence to avoid registration. That is common practice but it does not defeat a tenant who establishes possession, and it forfeits the evidential benefit of registration." },
    { id: "in_deposit", heading: "Security deposit", statutory: true, basis: "Model Tenancy Act 2021 s.11 where adopted",
      body: "The deposit is {{deposit_amount}}.\n\nWhere the Model Tenancy Act applies, the deposit may not exceed 2 months' rent for residential premises and must be refunded within 1 month of vacation, subject to lawful deduction.\n\nWhere it does not apply, local practice governs, and deposits of 6 to 10 months are common in some southern cities." },
    { id: "in_ending", heading: "Termination and possession", statutory: true, basis: "State Rent Control Act; Model Tenancy Act 2021 s.21-22",
      body: "The Landlord may not take possession by force, by cutting off electricity or water, or by locking out the Tenant. Doing so is unlawful and the Tenant may seek restoration.\n\nWhere the Model Tenancy Act applies, a tenant who does not vacate after the term or after termination is liable to pay double the rent for 2 months and 4 times the rent thereafter, and the Landlord applies to the Rent Court.\n\nThe Landlord must give the notice this agreement requires, and the Landlord may not withhold essential supplies at any time." },
  ],
  attachments: [
    { label: "Stamp paper / e-stamp certificate", note: "State specific value." },
    { label: "Registration receipt", note: "Where the term is 12 months or more." },
    { label: "Police verification of tenant", note: "Required by many city police commissionerates." },
    { label: "Inventory and photographs", note: "" },
  ],
  warnings: [
    "An unregistered agreement that legally required registration is inadmissible as evidence of its own terms. That is a real risk, not a formality.",
    "Cutting off electricity or water to force a tenant out is unlawful everywhere in India.",
  ],
};

export const SG_SPEC: AgreementSpec = {
  key: "SG",
  countryName: "Singapore",
  documentTitle: "Tenancy Agreement",
  version: "SG-2024.1",
  statutoryBasis: "Common law of contract; Housing and Development Act; Immigration Act; Residential Property Act",
  legislationUrl: "https://www.hdb.gov.sg/residential/renting-a-flat",
  fields: [
    { key: "property_type", label: "Property type", type: "select", options: ["HDB flat", "HDB room", "Private condominium", "Landed private property"], required: true, hint: "HDB flats have minimum occupation periods, occupancy caps and an approval requirement for subletting." },
    { key: "hdb_approval", label: "HDB approval reference", type: "text", hint: "Subletting an HDB flat or bedroom requires HDB's prior approval. Letting without it can mean compulsory acquisition of the flat." },
    { key: "occupier_count", label: "Number of occupiers", type: "number", required: true, hint: "Caps apply: 6 for a 4 room or larger HDB flat, and 6 for private residential property since 2024." },
    { key: "tenant_pass_status", label: "Tenant immigration status verified", type: "checkbox", required: true, hint: "Letting to an immigration offender is an offence. Verify pass validity on the ICA or MOM website." },
    { key: "stamp_certificate", label: "Stamp duty certificate reference", type: "text", required: true, hint: "Tenancy stamp duty must be paid to IRAS, usually within 14 days of signing." },
  ],
  clauses: [
    { id: "sg_law", heading: "Governing law", statutory: true, basis: "Laws of Singapore",
      body: "This agreement is governed by the laws of Singapore and the parties submit to the jurisdiction of the Singapore courts.\n\nProperty type: {{property_type}}. Singapore has no general residential rent control and no statutory security of tenure. The terms of this agreement therefore carry unusual weight, and the parties should read them with care." },
    { id: "sg_regulatory", heading: "Regulatory approvals and occupancy", statutory: true, basis: "Housing and Development Act; URA regulations",
      body: "HDB approval reference: {{hdb_approval}}. Number of occupiers: {{occupier_count}}.\n\nWhere the Property is an HDB flat or bedroom, the Landlord has obtained HDB's prior approval to sublet, has met the minimum occupation period, and complies with the occupancy cap and the non citizen quota. Letting without approval may result in HDB compulsorily acquiring the flat.\n\nWhere the Property is private residential, the minimum stay is 3 months and the occupancy cap is 6 unrelated persons. Short term letting under 3 months is prohibited and attracts a fine of up to 200,000 dollars." },
    { id: "sg_immigration", heading: "Immigration status", statutory: true, basis: "Immigration Act s.57(1)(e)",
      body: "The Landlord has verified that every occupier holds a valid pass or is a citizen or permanent resident: {{tenant_pass_status}}.\n\nHarbouring an immigration offender is an offence carrying imprisonment and a fine. The Landlord will re-verify pass validity on renewal." },
    { id: "sg_stamp", heading: "Stamp duty", statutory: true, basis: "Stamp Duties Act",
      body: "Stamp certificate: {{stamp_certificate}}. Tenancy stamp duty is payable to IRAS, customarily by the Tenant, within 14 days of signing in Singapore. An unstamped agreement is inadmissible in evidence until stamped and any penalty paid." },
    { id: "sg_terms", heading: "Common commercial terms", basis: "Market practice",
      body: "Minor repairs: the Tenant customarily bears the cost of a repair up to a stated sum per item per occurrence, and the Landlord bears the excess and the cost of fair wear and tear and of the air conditioning system's major parts.\n\nDiplomatic clause: where the Tenant is a foreigner whose pass is cancelled or not renewed, the Tenant may terminate after the first 12 months on 2 months' notice.\n\nReinstatement: the Tenant returns the Property in the condition recorded in the inventory, fair wear and tear excepted." },
  ],
  attachments: [
    { label: "HDB approval letter", note: "Where letting an HDB flat or room." },
    { label: "IRAS stamp certificate", note: "Within 14 days of signing." },
    { label: "Copies of tenant passes and passports", note: "" },
    { label: "Inventory list", note: "" },
  ],
  warnings: [
    "Letting an HDB flat without HDB approval risks compulsory acquisition of the flat.",
    "Singapore has no statutory security of tenure or rent control. The written terms are effectively the whole of the tenant's protection, so they must be fair.",
  ],
};

/** Compact specs for the remaining supported countries. */
export const IT_SPEC: AgreementSpec = {
  key: "IT", countryName: "Italy",
  documentTitle: "Contratto di Locazione ad Uso Abitativo",
  version: "IT-2024.1",
  statutoryBasis: "Legge 431/1998; Codice Civile art. 1571 ff.",
  legislationUrl: "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1998-12-09;431",
  fields: [
    { key: "contract_type", label: "Contract type", type: "select", options: ["Canone libero 4+4", "Canone concordato 3+2", "Transitorio", "Studenti universitari"], required: true, hint: "Canone concordato requires the rent to sit within the local territorial agreement and gives a tax advantage (cedolare secca at 10 percent)." },
    { key: "registration_ref", label: "Agenzia delle Entrate registration", type: "text", required: true, hint: "Registration within 30 days is mandatory. An unregistered contract is null and the tenant can claim back rent above the cadastral minimum." },
    { key: "ape", label: "APE energy class", type: "text", required: true },
    { key: "cedolare", label: "Cedolare secca elected", type: "select", options: ["Yes", "No"] },
  ],
  clauses: [
    { id: "it_law", heading: "Governing law and registration", statutory: true, basis: "Legge 431/1998 art.1, 13",
      body: "This contract is governed by Legge 431/1998. Contract type: {{contract_type}}. Registration: {{registration_ref}}. APE class: {{ape}}. Cedolare secca: {{cedolare}}.\n\nA residential lease must be in writing and registered with the Agenzia delle Entrate within 30 days. An unregistered contract is null, and the tenant may apply to the court to have the rent reset to triple the cadastral income and recover the excess paid.\n\nAny side agreement for rent above the registered figure is null and unenforceable." },
    { id: "it_durata", heading: "Duration", statutory: true, basis: "Legge 431/1998 art.2",
      body: "A canone libero contract runs 4 years and renews automatically for a further 4 unless the Landlord gives 6 months' notice on one of the limited statutory grounds. A canone concordato contract runs 3 years plus 2.\n\nThe Tenant may withdraw at any time on 6 months' notice for serious reasons, and the contract may allow free withdrawal on the same notice." },
    { id: "it_deposito", heading: "Deposit", replaces: "deposit", statutory: true, basis: "Legge 392/1978 art.11",
      body: "The deposit is {{deposit_amount}} and may not exceed 3 months' rent. It bears legal interest, payable to the Tenant annually." },
    { id: "it_sfratto", heading: "Eviction", statutory: true, basis: "Codice di Procedura Civile art.657 ff.",
      body: "Possession requires the sfratto procedure before the court. The court fixes a date for release and may grant the Tenant a grace period (termine di grazia) to pay arrears, and may postpone enforcement on hardship grounds. Self help is unlawful." },
  ],
  attachments: [{ label: "APE certificate", note: "" }, { label: "Registration receipt", note: "Within 30 days." }, { label: "Verbale di consegna", note: "" }],
  warnings: ["An unregistered Italian lease is null and exposes you to a claim for rent repayment.", "Taking rent above the registered amount is unenforceable and a tax offence."],
};

export const PT_SPEC: AgreementSpec = {
  key: "PT", countryName: "Portugal",
  documentTitle: "Contrato de Arrendamento Urbano para Habitação",
  version: "PT-2024.1",
  statutoryBasis: "Novo Regime do Arrendamento Urbano (Lei 6/2006) as amended; Lei 31/2012; Mais Habitação (Lei 56/2023)",
  legislationUrl: "https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2006-34448475",
  fields: [
    { key: "finance_registration", label: "Finanças registration (Modelo 2)", type: "text", required: true, hint: "The contract must be declared to the Autoridade Tributária and stamp duty paid at 10 percent of one month's rent." },
    { key: "licenca_utilizacao", label: "Licença de utilização number", type: "text", required: true, hint: "Letting without a use licence attracts a fine and the tenant may terminate." },
    { key: "certificado_energetico", label: "Energy certificate", type: "text", required: true },
  ],
  clauses: [
    { id: "pt_law", heading: "Governing law and registration", statutory: true, basis: "NRAU; Código do Imposto do Selo",
      body: "This contract is governed by the Novo Regime do Arrendamento Urbano. Use licence: {{licenca_utilizacao}}. Energy certificate: {{certificado_energetico}}. Tax registration: {{finance_registration}}.\n\nThe contract must be in writing and communicated to the Autoridade Tributária, with stamp duty of 10 percent of one month's rent paid by the Landlord.\n\nThe Landlord must give the Tenant a receipt (recibo de renda eletrónico) for every payment." },
    { id: "pt_duracao", heading: "Duration", statutory: true, basis: "NRAU art.1094-1098; Lei 13/2019",
      body: "A fixed term residential contract must run for at least 1 year and renews automatically for equal periods of at least 3 years unless validly opposed.\n\nThe Landlord may oppose renewal only on 120 to 240 days' notice depending on the term, and may not oppose the first renewal in the first 3 years.\n\nThe Tenant may terminate after one third of the term on 60 or 120 days' notice." },
    { id: "pt_caucao", heading: "Deposit", replaces: "deposit", statutory: true, basis: "Mais Habitação (Lei 56/2023)",
      body: "The deposit is {{deposit_amount}}. Since Lei 56/2023 the deposit and any advance rent together may not exceed the equivalent of 2 months' rent." },
    { id: "pt_despejo", heading: "Eviction", statutory: true, basis: "NRAU; Balcão Nacional do Arrendamento",
      body: "Eviction proceeds through the Balcão Nacional do Arrendamento or the court. Self help is unlawful. The court may suspend eviction on hardship grounds where the tenant is over 65 or has a disability." },
  ],
  attachments: [{ label: "Licença de utilização", note: "" }, { label: "Certificado energético", note: "" }, { label: "Modelo 2 / stamp duty proof", note: "" }],
  warnings: ["Letting without a licença de utilização is a fineable offence and lets the tenant walk away.", "Deposit plus advance rent is capped at 2 months since 2023."],
};

export const CH_SPEC: AgreementSpec = {
  key: "CH", countryName: "Switzerland",
  documentTitle: "Mietvertrag / Contrat de bail (Residential Lease)",
  version: "CH-2024.1",
  statutoryBasis: "Obligationenrecht art. 253-274g; Verordnung über die Miete und Pacht von Wohn- und Geschäftsräumen (VMWG)",
  legislationUrl: "https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de",
  fields: [
    { key: "canton", label: "Canton", type: "text", required: true, hint: "Several cantons require the official form disclosing the previous rent on a new letting." },
    { key: "previous_rent", label: "Previous tenant's rent", type: "money", hint: "Mandatory disclosure in cantons with housing shortage. The tenant may challenge the initial rent within 30 days." },
    { key: "deposit_account", label: "Deposit account (Mietzinskaution)", type: "text", required: true, hint: "Must be a blocked account in the tenant's name at a Swiss bank." },
    { key: "nebenkosten_ch", label: "Ancillary costs", type: "money" },
  ],
  clauses: [
    { id: "ch_law", heading: "Governing law", statutory: true, basis: "OR art.253 ff.",
      body: "This lease is governed by the Swiss Code of Obligations. Canton: {{canton}}. Swiss tenancy law is largely mandatory and a term deviating to the Tenant's disadvantage is void." },
    { id: "ch_initial", heading: "Initial rent", statutory: true, basis: "OR art.269-270",
      body: "Rent: {{rent_amount}} {{rent_period}}. Ancillary costs: {{nebenkosten_ch}}. Previous rent: {{previous_rent}}.\n\nIn a canton with a declared housing shortage the Landlord must use the official form to notify the initial rent and the previous rent. The Tenant may challenge an abusive initial rent before the conciliation authority within 30 days of taking possession.\n\nA rent is abusive where it yields an excessive return or is based on a manifestly excessive purchase price." },
    { id: "ch_kaution", heading: "Deposit", replaces: "deposit", statutory: true, basis: "OR art.257e",
      body: "The deposit is {{deposit_amount}}, capped at 3 months' rent, and must be paid into a blocked account in the Tenant's name at a Swiss bank: {{deposit_account}}.\n\nThe bank may release it only with both parties' agreement or on a court order. If the Landlord makes no claim within 1 year of the end of the lease, the bank must release it to the Tenant." },
    { id: "ch_ending", heading: "Termination", statutory: true, basis: "OR art.266, 271-271a, 272",
      body: "Notice must be given on the official cantonal form or it is void. The Landlord's notice period is at least 3 months to a local moving date.\n\nNotice contrary to good faith may be annulled. Notice given within 3 years of a dispute the Tenant won is presumed abusive.\n\nThe Tenant may request an extension of the lease of up to 4 years where termination would cause hardship." },
  ],
  attachments: [{ label: "Official initial rent form", note: "Mandatory in shortage cantons." }, { label: "Übergabeprotokoll", note: "" }, { label: "Deposit account confirmation", note: "" }],
  warnings: ["Notice not given on the official cantonal form is void.", "The deposit must sit in a blocked account in the tenant's name, not yours."],
};

export const JP_SPEC: AgreementSpec = {
  key: "JP", countryName: "Japan",
  documentTitle: "建物賃貸借契約書 (Residential Lease Agreement)",
  version: "JP-2024.1",
  statutoryBasis: "Act on Land and Building Leases (借地借家法) Act No. 90 of 1991; Civil Code",
  legislationUrl: "https://www.japaneselawtranslation.go.jp/en/laws/view/3743",
  fields: [
    { key: "lease_type", label: "Lease type", type: "select", options: ["Ordinary lease (普通借家)", "Fixed term lease (定期借家)"], required: true, hint: "A fixed term lease must be in writing, with a separate written explanation given before signing, or it defaults to an ordinary lease that renews automatically." },
    { key: "shikikin", label: "Shikikin (deposit)", type: "money" },
    { key: "reikin", label: "Reikin (key money)", type: "money", hint: "Non refundable gift money. Declining in practice." },
    { key: "guarantor", label: "Guarantor or guarantee company", type: "text", required: true, hint: "The Civil Code requires a personal guarantor's maximum liability to be stated in writing, or the guarantee is void." },
  ],
  clauses: [
    { id: "jp_law", heading: "Governing law", statutory: true, basis: "Act on Land and Building Leases art.30",
      body: "This lease is governed by the Act on Land and Building Leases. Lease type: {{lease_type}}.\n\nThe Act is mandatory in the tenant's favour. Any term unfavourable to the Tenant compared with the Act is void." },
    { id: "jp_renewal", heading: "Renewal and termination", statutory: true, basis: "Act on Land and Building Leases art.26-28, 38",
      body: "An ordinary lease renews automatically. The Landlord may refuse renewal or terminate only with just cause (正当事由), judged on the parties' respective need for the building, the history of the lease, the condition of the building, and any offer of relocation money. Just cause is difficult to establish in practice.\n\nThe Landlord must give notice between 1 year and 6 months before expiry.\n\nA fixed term lease (定期借家) does not renew, but only if it is in writing and the Landlord gave the Tenant a separate written explanation, before signing, that the lease will not renew. Without that separate document the lease is an ordinary lease." },
    { id: "jp_money", heading: "Deposit and key money", statutory: true, basis: "Civil Code art.622-2; Consumer Contract Act",
      body: "Shikikin: {{shikikin}}. Reikin: {{reikin}}.\n\nThe shikikin secures the Tenant's obligations and must be returned less unpaid rent and the cost of restoring damage the Tenant caused. Ordinary wear and tear and deterioration over time are the Landlord's cost, not the Tenant's, and a restoration clause imposing them on the Tenant may be void under the Consumer Contract Act." },
    { id: "jp_guarantor", heading: "Guarantor", statutory: true, basis: "Civil Code art.465-2",
      body: "Guarantor: {{guarantor}}. Where an individual guarantees the Tenant's obligations, the maximum amount of the guarantee must be stated in writing. A personal guarantee without a stated maximum is void." },
  ],
  attachments: [{ label: "重要事項説明書 (important matters explanation)", note: "Given by a licensed agent before signing." }, { label: "Fixed term lease explanation document", note: "Separate document, before signing, or the fixed term fails." }, { label: "Condition report with photographs", note: "" }],
  warnings: ["A fixed term lease without the separate pre-signing written explanation becomes an ordinary lease that renews automatically.", "Restoration clauses charging the tenant for ordinary wear and tear are frequently struck down."],
};

export const MX_SPEC: AgreementSpec = {
  key: "MX", countryName: "Mexico",
  documentTitle: "Contrato de Arrendamiento de Casa Habitación",
  version: "MX-2024.1",
  statutoryBasis: "Código Civil of the relevant state or of Mexico City (arts. 2398-2496)",
  legislationUrl: "https://www.congresocdmx.gob.mx/",
  fields: [
    { key: "mx_state", label: "State", type: "text", required: true, hint: "Each state has its own Civil Code. Mexico City's rules differ from Jalisco's or Nuevo León's." },
    { key: "fiador", label: "Fiador or guarantee", type: "text", hint: "A fiador with property (fiador con inmueble) is standard practice." },
    { key: "registration_ref", label: "Public registry entry", type: "text", hint: "Leases over 6 years, or with rent paid more than 3 years in advance, must be registered." },
  ],
  clauses: [
    { id: "mx_law", heading: "Governing law", statutory: true, basis: "Código Civil (state)",
      body: "This contract is governed by the Código Civil of {{mx_state}}. Residential lease provisions there are of public order and cannot be waived to the tenant's detriment." },
    { id: "mx_duracion", heading: "Duration and renewal", statutory: true, basis: "Código Civil CDMX art.2398, 2448-C",
      body: "A residential lease has a minimum term of 1 year at the Tenant's option.\n\nThe Tenant who is up to date has a preferential right to renew for a further year, subject to an increase not exceeding the increase in the national consumer price index, and a right of first refusal if the Landlord sells." },
    { id: "mx_deposito", heading: "Deposit and rent", statutory: true, basis: "Código Civil CDMX art.2425, 2448-D",
      body: "The deposit is {{deposit_amount}}, customarily one month's rent. Guarantee: {{fiador}}.\n\nRent may be increased only as the contract provides and, for residential leases in Mexico City, not by more than the annual increase in the consumer price index.\n\nThe Landlord must give a receipt for each payment." },
    { id: "mx_ending", heading: "Termination", statutory: true, basis: "Código Civil; Código de Procedimientos Civiles",
      body: "Eviction requires a juicio de desahucio before the court. Self help, lock changing and utility cut off are unlawful.\n\nThe Landlord must maintain the property in a condition fit for the agreed use and carry out necessary repairs. If the Landlord fails after notice, the Tenant may carry them out and deduct the cost." },
  ],
  attachments: [{ label: "Identificación oficial of both parties", note: "" }, { label: "Comprobante de propiedad", note: "" }, { label: "Inventario y estado del inmueble", note: "" }],
  warnings: ["Mexican residential leases carry a minimum one year term at the tenant's option.", "Rent increases on Mexico City residential leases are capped by the consumer price index."],
};

export const BR_SPEC: AgreementSpec = {
  key: "BR", countryName: "Brazil",
  documentTitle: "Contrato de Locação Residencial",
  version: "BR-2024.1",
  statutoryBasis: "Lei do Inquilinato, Lei 8.245/1991 as amended by Lei 12.112/2009",
  legislationUrl: "https://www.planalto.gov.br/ccivil_03/leis/l8245.htm",
  fields: [
    { key: "garantia_type", label: "Guarantee type", type: "select", options: ["Caução (deposit)", "Fiador", "Seguro fiança", "Cessão fiduciária de quotas"], required: true, hint: "Lei 8.245 allows only one guarantee. Taking two, for example a deposit and a fiador, is a criminal contravention." },
    { key: "iptu_liable", label: "IPTU paid by", type: "select", options: ["Tenant", "Landlord"], required: true },
    { key: "condominio", label: "Condominium fee paid by", type: "select", options: ["Tenant (ordinary charges only)", "Landlord"] },
  ],
  clauses: [
    { id: "br_law", heading: "Governing law", statutory: true, basis: "Lei 8.245/1991",
      body: "This contract is governed by the Lei do Inquilinato. Its provisions are of public order and a term contrary to them is null." },
    { id: "br_garantia", heading: "Guarantee", statutory: true, basis: "Lei 8.245/1991 art.37, 38, 43",
      body: "Guarantee: {{garantia_type}}. Amount where a caução: {{deposit_amount}}.\n\nOnly one form of guarantee is permitted. Requiring more than one is a contravenção penal punishable by detention.\n\nA caução in money may not exceed 3 months' rent and must be deposited in a savings account, with the interest accruing to the Tenant." },
    { id: "br_duracao", heading: "Duration and termination", statutory: true, basis: "Lei 8.245/1991 art.46-47, 4",
      body: "A written residential lease of 30 months or more ends on its term and the Landlord may then require the property back without cause, provided notice is given within 30 days of expiry. If the Landlord does not, the lease becomes indeterminate and the Landlord must then give 30 days' notice.\n\nA lease of less than 30 months does not permit denúncia vazia. The Landlord may recover only on a statutory ground, and the tenant may remain by legal extension.\n\nThe Tenant may terminate at any time subject to a proportional penalty, and without penalty where the Tenant is transferred by an employer." },
    { id: "br_charges", heading: "Charges", statutory: true, basis: "Lei 8.245/1991 art.22, 23, 25",
      body: "IPTU: {{iptu_liable}}. Condominium: {{condominio}}.\n\nThe Tenant bears only ordinary condominium expenses. Extraordinary expenses, meaning works on the structure, reserve fund contributions and installation of new equipment, are the Landlord's and may not be passed on." },
    { id: "br_despejo", heading: "Eviction", statutory: true, basis: "Lei 8.245/1991 art.59, 62",
      body: "Eviction requires an ação de despejo. In the cases listed in article 59 the court may grant a liminar for eviction in 15 days against a bond of 3 months' rent.\n\nWhere the ground is rent arrears the Tenant may purge the default (purgação da mora) by paying everything due, once in any 24 months." },
  ],
  attachments: [{ label: "Laudo de vistoria", note: "Photographic condition report." }, { label: "Comprovante de garantia", note: "" }, { label: "Cópia do IPTU", note: "" }],
  warnings: ["Taking more than one guarantee, for example both a deposit and a fiador, is a criminal contravention in Brazil.", "Extraordinary condominium charges are the landlord's by law and cannot be passed to the tenant."],
};

export const BE_SPEC: AgreementSpec = {
  key: "BE", countryName: "Belgium",
  documentTitle: "Woninghuurovereenkomst / Contrat de bail de résidence principale",
  version: "BE-2024.1",
  statutoryBasis: "Regional housing codes: Vlaams Woninghuurdecreet, Code bruxellois du Logement, Code wallon du Logement",
  legislationUrl: "https://www.vlaanderen.be/huren",
  fields: [
    { key: "be_region", label: "Region", type: "select", options: ["Flanders", "Brussels-Capital", "Wallonia"], required: true, hint: "Residential tenancy law was regionalised in 2018. The three regions differ on deposits, duration and indexation." },
    { key: "registration_ref", label: "Registration reference", type: "text", required: true, hint: "Registration is free, compulsory and the landlord's duty. Until it is done, the tenant of a main residence may leave without notice or penalty." },
    { key: "epc_be", label: "EPC / PEB rating", type: "text", required: true },
    { key: "deposit_account_be", label: "Blocked deposit account", type: "text", hint: "Must be individualised in the tenant's name." },
  ],
  clauses: [
    { id: "be_law", heading: "Governing law and registration", statutory: true, basis: "Regional housing code; Code des droits d'enregistrement art.19",
      body: "Region: {{be_region}}. This lease is governed by the housing code of that region. Registration: {{registration_ref}}. EPC: {{epc_be}}.\n\nRegistration of a main residence lease is compulsory, free, and the Landlord's obligation. Until the lease is registered, the Tenant may terminate at any time without notice and without compensation." },
    { id: "be_duree", heading: "Duration", statutory: true, basis: "Regional housing code",
      body: "The standard main residence lease runs 9 years. Short leases of 3 years or less are permitted and renewable once, up to a total of 3 years, and may not be terminated early by the Landlord in Flanders and Brussels.\n\nOn a 9 year lease the Landlord may terminate on 6 months' notice for own occupation at any time, for major works at the end of each 3 year period, or without motive at the end of each 3 year period with compensation of 9 or 6 months' rent.\n\nThe Tenant may terminate at any time on 3 months' notice, with compensation of 3, 2 or 1 months' rent in the first three years." },
    { id: "be_garantie", heading: "Deposit", replaces: "deposit", statutory: true, basis: "Regional housing code",
      body: "The deposit is {{deposit_amount}}, capped at 3 months' rent in Flanders and Wallonia and 2 months in Brussels where it is placed in a blocked account.\n\nIt must sit in an individualised blocked account in the Tenant's name: {{deposit_account_be}}. It may be released only by written agreement or a court order. Interest accrues to the Tenant." },
    { id: "be_index", heading: "Indexation", statutory: true, basis: "Regional housing code",
      body: "Rent may be indexed once a year, on the anniversary, by the health index formula, and only where the lease is in writing.\n\nIn several regions indexation of a poorly performing property by EPC rating is restricted or blocked. Check the rule in {{be_region}} before indexing." },
  ],
  attachments: [{ label: "Plaatsbeschrijving / état des lieux", note: "Contradictory and detailed, registered with the lease." }, { label: "EPC certificate", note: "" }, { label: "Registration proof", note: "" }],
  warnings: ["An unregistered main residence lease lets the tenant walk away with no notice and no penalty. Registration is your obligation and it is free.", "Belgian tenancy law is regional. Flanders, Brussels and Wallonia differ materially."],
};

export const AT_SPEC: AgreementSpec = {
  key: "AT", countryName: "Austria",
  documentTitle: "Mietvertrag (Residential Lease)",
  version: "AT-2024.1",
  statutoryBasis: "Mietrechtsgesetz (MRG); Allgemeines Bürgerliches Gesetzbuch",
  legislationUrl: "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10002531",
  fields: [
    { key: "mrg_scope", label: "MRG application", type: "select", options: ["Vollanwendung (full)", "Teilanwendung (partial)", "Vollausnahme (excluded)"], required: true, hint: "This is the single most important question in Austrian tenancy law. Full application brings rent caps (Richtwert or Kategoriemiete) and strict termination protection." },
    { key: "richtwert", label: "Richtwert rent basis", type: "text", hint: "Where the Richtwertsystem applies, the rent is built from the Land's Richtwert plus permitted surcharges and discounts." },
    { key: "befristung", label: "Fixed term", type: "select", options: ["Unbefristet (open ended)", "Befristet (fixed term, minimum 3 years)"] },
  ],
  clauses: [
    { id: "at_law", heading: "Scope of the MRG", statutory: true, basis: "MRG s.1",
      body: "MRG application: {{mrg_scope}}.\n\nWhere the MRG applies in full, the rent is capped, termination by the Landlord requires an important reason under s.30, and most landlord favourable terms are void. Where it is excluded, the ABGB alone applies and the parties have far more freedom.\n\nGetting this classification wrong is the most common and most expensive error in Austrian letting." },
    { id: "at_rent", heading: "Rent", replaces: "rent", statutory: true, basis: "MRG s.16, Richtwertgesetz",
      body: "Rent: {{rent_amount}} {{rent_period}}. Basis: {{richtwert}}.\n\nUnder full application the permitted rent is the Richtwert for the Land adjusted by surcharges and discounts, or the Kategoriemiete for older contracts. A rent above the permitted maximum is void as to the excess and the Tenant may reclaim it, generally within 3 years." },
    { id: "at_befristung", heading: "Fixed term", statutory: true, basis: "MRG s.29",
      body: "Term: {{befristung}}. A fixed term under full application must be in writing and must be for at least 3 years. A fixed term that does not comply is treated as open ended.\n\nA fixed term rent attracts a mandatory 25 percent discount (Befristungsabschlag).\n\nThe Tenant may terminate after the first year on 3 months' notice regardless of the fixed term." },
    { id: "at_kaution", heading: "Deposit", replaces: "deposit", statutory: true, basis: "MRG s.16b",
      body: "The deposit is {{deposit_amount}}, customarily up to 3 months' rent. The Landlord must invest it in a manner that preserves its value and separately from the Landlord's own assets, and return it with interest promptly at the end of the tenancy less any justified claim." },
  ],
  attachments: [{ label: "Übergabeprotokoll", note: "" }, { label: "Energieausweis", note: "" }],
  warnings: ["Establish whether the MRG applies in full, in part, or not at all before you set the rent. Everything follows from it.", "A fixed term must be at least 3 years and carries a mandatory 25 percent rent discount."],
};

export const PL_SPEC: AgreementSpec = {
  key: "PL", countryName: "Poland",
  documentTitle: "Umowa Najmu Lokalu Mieszkalnego",
  version: "PL-2024.1",
  statutoryBasis: "Ustawa o ochronie praw lokatorów z 21 czerwca 2001; Kodeks cywilny art. 659-692",
  legislationUrl: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20010710733",
  fields: [
    { key: "najem_type", label: "Lease type", type: "select", options: ["Najem zwykły (ordinary)", "Najem okazjonalny (occasional)", "Najem instytucjonalny (institutional)"], required: true, hint: "Najem okazjonalny gives far stronger eviction rights but requires a notarial submission to enforcement, an indicated alternative address, and registration with the tax office within 14 days." },
    { key: "notarial_ref", label: "Notarial deed reference", type: "text", hint: "For najem okazjonalny: the tenant's notarised voluntary submission to eviction." },
    { key: "alt_address", label: "Tenant's alternative address", type: "longtext", hint: "Required for najem okazjonalny, with the owner's notarised consent to receive the tenant." },
    { key: "tax_office_ref", label: "Tax office notification", type: "text", hint: "Within 14 days of the start, or the occasional lease protections lapse." },
  ],
  clauses: [
    { id: "pl_law", heading: "Governing law", statutory: true, basis: "Ustawa o ochronie praw lokatorów",
      body: "Lease type: {{najem_type}}. This lease is governed by the Tenants' Rights Protection Act and the Civil Code. The Act's protections are mandatory and cannot be contracted away in an ordinary lease." },
    { id: "pl_okazjonalny", heading: "Occasional lease formalities", statutory: true, basis: "Ustawa o ochronie praw lokatorów art.19a-19e",
      body: "Notarial deed: {{notarial_ref}}. Alternative address: {{alt_address}}. Tax notification: {{tax_office_ref}}.\n\nA najem okazjonalny requires all of: a written lease for a fixed term of up to 10 years, the Tenant's notarised declaration submitting voluntarily to eviction, the Tenant's indication of an address to move to, the owner of that address consenting, and notification to the tax office within 14 days of the start.\n\nMiss any of these and the lease is an ordinary lease with the full statutory eviction protections." },
    { id: "pl_eviction", heading: "Eviction", statutory: true, basis: "Ustawa o ochronie praw lokatorów art.14-16",
      body: "In an ordinary lease the court must consider whether the Tenant is entitled to social housing. Eviction of a pregnant woman, a minor, a disabled person, a person of pension age or an unemployed person to the street is prohibited, and enforcement is suspended until the municipality provides accommodation.\n\nEviction is prohibited between 1 November and 31 March where no alternative accommodation is indicated.\n\nA najem okazjonalny bypasses much of this, which is why the formalities matter." },
    { id: "pl_kaucja", heading: "Deposit", replaces: "deposit", statutory: true, basis: "Ustawa o ochronie praw lokatorów art.6",
      body: "The deposit is {{deposit_amount}} and may not exceed 12 times the monthly rent for an ordinary lease, or 6 times for an occasional lease. It must be returned within 1 month of vacation, less lawful deductions, indexed." },
  ],
  attachments: [{ label: "Notarised submission to enforcement", note: "Occasional lease only." }, { label: "Owner's consent for the alternative address", note: "Occasional lease only." }, { label: "Protokół zdawczo-odbiorczy", note: "" }],
  warnings: ["If you want realistic eviction rights in Poland, use najem okazjonalny and complete every formality, including the 14 day tax notification.", "Winter eviction is prohibited from 1 November to 31 March without indicated alternative accommodation."],
};

export const SA_SPEC: AgreementSpec = {
  key: "SA", countryName: "Saudi Arabia",
  documentTitle: "عقد إيجار (Residential Lease Contract)",
  version: "SA-2024.1",
  statutoryBasis: "Ejar network regulations; Royal Decree on the Rental Services network; Sharia principles of contract",
  legislationUrl: "https://www.ejar.sa/",
  prescribedForm: {
    name: "Ejar registered contract",
    url: "https://www.ejar.sa/",
    note: "Registration on the Ejar network is mandatory. An unregistered contract is not recognised, cannot be enforced through the enforcement court, and blocks utility connection and expatriate services.",
  },
  fields: [
    { key: "ejar_number", label: "Ejar contract number", type: "text", required: true },
    { key: "deed_number", label: "Title deed (صك) number", type: "text", required: true },
    { key: "tenant_id", label: "Tenant national ID or Iqama", type: "text", required: true },
  ],
  clauses: [
    { id: "sa_law", heading: "Governing law and Ejar registration", statutory: true, basis: "Ejar network regulations",
      body: "Ejar number: {{ejar_number}}. Title deed: {{deed_number}}. Tenant ID: {{tenant_id}}.\n\nThis contract is registered on the Ejar network as the regulations require. An unregistered lease is not recognised by the courts or the enforcement authority, and utilities cannot be connected against it.\n\nEjar contracts are enforceable directly through the Execution Court without a prior judgment, which is the principal reason to register." },
    { id: "sa_rent", heading: "Rent", replaces: "rent", basis: "Ejar regulations",
      body: "The rent is {{rent_amount}} {{rent_period}}, paid through the Ejar payment channel where the regulations require it.\n\nThere is no general rent cap. The contract governs increases, and any change must be reflected in a registered amendment." },
    { id: "sa_ending", heading: "Termination", basis: "Ejar regulations; Execution Law",
      body: "Termination follows the contract and the Ejar terms. Where the Tenant defaults, the Landlord may apply directly to the Execution Court on the strength of the registered contract.\n\nThe Landlord may not take possession by self help, cut off utilities, or change locks." },
    { id: "sa_maintenance", heading: "Maintenance", basis: "Ejar standard terms",
      body: "The Landlord maintains the structure and the fixed installations. The Tenant is responsible for routine upkeep and for damage the Tenant causes, and must return the Property in its original condition, fair wear and tear excepted." },
  ],
  attachments: [{ label: "Ejar registration", note: "Mandatory." }, { label: "Title deed copy", note: "" }, { label: "ID / Iqama copies", note: "" }],
  warnings: ["An unregistered lease is unenforceable in Saudi Arabia. Register on Ejar.", "The Ejar contract is directly enforceable through the Execution Court, which is a significant advantage. Do not forfeit it."],
};

export const QA_SPEC: AgreementSpec = {
  key: "QA", countryName: "Qatar",
  documentTitle: "Residential Lease Contract",
  version: "QA-2024.1",
  statutoryBasis: "Law No. 4 of 2008 regulating the leasing of property; Civil Code Law No. 22 of 2004",
  legislationUrl: "https://www.almeezan.qa/",
  prescribedForm: {
    name: "Municipality Rent Registration",
    url: "https://www.mme.gov.qa/",
    note: "Leases must be registered with the Rental Registration Office at the Ministry of Municipality. Registration is required for utilities, residence permits and enforcement.",
  },
  fields: [
    { key: "registration_number_qa", label: "Rent registration number", type: "text", required: true },
    { key: "tenant_qid", label: "Tenant QID", type: "text", required: true },
    { key: "kahramaa_ref", label: "Kahramaa account reference", type: "text" },
  ],
  clauses: [
    { id: "qa_law", heading: "Governing law and registration", statutory: true, basis: "Law No. 4 of 2008",
      body: "Registration number: {{registration_number_qa}}. Tenant QID: {{tenant_qid}}.\n\nThis contract is registered with the Rental Registration Office as Law No. 4 of 2008 requires. Registration is a precondition for utility connection and for residence permit processing, and an unregistered contract is difficult to enforce.\n\nDisputes go to the Rental Disputes Settlement Committee." },
    { id: "qa_rent", heading: "Rent", replaces: "rent", statutory: true, basis: "Law No. 4 of 2008 art.10-12",
      body: "The rent is {{rent_amount}} {{rent_period}}. Kahramaa reference: {{kahramaa_ref}}.\n\nThe Landlord may not increase the rent during the term. Any increase requires a new registered contract and notice as the Law requires." },
    { id: "qa_ending", heading: "Termination", statutory: true, basis: "Law No. 4 of 2008 art.17-19",
      body: "The Landlord may seek eviction only on the grounds the Law lists, including non payment after formal notice, subletting without consent, use for an unlawful purpose, demolition or reconstruction, or the owner's own use.\n\nThe Landlord must give the notice the Law requires, usually 3 months for the owner's own use, and must apply to the Rental Disputes Committee. Self help is unlawful." },
    { id: "qa_maintenance", heading: "Maintenance", statutory: true, basis: "Law No. 4 of 2008 art.14",
      body: "The Landlord must deliver the Property fit for the agreed use and must carry out the maintenance necessary to keep it so, unless the parties agree otherwise in writing. The Tenant bears routine maintenance and any damage the Tenant causes." },
  ],
  attachments: [{ label: "Rent registration certificate", note: "" }, { label: "Title deed copy", note: "" }, { label: "QID copies", note: "" }],
  warnings: ["Rent cannot be increased during the term of a Qatari lease.", "Registration is a precondition for utilities and residence permits, not an optional formality."],
};

export const HK_SPEC: AgreementSpec = {
  key: "HK", countryName: "Hong Kong",
  documentTitle: "Tenancy Agreement",
  version: "HK-2024.1",
  statutoryBasis: "Landlord and Tenant (Consolidation) Ordinance Cap. 7; Stamp Duty Ordinance Cap. 117",
  legislationUrl: "https://www.elegislation.gov.hk/hk/cap7",
  fields: [
    { key: "stamp_ref_hk", label: "Stamp duty reference", type: "text", required: true, hint: "Stamp within 30 days of execution. An unstamped agreement is inadmissible in evidence and attracts a penalty of up to 10 times the duty." },
    { key: "land_registry_ref", label: "Land Registry registration", type: "text", hint: "A tenancy over 3 years must be registered within 30 days of execution to bind a purchaser." },
    { key: "subdivided", label: "Subdivided unit", type: "select", options: ["No", "Yes"], required: true, hint: "Part IVA of Cap. 7 regulates subdivided units: mandatory 4 year term structure, a written agreement in the prescribed form, a rent increase cap and restrictions on overcharging for utilities." },
  ],
  clauses: [
    { id: "hk_law", heading: "Governing law", statutory: true, basis: "Landlord and Tenant (Consolidation) Ordinance Cap. 7",
      body: "This agreement is governed by the laws of Hong Kong. Subdivided unit: {{subdivided}}.\n\nFor an ordinary domestic tenancy there is no rent control and no statutory security of tenure. The written terms are therefore central." },
    { id: "hk_sdu", heading: "Regulated subdivided units", statutory: true, basis: "Cap. 7 Part IVA",
      body: "Where the Property is a subdivided unit, Part IVA applies. The tenancy must be in the prescribed form, the first term is 2 years with a right to renew for a further 2, the rent may not be increased on renewal by more than the percentage set by the Rating and Valuation Department, and the Landlord may not overcharge for water, electricity or gas.\n\nThe Landlord must submit a Notice of Tenancy (Form AR2) to the Rating and Valuation Department within 60 days of the start. Failure is an offence." },
    { id: "hk_stamp", heading: "Stamp duty and registration", statutory: true, basis: "Stamp Duty Ordinance Cap. 117; Land Registration Ordinance Cap. 128",
      body: "Stamp reference: {{stamp_ref_hk}}. Land Registry: {{land_registry_ref}}.\n\nThe agreement must be stamped within 30 days of execution. An unstamped agreement cannot be produced in evidence in civil proceedings.\n\nA tenancy for a term exceeding 3 years must be registered at the Land Registry within 30 days of execution, or it loses priority against a subsequent purchaser." },
    { id: "hk_ending", heading: "Termination", basis: "Contract; Cap. 7",
      body: "Termination follows the agreement. A break clause after the first 12 months on 2 months' notice is standard practice.\n\nThe Landlord may not re-enter by force. Recovery of possession requires a court order, and forfeiture for non payment is subject to the Tenant's right to relief.\n\nThe Landlord may not harass the Tenant or withhold services to force the Tenant out. Doing so is an offence under Cap. 7." },
  ],
  attachments: [{ label: "Stamp certificate", note: "Within 30 days." }, { label: "Form AR2 Notice of Tenancy", note: "Subdivided units, within 60 days." }, { label: "Inventory", note: "" }],
  warnings: ["An unstamped tenancy agreement is inadmissible in a Hong Kong court. Stamp it within 30 days.", "Subdivided units are regulated under Part IVA with a mandatory form, term structure and rent cap."],
};
