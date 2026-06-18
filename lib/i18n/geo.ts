import "server-only";
import { headers } from "next/headers";
import { currencyForCountry } from "./currency";

// Detect the visitor's country from edge/CDN geo headers (Vercel sets
// x-vercel-ip-country). Falls back to GB.
export function detectCountry(): string {
  try {
    const h = headers();
    const cc = h.get("x-vercel-ip-country") || h.get("x-country") || "";
    return cc ? cc.toUpperCase() : "GB";
  } catch {
    return "GB";
  }
}

export function detectCurrency(): string {
  return currencyForCountry(detectCountry());
}
