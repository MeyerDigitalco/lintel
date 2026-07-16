import type { AgreementSpec, AgreementField } from "./types";
import { CORE_FIELDS } from "./core";
import { UK_SPECS, ENGLAND_SPEC, WALES_SPEC, SCOTLAND_SPEC, NI_SPEC } from "./specs-uk";
import { IE_SPEC, US_SPEC, AU_SPEC, NZ_SPEC, CA_SPEC, ZA_SPEC, AE_SPEC, IL_SPEC } from "./specs-intl";
import {
  DE_SPEC, FR_SPEC, ES_SPEC, NL_SPEC, IN_SPEC, SG_SPEC, IT_SPEC, PT_SPEC, CH_SPEC,
  JP_SPEC, MX_SPEC, BR_SPEC, BE_SPEC, AT_SPEC, PL_SPEC, SA_SPEC, QA_SPEC, HK_SPEC,
} from "./specs-intl2";

export * from "./types";
export { CORE_FIELDS, CORE_CLAUSES, composeAgreement, missingRequired, checkConstraints, fill } from "./core";

const BY_COUNTRY: Record<string, AgreementSpec> = {
  IE: IE_SPEC, US: US_SPEC, AU: AU_SPEC, NZ: NZ_SPEC, CA: CA_SPEC, ZA: ZA_SPEC,
  AE: AE_SPEC, IL: IL_SPEC, DE: DE_SPEC, FR: FR_SPEC, ES: ES_SPEC, NL: NL_SPEC,
  IN: IN_SPEC, SG: SG_SPEC, IT: IT_SPEC, PT: PT_SPEC, CH: CH_SPEC, JP: JP_SPEC,
  MX: MX_SPEC, BR: BR_SPEC, BE: BE_SPEC, AT: AT_SPEC, PL: PL_SPEC, SA: SA_SPEC,
  QA: QA_SPEC, HK: HK_SPEC,
};

/** UK nation keys as used by lib/jurisdictions and the org's `region` column. */
const UK_BY_REGION: Record<string, AgreementSpec> = {
  england: ENGLAND_SPEC,
  wales: WALES_SPEC,
  scotland: SCOTLAND_SPEC,
  northern_ireland: NI_SPEC,
};

export const ALL_SPECS: AgreementSpec[] = [...UK_SPECS, ...Object.values(BY_COUNTRY)];

/**
 * Resolve the agreement spec for an org's country and region.
 *
 * The UK is deliberately split by nation because housing is devolved: an
 * English AST template served in Scotland is not merely imprecise, it is
 * drafted against a statute that does not apply there.
 */
export function specFor(country: string, region?: string | null): AgreementSpec | null {
  const c = (country ?? "").toUpperCase();
  if (c === "GB" || c === "UK") {
    return UK_BY_REGION[(region ?? "england").toLowerCase()] ?? ENGLAND_SPEC;
  }
  return BY_COUNTRY[c] ?? null;
}

/** Every field the form should render for a region, core first then regional. */
export function fieldsFor(spec: AgreementSpec): AgreementField[] {
  return [...CORE_FIELDS, ...spec.fields];
}

/** True when we have a region-specific template rather than nothing at all. */
export function isSupported(country: string): boolean {
  const c = (country ?? "").toUpperCase();
  return c === "GB" || c === "UK" || Boolean(BY_COUNTRY[c]);
}
