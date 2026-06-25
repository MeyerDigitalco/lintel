import "server-only";
import { generateFromDocument } from "@/lib/ai";

export interface ContactCardFields {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  kind?: "contractor" | "supplier" | "agent" | "tenant" | "other";
}

const PROMPT =
  "You are reading a photo of a business card OR a tradesperson's vehicle signage/decals. " +
  "Extract the business contact details. Return STRICT JSON with these keys (null when not visible):\n" +
  '{"name":string,"company":string,"phone":string,"email":string,"website":string,' +
  '"kind":"contractor"|"supplier"|"agent"|"other"}\n' +
  "'name' is the individual person's name if shown, otherwise null. " +
  "Infer 'kind' from the trade: plumber/electrician/builder/handyman/roofer/gas etc. => contractor; " +
  "merchant/wholesaler/building supplies => supplier; estate or letting agent => agent; otherwise other. " +
  "Phone numbers as written. Output JSON only.";

const SYSTEM = "You read business cards and vehicle signage and output only JSON contact details.";

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() && v.trim().toLowerCase() !== "null" ? v.trim() : undefined;

const KINDS = ["contractor", "supplier", "agent", "tenant", "other"];

/** Read a card / vehicle-decal photo and return contact fields. Never throws. */
export async function extractContactCard(buffer: Buffer, contentType: string): Promise<ContactCardFields> {
  const ct = contentType || "";
  const isPdf = ct === "application/pdf" || /pdf/i.test(ct);
  const isImage = /^image\//.test(ct);
  if (!isPdf && !isImage) return {};

  const ai = await generateFromDocument(buffer.toString("base64"), isPdf ? "application/pdf" : ct, PROMPT, {
    system: SYSTEM,
    maxTokens: 400,
  });
  if (!ai) return {};
  try {
    const j = JSON.parse(ai.replace(/```json|```/g, "").trim());
    const out: ContactCardFields = {};
    out.name = str(j.name);
    out.company = str(j.company);
    out.phone = str(j.phone);
    out.email = str(j.email);
    out.website = str(j.website);
    const kind = str(j.kind);
    if (kind && KINDS.includes(kind)) out.kind = kind as ContactCardFields["kind"];
    (Object.keys(out) as (keyof ContactCardFields)[]).forEach((k) => out[k] === undefined && delete out[k]);
    return out;
  } catch {
    return {};
  }
}
