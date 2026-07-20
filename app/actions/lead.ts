"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sendgrid";
import { verifyFormToken, rateLimit, clientIp, looksLikeSpam } from "@/lib/spam";

export interface LeadResult {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Loose on purpose: this is a global product, so we accept +, spaces, dashes,
// brackets and 7 to 15 digits per E.164 rather than assuming a UK format.
const PHONE_RE = /^[+()\d][\d\s()+\-.]{6,24}$/;

const clean = (v: FormDataEntryValue | null, max = 200) =>
  String(v ?? "").trim().slice(0, max);

/**
 * Public callback request from the marketing site.
 *
 * Uses the service client because the anon role deliberately has no read access
 * to `leads`, and we want the insert to succeed without ever exposing the table.
 */
export async function requestCallback(formData: FormData): Promise<LeadResult> {
  // Bot filtering. Every rejection returns the same success message a human
  // sees, so a bot cannot tell which layer caught it and tune around it.
  const decoy: LeadResult = { ok: true, message: "Thanks. A Lintel partner will call you shortly." };

  // 1. Honeypot. Real people never fill a hidden field; bots fill everything.
  if (clean(formData.get("company"))) return decoy;

  // 2. Signed timing token: instant posts and replayed pages are not human.
  const verdict = verifyFormToken(clean(formData.get("t"), 200));
  if (verdict === "too-fast" || verdict === "bad-signature" || verdict === "missing") return decoy;
  if (verdict === "expired") {
    return { ok: false, message: "This form has been open a while. Please reload the page and try again." };
  }

  // 3. Rate limit per IP.
  if (!rateLimit(`lead:${clientIp(headers())}`)) {
    return { ok: false, message: "You've sent several requests already. Please email hello@lintelsquared.com and we'll pick it up." };
  }

  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 160).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const country = clean(formData.get("country"), 80);
  const properties = clean(formData.get("properties"), 40);
  const note = clean(formData.get("note"), 1000);

  if (name.length < 2) return { ok: false, message: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!PHONE_RE.test(phone)) return { ok: false, message: "Please enter a valid phone number." };

  // 4. Content heuristics, after validation so we only scan plausible input.
  if (looksLikeSpam({ name, note, country })) return decoy;

  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("leads")
      .insert({ name, email, phone, country: country || null, properties: properties || null, note: note || null, source: "home" });
    if (error) throw new Error(error.message);
  } catch {
    return { ok: false, message: "We couldn't send that just now. Please email hello@lintelsquared.com." };
  }

  // Notify the team. Never block or fail the request on the email.
  try {
    const to = process.env.LEADS_NOTIFY_EMAIL;
    if (to) {
      await sendEmail({
        to,
        subject: `Callback request: ${name}`,
        html:
          `<p><strong>${name}</strong> asked for a callback.</p>` +
          `<p>Email: ${email}<br/>Phone: ${phone}<br/>Country: ${country || "not given"}<br/>Portfolio: ${properties || "not given"}</p>` +
          (note ? `<p>Note: ${note}</p>` : ""),
      });
    }
  } catch {
    // best effort
  }

  return decoy;
}
