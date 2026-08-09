import "server-only";

/**
 * Lintel staff allowlist.
 *
 * The `leads` table is business-wide, not per-org: it holds Lintel's own sales
 * enquiries. Every customer signs up as `owner` of their own org, so role alone
 * cannot distinguish the owner from a landlord customer. Access to the leads
 * inbox is therefore gated on the signed-in user's email being on this
 * allowlist, checked server side on both the page and the actions.
 *
 * Only the account owner may see leads. LINTEL_ADMIN_EMAILS can widen this
 * later (comma separated) if the team grows; until then it is a single address.
 */
const DEFAULTS = ["pietermeyer667@gmail.com"];

function allowlist(): string[] {
  const raw = process.env.LINTEL_ADMIN_EMAILS;
  const list = raw ? raw.split(",") : DEFAULTS;
  return list.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isLintelAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowlist().includes(email.trim().toLowerCase());
}
