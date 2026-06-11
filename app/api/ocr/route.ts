import { NextRequest, NextResponse } from "next/server";
import { parseReceipt } from "@/lib/ocr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// OCR can take a few seconds; allow generous time on platforms that honour it.
export const maxDuration = 60;

/**
 * Receipt OCR endpoint. Accepts an image (multipart "file"), runs Tesseract,
 * and returns a best-effort {amount, date, vendor} to pre-fill the expense
 * form. Tesseract is imported lazily so it never loads on cold paths that
 * don't OCR.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const { createWorker } = await import("tesseract.js");
    const buffer = Buffer.from(await file.arrayBuffer());

    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(buffer);
    await worker.terminate();

    return NextResponse.json(parseReceipt(text));
  } catch (err) {
    return NextResponse.json(
      { error: `OCR failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
