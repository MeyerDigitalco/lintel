import "server-only";
import { generateText, hasAi } from "@/lib/ai";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { formatMoney } from "@/lib/i18n/currency";

export interface AssistantCtx {
  orgId: string;
  country: string;
  region: string;
  regionCode: string | null;
  currency: string;
}

/**
 * Free-form landlord Q&A grounded in the org's live portfolio + region rules.
 * `supabase` may be a cookie-scoped (RLS) or service client; all reads are
 * filtered by orgId so a service client stays org-safe. Read-only.
 */
export async function answerQuestion(
  supabase: any,
  ctx: AssistantCtx,
  question: string
): Promise<string> {
  if (!question.trim()) {
    return "Ask me anything about your properties, tenants, rent, compliance, or the rules in your region.";
  }
  if (!hasAi()) {
    return "The AI assistant isn't configured yet (missing API key). You can still use the commands below.";
  }

  const today = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 60);

  const [{ data: props }, { data: tens }, { data: comp }, { data: ledger }] = await Promise.all([
    supabase.from("properties").select("label, city, is_hmo, status").eq("org_id", ctx.orgId).limit(50),
    supabase.from("tenancies").select("tenant_name, rent_amount, rent_period, properties(label)").eq("org_id", ctx.orgId).limit(50),
    supabase.from("compliance_items").select("label, expires_at, properties(label)").eq("org_id", ctx.orgId).lte("expires_at", soon.toISOString().slice(0, 10)).order("expires_at", { ascending: true }).limit(30),
    supabase.from("rent_ledger").select("period, amount_due, due_on, status").eq("org_id", ctx.orgId).neq("status", "confirmed").limit(50),
  ]);

  const money = (n: number) => formatMoney(n, ctx.currency, { decimals: true });
  const ruleset = ctx.country === "GB" ? resolveRegion("GB", ctx.region) : resolveRegion(ctx.country, ctx.region, ctx.regionCode);

  const propLines = (props ?? []).map((p: any) => `- ${p.label}${p.city ? `, ${p.city}` : ""}${p.is_hmo ? " (HMO)" : ""} — ${p.status ?? "unknown"}`).join("\n") || "None yet.";
  const tenLines = (tens ?? []).map((t: any) => `- ${t.tenant_name ?? "Tenant"} at ${t.properties?.label ?? "property"}: ${t.rent_amount ? money(Number(t.rent_amount)) + "/" + (t.rent_period === "weekly" ? "wk" : "mo") : "rent not set"}`).join("\n") || "None recorded.";
  const compLines = (comp ?? []).map((c: any) => `- ${c.label} (${c.properties?.label ?? "property"}) expires ${c.expires_at}`).join("\n") || "Nothing within 60 days.";
  const arrears = (ledger ?? []).filter((r: any) => new Date(r.due_on) < today);
  const arrearsLine = arrears.length ? arrears.map((r: any) => `- ${r.period}: ${money(Number(r.amount_due))} due ${r.due_on}`).join("\n") : "None — rent is up to date.";

  const context =
    `REGION: ${ruleset.subregionName ? ruleset.subregionName + ", " : ""}${ruleset.countryName}\n` +
    `Governing law: ${ruleset.governingLaw}\n` +
    `Tax: ${ruleset.taxLabel}\n` +
    `Deposit: ${ruleset.deposit.cap}; ${ruleset.deposit.protection}\n` +
    `Tenancy types: ${ruleset.tenancyTypes.map((t) => t.label).join(", ")}\n\n` +
    `PORTFOLIO\nProperties:\n${propLines}\n\nTenancies:\n${tenLines}\n\nCompliance expiring soon:\n${compLines}\n\nArrears:\n${arrearsLine}`;

  const answer = await generateText(
    `Answer the landlord's question helpfully and concisely. Use the CONTEXT for anything about their own portfolio. ` +
      `For legal, tax or compliance topics, give practical guidance grounded in their region but add a brief reminder that this is information, not formal legal or tax advice. ` +
      `If the answer isn't in the context and you're unsure, say so plainly.\n\nCONTEXT:\n${context}\n\nQUESTION: ${question.trim()}`,
    { system: "You are Lintel's assistant for landlords: accurate, concise, plain-English. You never invent figures; use only the provided context for portfolio facts.", maxTokens: 600 }
  );
  return answer?.trim() || "I couldn't generate an answer just now — please try rephrasing.";
}
