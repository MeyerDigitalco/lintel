"use client";

import { EntitlementContext } from "@/lib/useEntitlement";
import type { Feature } from "@/lib/stripe/config";

export function EntitlementProvider({
  value,
  children,
}: {
  value: Record<Feature, boolean>;
  children: React.ReactNode;
}) {
  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
}
