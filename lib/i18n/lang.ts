import "server-only";
import { cookies } from "next/headers";
import { availableLanguages } from "./dictionaries";

/** Resolve the active language from the cookie, constrained to the org's options. */
export function getLang(country?: string | null): string {
  try {
    const c = cookies().get("lang")?.value;
    const avail = availableLanguages(country);
    if (c && avail.includes(c)) return c;
    return avail[0] ?? "en";
  } catch {
    return "en";
  }
}
