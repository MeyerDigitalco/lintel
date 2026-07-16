import { NextResponse } from "next/server";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sendgrid";
import { specFor, composeAgreement, fieldsFor, missingRequired, checkConstraints } from "@/lib/tenancy-agreement";
import { renderDocx } from "@/lib/tenancy-agreement/render-docx";
import { renderPdf } from "@/lib/tenancy-agreement/render-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface Body {
  values: Record<string, string>;
  format: "pdf" | "docx";
  action: "download" | "email";
  /** Optional: file it against a property in the document vault. */
  propertyId?: string | null;
  /** Required when action is "email". */
  to?: string;
  disabledClauseIds?: string[];
  /** Also store a copy in the property document vault. */
  saveToVault?: boolean;
}

function safeFilename(s: string) {
  return s.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "tenancy-agreement";
}

export async function POST(req: Request) {
  const { orgId, role, country, region } = await requireSession();
  if (!isWriterRole(role)) {
    return NextResponse.json({ error: "You don't have permission to generate agreements." }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const spec = specFor(country, region);
  if (!spec) {
    return NextResponse.json({ error: `No agreement template for ${country}.` }, { status: 400 });
  }

  const values = body.values ?? {};
  const missing = missingRequired(fieldsFor(spec), values);
  if (missing.length) {
    return NextResponse.json({ error: `Missing required details: ${missing.join(", ")}` }, { status: 422 });
  }

  // Region rules that would make the document wrong or unlawful. Enforced here
  // as well as in the form, because the form is not a security boundary.
  const { errors } = checkConstraints(spec, values);
  if (errors.length) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 422 });
  }

  const format = body.format === "docx" ? "docx" : "pdf";
  const doc = composeAgreement({ spec, values, disabledClauseIds: body.disabledClauseIds });
  const file = format === "docx" ? await renderDocx(doc) : await renderPdf(doc);
  const mime = format === "docx" ? DOCX_MIME : "application/pdf";
  const filename = `${safeFilename(`${spec.documentTitle}-${values.property_address ?? ""}`)}.${format}`;

  // Optionally file a copy against the property so it lands in the vault and the
  // tenant portal, rather than living only in the landlord's downloads folder.
  if (body.saveToVault && body.propertyId) {
    const supabase = createClient();
    const { data: prop } = await supabase
      .from("properties")
      .select("id")
      .eq("id", body.propertyId)
      .eq("org_id", orgId)
      .maybeSingle();
    if (prop) {
      const path = `${body.propertyId}/${Date.now()}-${filename}`;
      const { error: upErr } = await supabase.storage
        .from("property-docs")
        .upload(path, file, { contentType: mime, upsert: false });
      if (!upErr) {
        await supabase.from("property_documents").insert({
          org_id: orgId,
          property_id: body.propertyId,
          label: spec.documentTitle,
          doc_type: "tenancy_agreement",
          issued_at: values.start_date || null,
          expires_at: values.end_date || null,
          storage_path: path,
          ai_summary: `${spec.documentTitle} for ${values.property_address ?? "this property"}, tenant ${values.tenant_name ?? "unnamed"}, drafted against ${spec.statutoryBasis}.`,
          visible_to_tenant: true,
        });
      }
    }
  }

  if (body.action === "email") {
    const to = (body.to ?? "").trim();
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const result = await sendEmail({
      to,
      subject: `${spec.documentTitle}, ${values.property_address ?? ""}`.trim(),
      html:
        `<p>Please find attached the ${spec.documentTitle.toLowerCase()} for ${values.property_address ?? "the property"}.</p>` +
        `<p>This document is template assisted and is not legal advice. Please read it in full and take advice from a qualified lawyer in ${spec.regionName ?? spec.countryName} before signing.</p>` +
        `<p>Drafted against ${spec.statutoryBasis}.</p>` +
        `<p>Sent from Lintel Squared.</p>`,
      text:
        `Attached: ${spec.documentTitle} for ${values.property_address ?? "the property"}.\n\n` +
        `This document is template assisted and is not legal advice. Please read it in full and take advice from a qualified lawyer in ${spec.regionName ?? spec.countryName} before signing.\n\n` +
        `Drafted against ${spec.statutoryBasis}.\n\nSent from Lintel Squared.`,
      attachments: [{ content: file.toString("base64"), filename, type: mime }],
    });
    return NextResponse.json({
      ok: true,
      emailed: !result?.skipped,
      // In dev without SENDGRID_API_KEY the send is skipped; say so rather than
      // reporting a success that never left the building.
      note: result?.skipped ? "Email is not configured on this environment, so nothing was sent." : undefined,
    });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
    },
  });
}
