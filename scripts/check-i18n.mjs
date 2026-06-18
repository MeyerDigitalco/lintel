// Build-time invariant guard for the i18n layer. Fails the build if a country
// references a currency or language that isn't defined. Catches drift like the
// "NZD missing from CURRENCIES" bug before it ships.
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const cur = read("lib/i18n/currency.ts");
const reg = read("lib/i18n/regions.ts");
const dict = read("lib/i18n/dictionaries.ts");
const pricing = read("lib/i18n/pricing.ts");

const definedCurrencies = [...cur.matchAll(/^\s{2}([A-Z]{3}): \{ code:/gm)].map((m) => m[1]);
const countryCurrencyVals = [...reg.matchAll(/currency: "([A-Z]{3})"/g)].map((m) => m[1]);
const pricedCurrencies = [...pricing.matchAll(/^\s{2}([A-Z]{3}): \{ core:/gm)].map((m) => m[1]);
const definedLangs = [...dict.matchAll(/^\s{2}([a-z]{2}): \{ code:/gm)].map((m) => m[1]);
const usedLangs = [...dict.matchAll(/: \[([^\]]*)\]/g)].flatMap((m) => m[1].match(/"([a-z]{2})"/g) || []).map((s) => s.replace(/"/g, ""));

const errors = [];
const warnings = [];

for (const c of [...new Set(countryCurrencyVals)]) {
  if (!definedCurrencies.includes(c)) errors.push(`Currency ${c} is used by a country but not defined in CURRENCIES.`);
  if (!pricedCurrencies.includes(c)) warnings.push(`Currency ${c} has no LOCAL_PRICES entry (will fall back to GBP pricing).`);
}
for (const l of [...new Set(usedLangs)]) {
  if (!definedLangs.includes(l)) errors.push(`Language "${l}" is offered by a country but not defined in LANGUAGES.`);
}

if (warnings.length) console.warn("i18n warnings:\n  " + warnings.join("\n  "));
if (errors.length) {
  console.error("i18n invariant check FAILED:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`i18n invariant check passed — ${definedCurrencies.length} currencies, ${definedLangs.length} languages, all country references resolved.`);
