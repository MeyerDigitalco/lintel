import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Anti-bot measures for public, unauthenticated forms.
 *
 * Layered on purpose, because each layer alone is weak:
 *
 *  1. Honeypot        stops naive scripted form fillers.
 *  2. Timing token    stops anything that posts instantly or replays an old
 *                     page. Signed with the service role key so a bot cannot
 *                     mint its own.
 *  3. Rate limit      stops one source hammering the endpoint.
 *  4. Content checks  stop the SEO spam that gets past all of the above,
 *                     which in practice is links pasted into a name field.
 *
 * No CAPTCHA. It punishes real users, and for a form that produces a phone
 * call the human on the other end is the final filter anyway.
 */

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.CRON_SECRET ?? "lintel-dev-secret";

/** Minimum time a human plausibly needs to fill the form. */
const MIN_FILL_MS = 3_000;
/** Token lifetime. Longer than a slow reader, shorter than a scraped page. */
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const sign = (issuedAt: string) =>
  createHmac("sha256", SECRET).update(issuedAt).digest("base64url");

/** Issue a token when the form is rendered. Server side only. */
export function issueFormToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export type TokenVerdict = "ok" | "missing" | "bad-signature" | "too-fast" | "expired";

export function verifyFormToken(token: string | null | undefined): TokenVerdict {
  if (!token || !token.includes(".")) return "missing";
  const [issuedAt, mac] = token.split(".");
  if (!/^\d+$/.test(issuedAt) || !mac) return "missing";

  const expected = sign(issuedAt);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "bad-signature";

  const age = Date.now() - Number(issuedAt);
  if (age < MIN_FILL_MS) return "too-fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}

/**
 * In-memory sliding-window rate limit.
 *
 * Serverless instances are per-region and recycled, so this is a speed bump
 * rather than a guarantee. It is enough to stop a single script in a loop,
 * which is the realistic threat for a callback form. Move to Upstash or Vercel
 * KV if volume ever justifies it.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

export function rateLimit(key: string, max = MAX_PER_WINDOW): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    // Cheap eviction so the map cannot grow without bound.
    for (const [k, v] of hits) if (v.every((t) => now - t > WINDOW_MS)) hits.delete(k);
  }
  return true;
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const LINK_RE = /(https?:\/\/|www\.|\[url|<a\s|\.ru\b|\.top\b|\.xyz\b)/i;
const CYRILLIC_RE = /[Ѐ-ӿ]/;
const SPAM_WORDS =
  /\b(seo|backlink|crypto|casino|viagra|loan offer|bitcoin|forex|porn|escort|marketing services|rank your|guest post)\b/i;

/**
 * Content heuristics. Applied only to fields where the pattern is never
 * legitimate: nobody's name contains a URL.
 */
export function looksLikeSpam(fields: { name: string; note?: string; country?: string }): boolean {
  const { name, note = "", country = "" } = fields;
  if (LINK_RE.test(name) || LINK_RE.test(country)) return true;
  if (CYRILLIC_RE.test(name) && CYRILLIC_RE.test(note)) return true;
  if (SPAM_WORDS.test(name) || SPAM_WORDS.test(note)) return true;
  // A "name" of 60+ characters with several links is a spam payload.
  if (name.length > 60 && (name.match(/\s/g)?.length ?? 0) > 8) return true;
  return false;
}
