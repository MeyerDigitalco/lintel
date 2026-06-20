"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import type { QueryKind } from "@/lib/voice/types";
import { generateText, hasAi } from "@/lib/ai";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { formatMoney } from "@/lib/i18n/currency";

export interface LogTransactionPayload {
  direction: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  propertyHint: string | null;
}

/**
 * Commit a voice-logged transaction. Only ever called AFTER the user confirms
 * in the UI. Entitlement-checked and audit-logged.
 */
export async function voiceLogTransaction(payload: LogTransactionPayload) {
  const { orgId, userId } = await requireSession();
  await requireEntitlement(orgId, "voice");
  const supabase = createClient();

  // Best-effort property match from the spoken hint.
  let propertyId: string | null = null;
  if (payload.propertyHint) {
    const { data } = await supabase
      .from("properties")
      .select("id, label")
      .eq("org_id", orgId)
      .ilike("label", `%${payload.propertyHint}%`)
      .limit(1)
      .maybeSingle();
    propertyId = data?.id ?? null;
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      org_id: orgId,
      property_id: propertyId,
      direction: payload.direction,
      sa105_category: payload.category,
      amount: payload.amount,
      occurred_on: new Date().toISOString().slice(0, 10),
      description: payload.description,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("audit_log").insert({
    org_id: orgId,
    actor_id: userId,
    action: "voice_log_transaction",
    entity: "transactions",
    entity_id: tx.id,
    meta: { via: "voice", ...payload },
  });

  revalidatePath("/dashboard/transactions");
  return { ok: true, matchedProperty: propertyId != null };
}

export interface QueryResult {
  kind: QueryKind;
  rows: { label: string; value: string }[];
}

/** Read-only portfolio queries for the assistant. */
export async function voiceQuery(kind: QueryKind): Promise<QueryResult> {
  const { orgId } = await requireSession();
  await requireEntitlement(orgId, "voice");
  const supabase = createClient();

  if (kind === "rent_roll") {
    const { data } = await supabase
      .from("tenancies")
      .select("rent_amount, properties(label)")
      .eq("org_id", orgId);
    const rows = (data ?? []).map((t: any) => ({
      label: t.properties?.label ?? "Property",
      value: `£${Number(t.rent_amount ?? 0).toFixed(2)}/mo`,
    }));
    const total = (data ?? []).reduce((s: number, t: any) => s + Number(t.rent_amount ?? 0), 0);
    rows.push({ label: "Total monthly", value: `£${total.toFixed(2)}` });
    return { kind, rows };
  }

  if (kind === "arrears") {
    const { data } = await supabase
      .from("rent_ledger")
      .select("period, amount_due, status, due_on")
      .eq("org_id", orgId)
      .neq("status", "confirmed");
    const overdue = (data ?? []).filter(
      (r: any) => new Date(r.due_on) < new Date()
    );
    if (overdue.length === 0) return { kind, rows: [{ label: "Arrears", value: "None — all up to date" }] };
    return {
      kind,
      rows: overdue.map((r: any) => ({
        label: `${r.period} (due ${r.due_on})`,
        value: `£${Number(r.amount_due).toFixed(2)}`,
      })),
    };
  }

  // expiries
  const soon = new Date();
  soon.setDate(soon.getDate() + 60);
  const { data } = await supabase
    .from("compliance_items")
    .select("label, expires_at")
    .eq("org_id", orgId)
    .lte("expires_at", soon.toISOString().slice(0, 10))
    .order("expires_at", { ascending: true });
  if (!data || data.length === 0)
    return { kind, rows: [{ label: "Certificates", value: "Nothing expiring in 60 days" }] };
  return {
    kind,
    rows: data.map((c: any) => ({ label: c.label, value: `expires ${c.expires_at}` })),
  };
}

/**
 * Free-form Q&A. Answers anything the landlord asks — about their own
 * portfolio (using a compact live context) or general property, tax and
 * compliance questions for their region. Read-only; never changes data.
 */
export async function askAssistant(question: string): Promise<{ answer: string }> {
  const { orgId, country, region, regionCode, currency } = await requireSession();
  await requireEntitlement(orgId, "voice");
  if (!question.trim()) return { answer: "Ask me anything about your properties, tenants, rent, compliance, or the rules in your region." };
  if (!hasAi()) return { answer: "The AI assistant isn't configured yet (missing API key). You can still use the commands below." };

  const supabase = createClient();
  const today = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 60);

  const [{ data: props }, { data: tens }, { data: comp }, { data: ledger }] = await Promise.all([
    supabase.from("properties").select("label, city, postcode, is_hmo, status").eq("org_id", orgId).limit(50),
    supabase.from("tenancies").select("tenant_name, rent_amount, rent_period, start_date, properties(label)").eq("org_id", orgId).limit(50),
    supabase.from("compliance_items").select("label, expires_at, properties(label)").eq("org_id", orgId).lte("expires_at", soon.toISOString().slice(0, 10)).order("expires_at", { ascending: true }).limit(30),
    supabase.from("rent_ledger").select("period, amount_due, due_on, status").eq("org_id", orgId).neq("status", "confirmed").limit(50),
  ]);

  const money = (n: number) => formatMoney(n, currency, { decimals: true });
  const ruleset = country === "GB" ? resolveRegion("GB", region) : resolveRegion(country, region, regionCode);

  const propLines = (props ?? []).map((p: any) => `- ${p.label}${p.city ? `, ${p.city}` : ""}${p.is_hmo ? " (HMO)" : ""} — ${p.status ?? "unknown"}`).join("\n") || "None yet.";
  const tenLines = (tens ?? []).map((t: any) => `- ${t.tenant_name ?? "Tenant"} at ${t.properties?.label ?? "property"}: ${t.rent_amount ? money(Number(t.rent_amount)) + "/" + (t.rent_period === "weekly" ? "wk" : "mo") : "rent not set"}`).join("\n") || "None recorded.";
  const compLines = (comp ?? []).map((c: any) => `- ${c.label} (${c.properties?.label ?? "property"}) expires ${c.expires_at}`).join("\n") || "Nothing within 60 days.";
  const arrears = (ledger ?? []).filter((r: any) => new Date(r.due_on) < today);
  const arrearsLine = arrears.length ? arrears.map((r: any) => `- ${r.period}: ${money(Number(r.amount_due))} due ${r.due_on}`).join("\n") : "None — rent is up to date.";

  const context = `REGION: ${ruleset.subregionName ? ruleset.subregionName + ", " : ""}${ruleset.countryName}\n` +
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
  return { answer: answer?.trim() || "I couldn't generate an answer just now — please try rephrasing." };
}
