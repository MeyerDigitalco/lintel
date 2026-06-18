// Country / region catalogue for the global product. The deep legal ruleset per
// region lands in Phase 4; this gives us currency, terminology and the picker.

export interface RegionOption { value: string; label: string }

export interface CountryInfo {
  code: string;        // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  taxLabel: string;    // what "tax records" means here
  tenancyTerm: string; // lease vs tenancy vs tenancy contract
  depositTerm: string;
  regions: RegionOption[];
}

const US_STATES: RegionOption[] = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
  ["DC","Washington, D.C."],
].map(([value, label]) => ({ value: `us_${value.toLowerCase()}`, label }));

const UAE_EMIRATES: RegionOption[] = [
  "Abu Dhabi","Dubai","Sharjah","Ajman","Umm Al Quwain","Ras Al Khaimah","Fujairah",
].map((n) => ({ value: `ae_${n.toLowerCase().replace(/\s+/g, "_")}`, label: n }));

const ZA_PROVINCES: RegionOption[] = [
  "Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape",
].map((n) => ({ value: `za_${n.toLowerCase().replace(/\s+/g, "_")}`, label: n }));

const UK_NATIONS: RegionOption[] = [
  { value: "england", label: "England" },
  { value: "wales", label: "Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern_ireland", label: "Northern Ireland" },
];

const AU_STATES: RegionOption[] = [
  ["nsw","New South Wales"],["vic","Victoria"],["qld","Queensland"],["wa","Western Australia"],
  ["sa","South Australia"],["tas","Tasmania"],["act","Australian Capital Territory"],["nt","Northern Territory"],
].map(([value, label]) => ({ value: `au_${value}`, label }));

