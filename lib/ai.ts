import "server-only";

/**
 * Minimal Anthropic Messages API wrapper for short generations (e.g. document
 * summaries). No-ops gracefully (returns null) when ANTHROPIC_API_KEY is not
 * configured, so features degrade rather than break.
 */
export async function generateText(
  prompt: string,
  opts: { maxTokens?: number; system?: string } = {}
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: opts.maxTokens ?? 200,
        system: opts.system,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.content?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch {
    return null;
  }
}

export const hasAi = () => Boolean(process.env.ANTHROPIC_API_KEY);

/**
 * Send a PDF or image directly to Claude (native document/vision understanding).
 * Works on scanned/flattened PDFs that have no embedded text. Returns null on
 * any failure so callers can fall back to text extraction.
 */
export async function generateFromDocument(
  base64: string,
  mediaType: string,
  prompt: string,
  opts: { maxTokens?: number; system?: string } = {}
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const isPdf = mediaType === "application/pdf" || /pdf/i.test(mediaType);
  const block = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: base64 } };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_DOC_MODEL ?? "claude-sonnet-4-6",
        max_tokens: opts.maxTokens ?? 600,
        system: opts.system,
        messages: [{ role: "user", content: [block, { type: "text", text: prompt }] }],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.content?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch {
    return null;
  }
}
