import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ComposedAgreement } from "./types";

/**
 * PDF renderer built on pdf-lib.
 *
 * pdf-lib is pure JavaScript with no native bindings and no filesystem font
 * loading, which is what makes it safe on Vercel's serverless runtime. The
 * trade off is that it does no layout: wrapping, pagination and spacing are all
 * done by hand below.
 *
 * Standard PDF fonts are WinAnsi encoded, so any character outside that set
 * (Hebrew, Arabic, Japanese, and the smart quotes Word likes to insert) would
 * throw on encode. sanitise() maps what it can and drops the rest, so a Saudi
 * or Japanese agreement still renders its Latin text rather than failing.
 */

const EVERGREEN = rgb(0.086, 0.137, 0.227);
const SLATE = rgb(0.169, 0.2, 0.251);
const RED = rgb(0.851, 0.325, 0.31);
const HAIRLINE = rgb(0.886, 0.906, 0.937);

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 56;
const WIDTH = A4[0] - MARGIN * 2;

const REPLACEMENTS: [RegExp, string][] = [
  [/[‘’‚‛]/g, "'"],
  [/[“”„‟]/g, '"'],
  [/[–—―]/g, "-"],
  [/[…]/g, "..."],
  [/[   ]/g, " "],
  [/[•]/g, "-"],
];

/** Make text safe for WinAnsi standard fonts; drop anything unencodable. */
function sanitise(s: string): string {
  let out = s;
  for (const [re, to] of REPLACEMENTS) out = out.replace(re, to);
  // Keep printable WinAnsi range, drop the rest rather than throwing on encode.
  return out.replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
}

/**
 * Titles carry the native-script name plus an English one in brackets, e.g.
 * "عقد إيجار (Residential Lease Contract)". Stripping the native script leaves
 * an orphaned "(Residential Lease Contract)", so unwrap the brackets when the
 * sanitised title is nothing but a parenthetical.
 */
function latinTitle(raw: string): string {
  const s = sanitise(raw).replace(/\s+/g, " ").trim();
  const m = /^\((.+)\)$/.exec(s);
  return m ? m[1].trim() : s;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitise(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

class Cursor {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  constructor(doc: PDFDocument) {
    this.doc = doc;
    this.page = doc.addPage(A4);
    this.y = A4[1] - MARGIN;
  }
  need(h: number) {
    if (this.y - h < MARGIN + 24) {
      this.page = this.doc.addPage(A4);
      this.y = A4[1] - MARGIN;
    }
  }
  text(t: string, font: PDFFont, size: number, color = SLATE, indent = 0, lead = 1.45) {
    for (const line of wrap(t, font, size, WIDTH - indent)) {
      this.need(size * lead);
      this.page.drawText(line, { x: MARGIN + indent, y: this.y - size, size, font, color });
      this.y -= size * lead;
    }
  }
  gap(h: number) {
    this.y -= h;
  }
  rule() {
    this.need(12);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: MARGIN + WIDTH, y: this.y },
      thickness: 0.75,
      color: HAIRLINE,
    });
    this.y -= 10;
  }
}

/** Render a composed agreement to a PDF buffer. */
export async function renderPdf(doc: ComposedAgreement): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(latinTitle(doc.title));
  pdf.setCreator("Lintel Squared");
  pdf.setProducer("Lintel Squared");

  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const c = new Cursor(pdf);

  c.text(latinTitle(doc.title), bold, 20, EVERGREEN);
  c.gap(4);
  c.text(doc.subtitle, reg, 10, SLATE);
  c.gap(10);
  c.rule();

  c.gap(6);
  c.text("Key terms", bold, 12, EVERGREEN);
  c.gap(4);
  for (const row of doc.summary) {
    const label = `${row.label}:`;
    const labelW = 110;
    c.need(14);
    c.page.drawText(sanitise(label), { x: MARGIN, y: c.y - 9, size: 9, font: bold, color: EVERGREEN });
    const lines = wrap(row.value, reg, 9, WIDTH - labelW);
    lines.forEach((line, i) => {
      if (i > 0) c.need(12);
      c.page.drawText(line, { x: MARGIN + labelW, y: c.y - 9, size: 9, font: reg, color: SLATE });
      c.y -= 12;
    });
  }
  c.gap(8);
  c.rule();

  doc.sections.forEach((s, i) => {
    c.gap(8);
    c.need(30);
    c.text(`${i + 1}. ${s.heading}`, bold, 12, EVERGREEN);
    c.gap(2);
    for (const para of s.paragraphs) {
      c.text(para, reg, 9.5, SLATE);
      c.gap(5);
    }
  });

  c.gap(14);
  c.need(140);
  c.text("Signatures", bold, 12, EVERGREEN);
  c.gap(4);
  c.text(
    "By signing below the parties confirm they have read and understood this agreement and agree to be bound by it.",
    reg, 9.5, SLATE
  );
  c.gap(20);
  for (const b of doc.signatureBlocks) {
    c.need(58);
    c.page.drawLine({
      start: { x: MARGIN, y: c.y },
      end: { x: MARGIN + 240, y: c.y },
      thickness: 0.75,
      color: SLATE,
    });
    c.y -= 12;
    c.page.drawText(sanitise(b.role), { x: MARGIN, y: c.y - 8, size: 9, font: bold, color: EVERGREEN });
    c.page.drawText(sanitise(b.name), { x: MARGIN + 90, y: c.y - 8, size: 9, font: reg, color: SLATE });
    c.y -= 14;
    c.page.drawText("Date:", { x: MARGIN, y: c.y - 8, size: 9, font: reg, color: SLATE });
    c.y -= 30;
  }

  // Warnings and provenance start a fresh page so the agreement body is clean.
  c.page = pdf.addPage(A4);
  c.y = A4[1] - MARGIN;
  c.text("Important", bold, 12, RED);
  c.gap(6);
  for (const w of doc.warnings) {
    c.text(w, reg, 9, RED);
    c.gap(5);
  }
  c.gap(10);
  c.rule();
  c.gap(4);
  c.text("Document provenance", bold, 10, EVERGREEN);
  c.gap(4);
  for (const l of doc.provenance) {
    c.text(l, italic, 8, SLATE);
    c.gap(2);
  }

  // Page numbers.
  const pages = pdf.getPages();
  pages.forEach((pg, i) => {
    const label = `Page ${i + 1} of ${pages.length}`;
    const w = reg.widthOfTextAtSize(label, 8);
    pg.drawText(label, { x: A4[0] - MARGIN - w, y: MARGIN - 20, size: 8, font: reg, color: SLATE });
    pg.drawText("Generated by Lintel Squared", { x: MARGIN, y: MARGIN - 20, size: 8, font: reg, color: SLATE });
  });

  return Buffer.from(await pdf.save());
}
