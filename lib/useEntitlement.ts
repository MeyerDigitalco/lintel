"use client";

import { createContext, useContext } from "react";
import type { Feature } from "@/lib/stripe/config";

/**
 * Client-side entitlement context for UX gating only. The authoritative check
 * is always server-side (see lib/entitlements.ts). Never use this to protect a
 * mutation, only to show/hide UI.
 */
export const EntitlementContext = createContext<Record<Feature, boolean>>({
  core: false,
  voice: false,
  tenant_portal: false,
  maintenance_portal: false,
});

export function useEntitlement(feature: Feature): boolean {
  const ctx = useContext(EntitlementContext);
  return ctx[feature] ?? false;
}
