import type { ParsedCommand, VoiceIntent, QueryKind } from "./types";

/**
 * Deterministic, rule-based intent parser. No external model, utterances are
 * matched against keyword/regex rules so behaviour is predictable and testable.
 * Anything we can't confidently parse returns `unknown` rather than guessing.
 */

const CATEGORY_KEYWORDS: { re: RegExp; key: string }[] = [
  { re: /\b(repair|maintenance|fix|plumb|electric|boiler|paint)\w*/i, key: "repairs_maintenance" },
  { re: /\b(mortgage|interest|finance)\b/i, key: "finance_costs" },
  { re: /\b(insurance|ground rent|rates|service charge)\b/i, key: "rent_rates_insurance" },
  { re: /\b(legal|management|letting fee|accountant|agent)\b/i, key: "legal_management_other" },
  { re: /\b(cleaning|gardening|wages)\b/i, key: "services_provided" },
];

const INCOME_RE = /\b(rent|income|received|paid in|deposit)\b/i;
const EXPENSE_RE = /\b(expense|spent|paid|cost|bought|bill|invoice)\b/i;
const AMOUNT_RE = /£?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/;
const DRAFT_VERB_RE = /\b(draft|message|write to|tell|remind|notify|email)\b/i;

function parseAmount(text: string): number | null {
  const m = text.match(AMOUNT_RE);
  if (!m) return null;
  const v = parseFloat(m[1].replace(/,/g, ""));
  return isNaN(v) ? null : v;
}

function categoryFor(text: string, direction: "income" | "expense"): string {
  if (direction === "income") return "rents";
  for (const c of CATEGORY_KEYWORDS) if (c.re.test(text)) return c.key;
  return "other_expenses";
}

function propertyHint(text: string): string | null {
  const m = text.match(/\b(?:at|for|on)\s+([A-Z0-9][\w'’.\- ]{2,40})$/);
  return m ? m[1].trim().replace(/[.,]$/, "") : null;
}

function draftTopic(text: string): string {
  const after = text.replace(/^.*?\btenant\b/i, "").trim();
  let topic = after.replace(/^(about|regarding|re|on|that|to|of)\b/i, "").trim();
  topic = topic.replace(/^the\s+/i, "").trim();
  return topic || "general update";
}

export function parseCommand(raw: string): ParsedCommand {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const amount = parseAmount(text);
  const isIncome = INCOME_RE.test(lower) && !EXPENSE_RE.test(lower);
  const isExpense = EXPENSE_RE.test(lower);

  if (amount != null && (isIncome || isExpense)) {
    const direction = isIncome ? "income" : "expense";
    const category = categoryFor(lower, direction);
    const intent: VoiceIntent = {
      type: "log_transaction",
      direction,
      amount,
      category,
      description: text,
      propertyHint: propertyHint(text),
    };
    return {
      intent,
      summary: `Log ${direction} of £${amount.toFixed(2)} (${category.replace(/_/g, " ")})`,
    };
  }

  if (/\btenant\b/.test(lower) && DRAFT_VERB_RE.test(lower)) {
    const topic = draftTopic(text);
    return {
      intent: { type: "draft_message", topic },
      summary: `Draft a tenant message about: ${topic}`,
    };
  }

  let queryKind: QueryKind | null = null;
  if (/\b(rent roll|rent status|who(?:'s| is) paid)\b/.test(lower)) queryKind = "rent_roll";
  else if (/\b(arrears|overdue|behind on rent|who owes)\b/.test(lower)) queryKind = "arrears";
  else if (/\b(certificate|expir|compliance|gas safety|epc|renew)\w*/.test(lower))
    queryKind = "expiries";
  if (queryKind) {
    return {
      intent: { type: "query", kind: queryKind },
      summary: `Look up ${queryKind.replace("_", " ")}`,
    };
  }

  return { intent: { type: "unknown", text }, summary: "Sorry, I didn't catch that." };
}
