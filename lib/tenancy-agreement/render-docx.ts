import "server-only";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, PageBreak,
} from "docx";
import type { ComposedAgreement } from "./types";

const EVERGREEN = "16233A";
const SLATE = "2B3340";
const RED = "D9534F";

function h(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, color: EVERGREEN, bold: true })],
  });
}

function p(text: string, opts: { italic?: boolean; size?: number; color?: string } = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, italics: opts.italic, size: opts.size ?? 22, color: opts.color ?? SLATE })],
  });
}

function summaryTable(rows: { label: string; value: string }[]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (r) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: r.label, bold: true, size: 20, color: EVERGREEN })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: r.value, size: 20, color: SLATE })] })],
            }),
          ],
        })
    ),
  });
}

function signatureTable(blocks: { role: string; name: string }[]) {
  const cell = (b: { role: string; name: string }) =>
    new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      children: [
        new Paragraph({ spacing: { before: 480 }, children: [new TextRun({ text: "................................................", color: SLATE })] }),
        new Paragraph({ children: [new TextRun({ text: b.role, bold: true, size: 20, color: EVERGREEN })] }),
        new Paragraph({ children: [new TextRun({ text: b.name || " ", size: 20, color: SLATE })] }),
        new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: "Date: ..............................", size: 20, color: SLATE })] }),
      ],
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: blocks.map(cell) })],
  });
}

/** Render a composed agreement to a .docx buffer. */
export async function renderDocx(doc: ComposedAgreement): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: doc.title, bold: true, size: 36, color: EVERGREEN })],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [new TextRun({ text: doc.subtitle, size: 22, color: SLATE })],
    })
  );

  children.push(h("Key terms", HeadingLevel.HEADING_2));
  children.push(summaryTable(doc.summary));

  doc.sections.forEach((s, i) => {
    children.push(h(`${i + 1}. ${s.heading}`, HeadingLevel.HEADING_2));
    s.paragraphs.forEach((para) => children.push(p(para)));
  });

  children.push(h("Signatures", HeadingLevel.HEADING_2));
  children.push(
    p("By signing below the parties confirm they have read and understood this agreement and agree to be bound by it.")
  );
  children.push(signatureTable(doc.signatureBlocks));

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(h("Important", HeadingLevel.HEADING_2));
  doc.warnings.forEach((w) => children.push(p(w, { color: RED, size: 20 })));

  children.push(h("Document provenance", HeadingLevel.HEADING_2));
  doc.provenance.forEach((l) => children.push(p(l, { italic: true, size: 18 })));

  const document = new Document({
    creator: "Lintel Squared",
    title: doc.title,
    description: `${doc.title}, ${doc.subtitle}`,
    sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children }],
  });

  return Packer.toBuffer(document);
}
