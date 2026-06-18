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

export const COUNTRIES: CountryInfo[] = [
  { code: "GB", name: "United Kingdom", currency: "GBP", taxLabel: "Self Assessment (SA105) / MTD", tenancyTerm: "tenancy", depositTerm: "deposit", regions: UK_NATIONS },
  { code: "US", name: "United States", currency: "USD", taxLabel: "Schedule E (Form 1040)", tenancyTerm: "lease", depositTerm: "security deposit", regions: US_STATES },
  { code: "AE", name: "United Arab Emirates", currency: "AED", taxLabel: "VAT records", tenancyTerm: "tenancy contract", depositTerm: "security deposit", regions: UAE_EMIRATES },
  { code: "ZA", name: "South Africa", currency: "ZAR", taxLabel: "ITR12 / provisional tax", tenancyTerm: "lease", depositTerm: "deposit", regions: ZA_PROVINCES },
];

export function countryByCode(code?: string | null): CountryInfo {
  return COUNTRIES.find((c) => c.code === (code ?? "").toUpperCase()) ?? COUNTRIES[0];
}

export function countryForRegion(region?: string | null): CountryInfo {
  if (!region) return COUNTRIES[0];
  if (region.startsWith("us_")) return countryByCode("US");
  if (region.startsWith("ae_")) return countryByCode("AE");
  if (region.startsWith("za_")) return countryByCode("ZA");
  return countryByCode("GB");
}

export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
