import "server-only";
import { generateText } from "@/lib/ai";

const KEYS = "gas_safety, eicr, epc, pat, fire_risk_assessment, fire_safety_cert, fire_alarm_cert, smoke_alarm_cert, legionella, tenancy_agreement, occupation_contract, deposit_cert, deposit_prescribed, inventory, right_to_rent, hmo_license, landlord_insurance, building_insurance, contents_insurance, mortgage_agreement, invoice, receipt, other";

/**
 * Read an uploaded document and extract its type and issue/expiry dates.
 * OCRs images with Tesseract, then asks the LLM for structured fields.
 * Returns {} when OCR or AI is unavailable, so upload never breaks.
 */
export async function extractDocFields(
  buffer: Buffer,
  contentType: string
): Promise<{ doc_type?: string; issued_at?: string; expires_at?: string }> {
  if (!/^image\//.test(contentType || "")) return {}; // PDFs need conversion — skip for now
  let text = "";
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(buffer);
    text = data?.text ?? "";
    await worker.terminate();
  } catch {
    return {};
  }
  if (!text.trim()) return {};

  const ai = await generateText(
    `From this rental-property document's OCR text, return STRICT JSON only:\n` +
      `{"doc_type": one of [${KEYS}] or null, "issued_at": "YYYY-MM-DD" or null, "expires_at": "YYYY-MM-DD" or null}\n` +
      `Use the document's own dates; do not guess. Output JSON only.\n\nTEXT:\n${text.slice(0, 4000)}`,
    { system: "You extract structured fields from property documents and output only JSON.", maxTokens: 200 }
  );
  if (!ai) return {};
  try {
    const j = JSON.parse(ai.replace(/```json|```/g, "").trim());
    const out: { doc_type?: string; issued_at?: string; expires_at?: string } = {};
    if (typeof j.doc_type === "string" && j.doc_type !== "null") out.doc_type = j.doc_type;
    if (typeof j.issued_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.issued_at)) out.issued_at = j.issued_at;
    if (typeof j.expires_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(j.expires_at)) out.expires_at = j.expires_at;
    return out;
  } catch {
    return {};
  }
}
