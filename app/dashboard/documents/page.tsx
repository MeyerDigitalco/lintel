import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { DocumentsFilter } from "@/components/app/DocumentsFilter";
import { summarizeDocument } from "./actions";
import { updateDocument, deleteDocument } from "@/app/dashboard/properties/document-actions";
import { DOC_TYPES, DOC_CATEGORIES } from "@/lib/doc-types";
import { hasAi } from "@/lib/ai";
import { fmtDate } from "@/lib/dates";
import { docLabel, docStatus, type DocStatusKey } from "@/lib/doc-types";
import { getLang } from "@/lib/i18n/lang";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<DocStatusKey, "default" | "mint" | "amber" | "red" | "evergreen"> = {
  valid: "evergreen", expiring: "amber", expired: "red", filed: "default",
};

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { type?: string; property?: string; status?: string };
}) {
  const { orgId, role, country } = await requireSession();
  const lang = getLang(country);
  const t = (k: string) => translate(lang, k);
  const canWrite = isWriterRole(role);
  const supabase = createClient();

  const [{ data: docs }, { data: properties }] = await Promise.all([
    supabase
      .from("property_documents")
      .select("id, label, doc_type, ai_summary, storage_path, issued_at, expires_at, created_at, property_id, properties(label)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("id, label").eq("org_id", orgId).order("label"),
  ]);

  const filtered = (docs ?? []).filter((d) => {
    if (searchParams.type && d.doc_type !== searchParams.type) return false;
    if (searchParams.property && d.property_id !== searchParams.property) return false;
    if (searchParams.status && docStatus(d.expires_at).key !== searchParams.status) return false;
    return true;
  });

  const withUrls = await Promise.all(
    filtered.map(async (d) => {
      const { data } = await supabase.storage.from("property-docs").createSignedUrl(d.storage_path, 600);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <PageHeader
        title={t("p.docs_title")}
        subtitle={t("p.docs_sub")}
      />

      <DocumentsFilter properties={properties ?? []} />

      {withUrls.length === 0 ? (
        <EmptyState
          title="No documents"
          body="Upload documents on each property (EPC, certificates, deposit, inventory, insurance, correspondence) to see them here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withUrls.map((d) => {
            const st = docStatus(d.expires_at);
            return (
              <Card key={d.id}>
                <CardBody>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{d.label}</span>
                    <Badge tone={STATUS_TONE[st.key]}>{st.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate">
                    {docLabel(d.doc_type)} · {(d as any).properties?.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate">
                    Added {fmtDate(d.created_at)}{d.expires_at && ` · expires ${fmtDate(d.expires_at)}`}
                  </p>
                  {d.ai_summary && (
                    <p className="mt-2 rounded-lintel bg-paper px-2 py-1.5 text-xs text-slate">✨ {d.ai_summary}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-evergreen hover:underline">Download</a>
                    )}
                    {canWrite && !d.ai_summary && (
                      <form action={summarizeDocument}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="text-sm text-slate hover:text-ink">Summarise</button>
                      </form>
                    )}
                    {canWrite && (
                      <form action={deleteDocument}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="text-sm text-red hover:underline">Delete</button>
                      </form>
                    )}
                  </div>
                  {canWrite && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-slate hover:text-ink">Edit details</summary>
                      <form action={updateDocument} className="mt-2 grid gap-2">
                        <input type="hidden" name="id" value={d.id} />
                        <input name="label" defaultValue={d.label} className="h-9 rounded-lintel border border-hairline bg-surface px-2 text-sm" />
                        <select name="doc_type" defaultValue={d.doc_type ?? "other"} className="h-9 rounded-lintel border border-hairline bg-surface px-2 text-sm">
                          {DOC_CATEGORIES.map((cat) => (
                            <optgroup key={cat} label={cat}>
                              {DOC_TYPES.filter((dt) => dt.category === cat).map((dt) => (
                                <option key={dt.key} value={dt.key}>{dt.label}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <input name="issued_at" type="date" defaultValue={(d as any).issued_at ?? ""} className="h-9 flex-1 rounded-lintel border border-hairline bg-surface px-2 text-sm" />
                          <input name="expires_at" type="date" defaultValue={d.expires_at ?? ""} className="h-9 flex-1 rounded-lintel border border-hairline bg-surface px-2 text-sm" />
                        </div>
                        <button type="submit" className="h-9 rounded-lintel bg-evergreen px-3 text-sm font-medium text-paper">Save</button>
                      </form>
                    </details>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {!hasAi() && (
        <p className="mt-6 text-xs text-slate">
          Tip: set ANTHROPIC_API_KEY to generate AI summaries from document details.
        </p>
      )}
    </div>
  );
}