const NZ_REGIONS: RegionOption[] = [
  "Auckland","Wellington","Canterbury","Waikato","Bay of Plenty","Otago","Manawatū-Whanganui","Northland",
].map((n) => ({ value: `nz_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const CA_PROVINCES: RegionOption[] = [
  ["on","Ontario"],["bc","British Columbia"],["ab","Alberta"],["qc","Quebec"],["mb","Manitoba"],
  ["sk","Saskatchewan"],["ns","Nova Scotia"],["nb","New Brunswick"],["nl","Newfoundland & Labrador"],["pe","Prince Edward Island"],
].map(([value, label]) => ({ value: `ca_${value}`, label }));

const IE_REGIONS: RegionOption[] = [
  "Leinster","Munster","Connacht","Ulster",
].map((n) => ({ value: `ie_${n.toLowerCase()}`, label: n }));

const DE_STATES: RegionOption[] = [
  "Berlin","Bavaria","North Rhine-Westphalia","Hamburg","Hesse","Baden-Württemberg","Saxony","Lower Saxony",
].map((n) => ({ value: `de_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const ES_REGIONS: RegionOption[] = [
  "Madrid","Catalonia","Andalusia","Valencia","Basque Country","Galicia","Balearic Islands","Canary Islands",
].map((n) => ({ value: `es_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const IN_STATES: RegionOption[] = [
  "Maharashtra","Delhi","Karnataka","Tamil Nadu","Telangana","Gujarat","Uttar Pradesh","West Bengal","Haryana","Rajasthan",
].map((n) => ({ value: `in_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const FR_REGIONS: RegionOption[] = [
  "Île-de-France","Provence-Alpes-Côte d'Azur","Auvergne-Rhône-Alpes","Occitanie","Nouvelle-Aquitaine","Grand Est","Hauts-de-France","Brittany",
].map((n) => ({ value: `fr_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const NL_PROVINCES: RegionOption[] = [
  "North Holland","South Holland","Utrecht","North Brabant","Gelderland","Overijssel","Limburg","Groningen",
].map((n) => ({ value: `nl_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const SG_REGIONS: RegionOption[] = [
  "Central","East","North","North-East","West",
].map((n) => ({ value: `sg_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

export const COUNTRIES: CountryInfo[] = [
  { code: "GB", name: "United Kingdom", currency: "GBP", taxLabel: "Self Assessment (SA105) / MTD", tenancyTerm: "tenancy", depositTerm: "deposit", regions: UK_NATIONS },
  { code: "US", name: "United States", currency: "USD", taxLabel: "Schedule E (Form 1040)", tenancyTerm: "lease", depositTerm: "security deposit", regions: US_STATES },
  { code: "AE", name: "United Arab Emirates", currency: "AED", taxLabel: "VAT records", tenancyTerm: "tenancy contract", depositTerm: "security deposit", regions: UAE_EMIRATES },
  { code: "ZA", name: "South Africa", currency: "ZAR", taxLabel: "ITR12 / provisional tax", tenancyTerm: "lease", depositTerm: "deposit", regions: ZA_PROVINCES },
  { code: "AU", name: "Australia", currency: "AUD", taxLabel: "ATO rental schedule", tenancyTerm: "tenancy", depositTerm: "bond", regions: AU_STATES },
  { code: "NZ", name: "New Zealand", currency: "NZD", taxLabel: "IR3 rental income", tenancyTerm: "tenancy", depositTerm: "bond", regions: NZ_REGIONS },
  { code: "CA", name: "Canada", currency: "CAD", taxLabel: "T776 — Statement of Real Estate Rentals", tenancyTerm: "tenancy", depositTerm: "deposit", regions: CA_PROVINCES },
  { code: "IE", name: "Ireland", currency: "EUR", taxLabel: "Form 11 rental income (Revenue)", tenancyTerm: "tenancy", depositTerm: "deposit", regions: IE_REGIONS },
  { code: "DE", name: "Germany", currency: "EUR", taxLabel: "Anlage V (income tax return)", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", regions: DE_STATES },
  { code: "ES", name: "Spain", currency: "EUR", taxLabel: "IRPF rental income", tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (fianza)", regions: ES_REGIONS },
  { code: "IN", name: "India", currency: "INR", taxLabel: "ITR (house property income, TDS)", tenancyTerm: "rent agreement", depositTerm: "security deposit", regions: IN_STATES },
  { code: "FR", name: "France", currency: "EUR", taxLabel: "Revenus fonciers (micro-foncier / réel)", tenancyTerm: "lease (bail)", depositTerm: "deposit (dépôt de garantie)", regions: FR_REGIONS },
  { code: "NL", name: "Netherlands", currency: "EUR", taxLabel: "Box 3 / rental income", tenancyTerm: "tenancy (huurovereenkomst)", depositTerm: "deposit (waarborgsom)", regions: NL_PROVINCES },
  { code: "SG", name: "Singapore", currency: "SGD", taxLabel: "IRAS rental income", tenancyTerm: "tenancy agreement", depositTerm: "security deposit", regions: SG_REGIONS },
];

export function countryByCode(code?: string | null): CountryInfo {
  return COUNTRIES.find((c) => c.code === (code ?? "").toUpperCase()) ?? COUNTRIES[0];
}

export function countryForRegion(region?: string | null): CountryInfo {
  if (!region) return COUNTRIES[0];
  if (region.startsWith("us_")) return countryByCode("US");
  if (region.startsWith("ae_")) return countryByCode("AE");
  if (region.startsWith("za_")) return countryByCode("ZA");
  if (region.startsWith("au_")) return countryByCode("AU");
  if (region.startsWith("nz_")) return countryByCode("NZ");
  if (region.startsWith("ca_")) return countryByCode("CA");
  if (region.startsWith("ie_")) return countryByCode("IE");
  if (region.startsWith("de_")) return countryByCode("DE");
  if (region.startsWith("es_")) return countryByCode("ES");
  if (region.startsWith("in_")) return countryByCode("IN");
  if (region.startsWith("fr_")) return countryByCode("FR");
  if (region.startsWith("nl_")) return countryByCode("NL");
  if (region.startsWith("sg_")) return countryByCode("SG");
  return countryByCode("GB");
}

export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
