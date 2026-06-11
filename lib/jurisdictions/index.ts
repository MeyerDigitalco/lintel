import type { JurisdictionKey, JurisdictionRules } from "./types";
import { england } from "./england";
import { wales } from "./wales";
import { scotland } from "./scotland";
import { northernIreland } from "./northern-ireland";

export * from "./types";

/**
 * Registry of all jurisdiction rule modules. The tax/MTD core is shared and
 * UK-wide; only the tenancy + compliance layer swaps by nation.
 */
const REGISTRY: Record<JurisdictionKey, JurisdictionRules> = {
  england,
  wales,
  scotland,
  northern_ireland: northernIreland,
};

/** Resolve the active rules module for a property's jurisdiction. */
export function resolveJurisdiction(key: JurisdictionKey): JurisdictionRules {
  const rules = REGISTRY[key];
  if (!rules) {
    throw new Error(`Unknown jurisdiction: ${key}`);
  }
  return rules;
}

/** All jurisdictions, for setup pickers and marketing. */
export function listJurisdictions(): JurisdictionRules[] {
  return Object.values(REGISTRY);
}

export const JURISDICTION_OPTIONS: { value: JurisdictionKey; label: string }[] = [
  { value: "england", label: "England" },
  { value: "wales", label: "Wales" },
  { value: "scotland", label: "Scotland" },
  { value: "northern_ireland", label: "Northern Ireland" },
];

export { england, wales, scotland, northernIreland };
