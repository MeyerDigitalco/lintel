import { resolveRegion } from "@/lib/i18n/rulesets";
import { COUNTRIES } from "@/lib/i18n/regions";
import type { HeroJurisdiction } from "@/components/site/AtlasHero";

/**
 * The jurisdictions shown in the home page hero switcher.
 *
 * Chosen to span legal families rather than to be a top-10 by market size: a UK
 * nation with no fixed term, a common-law jurisdiction, a civil-law one, a Gulf
 * registration regime and so on. The point is to show the rules genuinely
 * differ, so a visitor recognises their own country's vocabulary.
 *
 * Every value is read from the live ruleset, never hand written, so the hero
 * cannot claim something the product does not actually apply.
 */
const SHOWCASE: { key: string; label: string; country: string; region?: string }[] = [
  { key: "GB-ENG", label: "England", country: "GB", region: "england" },
  { key: "GB-SCT", label: "Scotland", country: "GB", region: "scotland" },
  { key: "IE", label: "Ireland", country: "IE" },
  { key: "US", label: "United States", country: "US" },
  { key: "NZ", label: "New Zealand", country: "NZ" },
  { key: "AE", label: "Dubai", country: "AE" },
  { key: "ZA", label: "South Africa", country: "ZA" },
  { key: "DE", label: "Germany", country: "DE" },
];

/** Trim a long ruleset string to something that reads in a hero. */
function short(s: string, max = 68): string {
  const t = (s ?? "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));
  return (stop > 28 ? cut.slice(0, stop) : cut.trimEnd()) + "...";
}

const titleCase = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function heroJurisdictions(): HeroJurisdiction[] {
  return SHOWCASE.map((s) => {
    const r = resolveRegion(s.country, s.region);
    const notice = r.notices[0];
    return {
      key: s.key,
      label: s.label,
      // tenancyTypes[0].label ("Private Residential Tenancy", "Tenancy of
      // unlimited duration") differentiates; r.tenancyTerm is just "tenancy"
      // in most countries and makes the row dead weight.
      tenancyTerm: short(r.tenancyTypes[0]?.label ?? titleCase(r.tenancyTerm), 44),
      depositCap: short(r.deposit.cap, 60),
      noticeLabel: short(notice?.label ?? "Notice", 24),
      noticePeriod: short(notice?.period ?? "Varies", 44),
      taxLabel: short(r.taxLabel, 46),
      governingLaw: short(r.governingLaw, 96),
    };
  });
}

/** Countries we support beyond the ones named in the switcher. */
export function heroMoreCount(): number {
  // SHOWCASE lists two UK nations, which is a single entry in COUNTRIES.
  const named = new Set(SHOWCASE.map((s) => s.country));
  return Math.max(0, COUNTRIES.length - named.size);
}
