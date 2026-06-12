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
