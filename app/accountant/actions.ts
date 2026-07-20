"use server";

import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { rateLimit, clientIp } from "@/lib/spam";

/**
 * Access gate for the accountant partner page.
 *
 * This is a soft gate, not a security boundary. The code is shared with many
 * accountants and will inevitably be passed around, so the page must never
 * contain anything genuinely confidential. What the gate buys us is that the
 * page is not casually discoverable, is not indexed, and gives us a signal that
 * whoever landed there was actually invited.
 *
 * The code is checked server side and never reaches the browser bundle. The
 * cookie stores a signed marker rather than the code itself, so a leaked cookie
 * does not reveal the code.
 */
const ACCESS_CODE = (process.env.ACCOUNTANT_ACCESS_CODE ?? "ACCAMTD").trim().toUpperCase();
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.CRON_SECRET ?? "lintel-dev-secret";

const GATE_COOKIE = "lintel_acc_gate";
const MAX_AGE_DAYS = 30;

const marker = () => createHmac("sha256", SECRET).update(`acc:${ACCESS_CODE}`).digest("base64url");

/** True when the current request already carries a valid gate cookie. */
export async function hasAccountantAccess(): Promise<boolean> {
  const got = cookies().get(GATE_COOKIE)?.value;
  if (!got) return false;
  const want = marker();
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface GateResult {
  ok: boolean;
  message?: string;
}

export async function submitAccessCode(formData: FormData): Promise<GateResult> {
  // Brute force protection. The code is short, so without this it is guessable.
  if (!rateLimit(`acc-gate:${clientIp(headers())}`, 8)) {
    return { ok: false, message: "Too many attempts. Please try again later, or email hello@lintelsquared.com." };
  }

  const supplied = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!supplied) return { ok: false, message: "Please enter your access code." };

  const a = Buffer.from(supplied);
  const b = Buffer.from(ACCESS_CODE);
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) return { ok: false, message: "That code was not recognised. Please check with your Lintel contact." };

  cookies().set(GATE_COOKIE, marker(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/accountant",
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60,
  });
  return { ok: true };
}
