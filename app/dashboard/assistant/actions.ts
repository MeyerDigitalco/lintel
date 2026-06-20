"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { requireEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import type { QueryKind } from "@/lib/voice/types";
import { answerQuestion } from "@/lib/assistant-answer";

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

/** Free-form Q&A grounded in the org's portfolio + region (web, cookie session). */
export async function askAssistant(question: string): Promise<{ answer: string }> {
  const { orgId, country, region, regionCode, currency } = await requireSession();
  await requireEntitlement(orgId, "voice");
  const supabase = createClient();
  const answer = await answerQuestion(supabase, { orgId, country, region, regionCode, currency }, question);
  return { answer };
}
