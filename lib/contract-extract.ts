import "server-only";
import { generateText, generateFromDocument } from "@/lib/ai";

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

const PROMPT =
  "You are reading a residential tenancy agreement / lease. Extract ONLY what is stated, never guess.\n" +
  "Return STRICT JSON with these keys (use null when not present):\n" +
  '{"address_line1":string,"address_line2":string,"city":string,"postcode":string,' +
  '"tenant_name":string,"tenant_email":string,"tenant_phone":string,' +
  '"rent_amount":number,"rent_period":"monthly"|"weekly","deposit_amount":number,' +
  '"start_date":"YYYY-MM-DD","end_date":"YYYY-MM-DD"}\n' +
  "If multiple tenants are listed, use the first named tenant. Amounts as plain numbers (no currency symbols).\n" +
  "Output JSON only.";

const SYSTEM = "You extract structured fields from tenancy contracts and output only JSON.";

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
      const pkg = "pdf-parse/lib/pdf-parse.js";
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

function parseFields(ai: string | null): ContractFields {
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
    (Object.keys(out) as (keyof ContractFields)[]).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
  } catch {
    return {};
  }
}

/**
 * Read a tenancy contract and return the property + tenant + tenancy fields it
 * contains. Tries Claude's native document understanding first (works on scanned
 * PDFs and images with no text layer), then falls back to text extraction.
 * Returns {} when nothing can be read. Never throws.
 */
export async function extractContractFields(
  buffer: Buffer,
  contentType: string
): Promise<ContractFields> {
  const ct = contentType || "";
  const isPdf = ct === "application/pdf" || /pdf/i.test(ct);
  const isImage = /^image\//.test(ct);

  // 1) Native document/vision pass, robust to scanned contracts.
  if (isPdf || isImage) {
    const fromDoc = parseFields(
      await generateFromDocument(buffer.toString("base64"), isPdf ? "application/pdf" : ct, PROMPT, {
        system: SYSTEM,
        maxTokens: 600,
      })
    );
    if (Object.keys(fromDoc).length > 0) return fromDoc;
  }

  // 2) Fallback: extract embedded text, then ask the text model.
  const text = await extractText(buffer, ct);
  if (!text.trim()) return {};
  return parseFields(
    await generateText(PROMPT + "\n\nCONTRACT TEXT:\n" + text.slice(0, 8000), { system: SYSTEM, maxTokens: 600 })
  );
}
