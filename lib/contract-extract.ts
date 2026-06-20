import "server-only";
import { generateText } from "@/lib/ai";

export interface ContractFields {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  rent_amount?: number;
  rent_period?: "monthly" | "weekly";
  deposit_amount?: number;
  start_date?: string;
  end_date?: string;
}

async function extractText(buffer: Buffer, contentType: string): Promise<string> {
  const ct = contentType || "";
  if (/^image\//.test(ct)) {
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      return data?.text ?? "";
    } catch {
      return "";
    }
  }
  if (ct === "application/pdf") {
    try {
      const pkg = "pdf-parse";
      const pdf = ((await import(pkg)) as any).default;
      const data = await pdf(buffer);
      return (data?.text as string) ?? "";
    } catch {
      return "";
    }
  }
  return "";
}

const isDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() && v.trim().toLowerCase() !== "null" ? v.trim() : undefined;
const numv = (v: unknown): number | undefined => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^0-9.]/g, ""));
  return isFinite(n) && n > 0 ? n : undefined;
};

/**
 * Read a tenancy contract and return the property + tenant + tenancy fields it
 * contains. Returns {} when text/AI is unavailable so the caller can fall back
 * to manual entry. Never throws.
 */
export async function extractContractFields(
  buffer: Buffer,
  contentType: string
): Promise<ContractFields> {
  const text = await extractText(buffer, contentType);
  if (!text.trim()) return {};

  const ai = await generateText(
    `You are reading a residential tenancy agreement / lease. Extract ONLY what is stated, never guess.\n` +
      `Return STRICT JSON with these keys (use null when not present):\n` +
      `{"address_line1":string,"address_line2":string,"city":string,"postcode":string,` +
      `"tenant_name":string,"tenant_email":string,"tenant_phone":string,` +
      `"rent_amount":number,"rent_period":"monthly"|"weekly","deposit_amount":number,` +
      `"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD"}\n` +
      `If multiple tenants are listed, use the first named tenant. Amounts as plain numbers (no currency symbols).\n` +
      `Output JSON only.\n\nCONTRACT TEXT:\n${text.slice(0, 8000)}`,
    {
      system: "You extract structured fields from tenancy contracts and output only JSON.",
      maxTokens: 500,
    }
  );
  if (!ai) return {};

  try {
    const j = JSON.parse(ai.replace(/```json|```/g, "").trim());
    const out: ContractFields = {};
    out.address_line1 = str(j.address_line1);
    out.address_line2 = str(j.address_line2);
    out.city = str(j.city);
    out.postcode = str(j.postcode);
    out.tenant_name = str(j.tenant_name);
    out.tenant_email = str(j.tenant_email);
    out.tenant_phone = str(j.tenant_phone);
    out.rent_amount = numv(j.rent_amount);
    out.deposit_amount = numv(j.deposit_amount);
    if (j.rent_period === "weekly" || j.rent_period === "monthly") out.rent_period = j.rent_period;
    if (isDate(j.start_date)) out.start_date = j.start_date;
    if (isDate(j.end_date)) out.end_date = j.end_date;
    // Drop undefined keys for a clean payload.
    (Object.keys(out) as (keyof ContractFields)[]).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
  } catch {
    return {};
  }
}
