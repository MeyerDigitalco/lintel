/**
 * Receipt OCR parsing helpers. The heavy lifting (image → text) happens in the
 * /api/ocr route via Tesseract; these pure functions turn raw OCR text into a
 * best-effort {amount, date, vendor} guess to pre-fill the expense form.
 *
 * Pure + dependency-free so they can be unit-tested without the OCR engine.
 */

export interface ParsedReceipt {
  amount: number | null;
  date: string | null; // ISO yyyy-mm-dd
  vendor: string | null;
  rawText: string;
}

const MONEY_RE = /(?:£|gbp\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2})/gi;
const TOTAL_HINT = /(total|amount due|balance|to pay|grand total)/i;

/** Pick the most likely total: prefer a money value on a line mentioning "total". */
export function extractAmount(text: string): number | null {
  const lines = text.split(/\r?\n/);
  let best: number | null = null;

  // First pass: lines that look like a total.
  for (const line of lines) {
    if (TOTAL_HINT.test(line)) {
      const m = [...line.matchAll(MONEY_RE)];
      if (m.length) {
        const v = parseFloat(m[m.length - 1][1].replace(/,/g, ""));
        if (!isNaN(v)) best = v;
      }
    }
  }
  if (best !== null) return best;

  // Fallback: the largest money value anywhere.
  const all = [...text.matchAll(MONEY_RE)]
    .map((m) => parseFloat(m[1].replace(/,/g, "")))
    .filter((n) => !isNaN(n));
  return all.length ? Math.max(...all) : null;
}

const DATE_PATTERNS: { re: RegExp; build: (m: RegExpMatchArray) => string | null }[] = [
  // 2025-06-11
  { re: /(\d{4})-(\d{2})-(\d{2})/, build: (m) => `${m[1]}-${m[2]}-${m[3]}` },
  // 11/06/2025 or 11-06-2025 (assume DD/MM/YYYY, UK)
  {
    re: /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/,
    build: (m) => {
      const d = m[1].padStart(2, "0");
      const mo = m[2].padStart(2, "0");
      let y = m[3];
      if (y.length === 2) y = `20${y}`;
      if (+mo > 12) return null;
      return `${y}-${mo}-${d}`;
    },
  },
];

export function extractDate(text: string): string | null {
  for (const { re, build } of DATE_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const iso = build(m);
      if (iso && !isNaN(new Date(iso).getTime())) return iso;
    }
  }
  return null;
}

/** Vendor: the first non-empty, mostly-alphabetic line near the top. */
export function extractVendor(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    const letters = (line.match(/[a-z]/gi) || []).length;
    if (letters >= 3 && !MONEY_RE.test(line) && !/receipt|invoice|vat/i.test(line)) {
      return line.slice(0, 60);
    }
  }
  return lines[0]?.slice(0, 60) ?? null;
}

export function parseReceipt(rawText: string): ParsedReceipt {
  return {
    amount: extractAmount(rawText),
    date: extractDate(rawText),
    vendor: extractVendor(rawText),
    rawText,
  };
}
