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

const IT_REGIONS: RegionOption[] = [
  "Lazio","Lombardy","Campania","Sicily","Veneto","Piedmont","Tuscany","Emilia-Romagna",
].map((n) => ({ value: `it_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const PT_DISTRICTS: RegionOption[] = [
  "Lisbon","Porto","Braga","Faro","Coimbra","Aveiro","Setúbal","Leiria",
].map((n) => ({ value: `pt_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const CH_CANTONS: RegionOption[] = [
  "Zurich","Geneva","Vaud","Bern","Basel-Stadt","Ticino","Zug","Lucerne",
].map((n) => ({ value: `ch_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const JP_PREFECTURES: RegionOption[] = [
  "Tokyo","Osaka","Kanagawa","Aichi","Fukuoka","Hokkaido","Kyoto","Hyogo",
].map((n) => ({ value: `jp_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const MX_STATES: RegionOption[] = [
  "Mexico City","Jalisco","Nuevo León","State of Mexico","Puebla","Querétaro","Quintana Roo","Guanajuato",
].map((n) => ({ value: `mx_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const BR_STATES: RegionOption[] = [
  "São Paulo","Rio de Janeiro","Minas Gerais","Bahia","Paraná","Rio Grande do Sul","Santa Catarina","Distrito Federal",
].map((n) => ({ value: `br_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const BE_REGIONS: RegionOption[] = ["Brussels","Antwerp","Flanders","Wallonia","Ghent","Liège","Bruges","Leuven"].map((n) => ({ value: `be_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));
const AT_STATES: RegionOption[] = ["Vienna","Lower Austria","Upper Austria","Styria","Tyrol","Salzburg","Carinthia","Vorarlberg"].map((n) => ({ value: `at_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));
const PL_VOIVODESHIPS: RegionOption[] = ["Mazovia","Lesser Poland","Silesia","Greater Poland","Lower Silesia","Pomerania","Łódź","Lublin"].map((n) => ({ value: `pl_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));
const SA_REGIONS: RegionOption[] = ["Riyadh","Makkah","Eastern Province","Madinah","Asir","Qassim"].map((n) => ({ value: `sa_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));
const QA_MUNICIPALITIES: RegionOption[] = ["Doha","Al Rayyan","Al Wakrah","Al Khor","Umm Salal"].map((n) => ({ value: `qa_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));
const HK_REGIONS: RegionOption[] = ["Hong Kong Island","Kowloon","New Territories"].map((n) => ({ value: `hk_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

const IL_DISTRICTS: RegionOption[] = ["Jerusalem","Tel Aviv","Haifa","Central","Southern","Northern","Judea & Samaria"].map((n) => ({ value: `il_${n.toLowerCase().replace(/[^a-z]+/g, "_")}`, label: n }));

export const COUNTRIES: CountryInfo[] = [
  { code: "GB", name: "United Kingdom", currency: "GBP", taxLabel: "Self Assessment (SA105) / MTD", tenancyTerm: "tenancy", depositTerm: "deposit", regions: UK_NATIONS },
  { code: "US", name: "United States", currency: "USD", taxLabel: "Schedule E (Form 1040)", tenancyTerm: "lease", depositTerm: "security deposit", regions: US_STATES },
  { code: "AE", name: "United Arab Emirates", currency: "AED", taxLabel: "VAT records", tenancyTerm: "tenancy contract", depositTerm: "security deposit", regions: UAE_EMIRATES },
  { code: "ZA", name: "South Africa", currency: "ZAR", taxLabel: "ITR12 / provisional tax", tenancyTerm: "lease", depositTerm: "deposit", regions: ZA_PROVINCES },
  { code: "AU", name: "Australia", currency: "AUD", taxLabel: "ATO rental schedule", tenancyTerm: "tenancy", depositTerm: "bond", regions: AU_STATES },
  { code: "NZ", name: "New Zealand", currency: "NZD", taxLabel: "IR3 rental income", tenancyTerm: "tenancy", depositTerm: "bond", regions: NZ_REGIONS },
  { code: "CA", name: "Canada", currency: "CAD", taxLabel: "T776, Statement of Real Estate Rentals", tenancyTerm: "tenancy", depositTerm: "deposit", regions: CA_PROVINCES },
  { code: "IE", name: "Ireland", currency: "EUR", taxLabel: "Form 11 rental income (Revenue)", tenancyTerm: "tenancy", depositTerm: "deposit", regions: IE_REGIONS },
  { code: "DE", name: "Germany", currency: "EUR", taxLabel: "Anlage V (income tax return)", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", regions: DE_STATES },
  { code: "ES", name: "Spain", currency: "EUR", taxLabel: "IRPF rental income", tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (fianza)", regions: ES_REGIONS },
  { code: "IN", name: "India", currency: "INR", taxLabel: "ITR (house property income, TDS)", tenancyTerm: "rent agreement", depositTerm: "security deposit", regions: IN_STATES },
  { code: "FR", name: "France", currency: "EUR", taxLabel: "Revenus fonciers (micro-foncier / réel)", tenancyTerm: "lease (bail)", depositTerm: "deposit (dépôt de garantie)", regions: FR_REGIONS },
  { code: "NL", name: "Netherlands", currency: "EUR", taxLabel: "Box 3 / rental income", tenancyTerm: "tenancy (huurovereenkomst)", depositTerm: "deposit (waarborgsom)", regions: NL_PROVINCES },
  { code: "SG", name: "Singapore", currency: "SGD", taxLabel: "IRAS rental income", tenancyTerm: "tenancy agreement", depositTerm: "security deposit", regions: SG_REGIONS },
  { code: "IT", name: "Italy", currency: "EUR", taxLabel: "Redditi da locazione (cedolare secca / IRPEF)", tenancyTerm: "lease (contratto di locazione)", depositTerm: "deposit (deposito cauzionale)", regions: IT_REGIONS },
  { code: "PT", name: "Portugal", currency: "EUR", taxLabel: "IRS Categoria F (rental income)", tenancyTerm: "lease (contrato de arrendamento)", depositTerm: "deposit (caução)", regions: PT_DISTRICTS },
  { code: "CH", name: "Switzerland", currency: "CHF", taxLabel: "Rental income (federal & cantonal tax)", tenancyTerm: "tenancy (Mietvertrag / bail)", depositTerm: "deposit (Mietkaution)", regions: CH_CANTONS },
  { code: "JP", name: "Japan", currency: "JPY", taxLabel: "Real estate income (kakutei shinkoku)", tenancyTerm: "lease (chintai)", depositTerm: "deposit (shikikin)", regions: JP_PREFECTURES },
  { code: "MX", name: "Mexico", currency: "MXN", taxLabel: "ISR arrendamiento (SAT)", tenancyTerm: "lease (contrato de arrendamiento)", depositTerm: "deposit (depósito)", regions: MX_STATES },
  { code: "BR", name: "Brazil", currency: "BRL", taxLabel: "IRPF aluguéis (carnê-leão)", tenancyTerm: "lease (contrato de locação)", depositTerm: "deposit (caução)", regions: BR_STATES },
  { code: "BE", name: "Belgium", currency: "EUR", taxLabel: "Cadastral income / rental income", tenancyTerm: "lease (bail / huurovereenkomst)", depositTerm: "deposit (garantie locative)", regions: BE_REGIONS },
  { code: "AT", name: "Austria", currency: "EUR", taxLabel: "Einkünfte aus Vermietung (Anlage E1b)", tenancyTerm: "tenancy (Mietvertrag)", depositTerm: "deposit (Kaution)", regions: AT_STATES },
  { code: "PL", name: "Poland", currency: "PLN", taxLabel: "Ryczałt / PIT rental income", tenancyTerm: "lease (umowa najmu)", depositTerm: "deposit (kaucja)", regions: PL_VOIVODESHIPS },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", taxLabel: "No personal income tax; VAT records", tenancyTerm: "lease (Ejar contract)", depositTerm: "security deposit", regions: SA_REGIONS },
  { code: "QA", name: "Qatar", currency: "QAR", taxLabel: "No personal income tax", tenancyTerm: "lease contract", depositTerm: "security deposit", regions: QA_MUNICIPALITIES },
  { code: "HK", name: "Hong Kong", currency: "HKD", taxLabel: "Property tax (IRD)", tenancyTerm: "tenancy agreement", depositTerm: "deposit", regions: HK_REGIONS },
  { code: "IL", name: "Israel", currency: "ILS", taxLabel: "Rental income (Form 1301), 10% track or marginal", tenancyTerm: "lease (חוזה שכירות)", depositTerm: "security deposit (פיקדון)", regions: IL_DISTRICTS },
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
  if (region.startsWith("it_")) return countryByCode("IT");
  if (region.startsWith("pt_")) return countryByCode("PT");
  if (region.startsWith("ch_")) return countryByCode("CH");
  if (region.startsWith("jp_")) return countryByCode("JP");
  if (region.startsWith("mx_")) return countryByCode("MX");
  if (region.startsWith("br_")) return countryByCode("BR");
  if (region.startsWith("be_")) return countryByCode("BE");
  if (region.startsWith("at_")) return countryByCode("AT");
  if (region.startsWith("pl_")) return countryByCode("PL");
  if (region.startsWith("sa_")) return countryByCode("SA");
  if (region.startsWith("qa_")) return countryByCode("QA");
  if (region.startsWith("hk_")) return countryByCode("HK");
  if (region.startsWith("il_")) return countryByCode("IL");
  return countryByCode("GB");
}

export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));
