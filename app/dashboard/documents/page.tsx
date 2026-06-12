import Link from "next/link";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { summarizeDocument } from "./actions";
import { hasAi } from "@/lib/ai";
import { fmtDate } from "@/lib/dates";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; types?: string[] }[] = [
  { key: "all", label: "All" },
  { key: "lease", label: "Leases", types: ["tenancy_agreement"] },
  { key: "certificate", label: "Certificates", types: ["epc", "gas_safety", "eicr"] },
  { key: "deposit", label: "Deposit", types: ["deposit_cert"] },
  { key: "inventory", label: "Inventory", types: ["inventory"] },
  { key: "esign", label: "E-signatures", types: ["e_signature"] },
  { key: "correspondence", label: "Correspondence", types: ["correspondence"] },
  { key: "other", label: "Other", types: ["other"] },
];

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const { orgId, role } = await requireSession();
  const canWrite = isWriterRole(role);
  const supabase = createClient();

  const { data: docs } = await supabase
    .from("property_documents")
    .select("id, label, doc_type, ai_summary, storage_path, expires_at, created_at, properties(label)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const active = searchParams.filter ?? "all";
  const activeTypes = FILTERS.find((f) => f.key === active)?.types;
  const filtered = (docs ?? []).filter((d) => !activeTypes || activeTypes.includes(d.doc_type ?? "other"));

  const withUrls = await Promise.all(
    filtered.map(async (d) => {
      const { data } = await supabase.storage.from("property-docs").createSignedUrl(d.storage_path, 600);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Every document across your portfolio, searchable and summarised."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/dashboard/documents?filter=${f.key}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              active === f.key
                ? "border-evergreen bg-evergreen/8 text-evergreen"
                : "border-hairline text-slate hover:text-ink"
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {withUrls.length === 0 ? (
        <EmptyState
          title="No documents"
          body="Upload documents on each property (EPC, certificates, deposit, inventory, correspondence) to see them here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withUrls.map((d) => (
            <Card key={d.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-ink">{d.label}</span>
                  {d.doc_type && <Badge>{d.doc_type.replace(/_/g, " ")}</Badge>}
                </div>
                <p className="mt-0.5 text-xs text-slate">
                  {(d as any).properties?.label} · {fmtDate(d.created_at)}
                  {d.expires_at && ` · expires ${fmtDate(d.expires_at)}`}
                </p>
                {d.ai_summary && (
                  <p className="mt-2 rounded-lintel bg-paper px-2 py-1.5 text-xs text-slate">
                    ✨ {d.ai_summary}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3">
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-evergreen hover:underline">
                      Download
                    </a>
                  )}
                  {canWrite && !d.ai_summary && (
                    <form action={summarizeDocument}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" className="text-sm text-slate hover:text-ink">
                        Summarise
                      </button>
                    </form>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {!hasAi() && (
        <p className="mt-6 text-xs text-slate">
          Tip: set ANTHROPIC_API_KEY to generate AI summaries from document
          details. Without it, &quot;Summarise&quot; writes a basic description.
        </p>
      )}
    </div>
  );
}
