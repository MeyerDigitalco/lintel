import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { tenancyReadiness } from "@/lib/court-readiness-server";

export const dynamic = "force-dynamic";

const ragTone = { green: "mint", amber: "amber", red: "red" } as const;
const ragLabel = { green: "Strong", amber: "Needs attention", red: "At risk" } as const;

export default async function CourtReadinessPage() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("id, property_id, properties(label)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const scored = await Promise.all(
    (tenancies ?? []).map(async (t) => ({
      id: t.id,
      label: (t as any).properties?.label ?? "Tenancy",
      result: await tenancyReadiness(orgId, t.id),
    }))
  );

  const withScores = scored.filter((s) => s.result);
  const avg =
    withScores.length > 0
      ? Math.round(withScores.reduce((s, x) => s + (x.result!.score || 0), 0) / withScores.length)
      : 0;
  const atRisk = withScores.filter((s) => s.result!.rag === "red").length;
  const needsAttention = withScores.filter((s) => s.result!.rag === "amber").length;

  return (
    <div>
      <PageHeader
        title="Court-readiness"
        subtitle="Would each tenancy stand up if you needed to rely on it? Fix what's flagged before it matters."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Average score" value={`${avg}`} tone={avg >= 85 ? "evergreen" : avg >= 60 ? "amber" : "red"} hint="across tenancies" />
        <Stat label="Needs attention" value={String(needsAttention)} tone={needsAttention ? "amber" : "default"} />
        <Stat label="At risk" value={String(atRisk)} tone={atRisk ? "red" : "default"} />
      </div>

      {withScores.length === 0 ? (
        <EmptyState
          title="No tenancies yet"
          body="Create a tenancy (in the rent ledger) to see its court-readiness score here."
        />
      ) : (
        <div className="space-y-3">
          {scored.map((s) => {
            if (!s.result) return null;
            const top = s.result.checks.filter((c) => c.status === "fail" || c.status === "warning").slice(0, 3);
            return (
              <Link key={s.id} href={`/dashboard/tenancies/${s.id}`}>
                <Card className="transition-colors hover:border-evergreen/40">
                  <CardBody className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{s.label}</p>
                      <p className="mt-0.5 truncate text-xs text-slate">
                        {top.length === 0 ? "All checks passing." : `Address: ${top.map((c) => c.label).join(", ")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={ragTone[s.result.rag]}>{ragLabel[s.result.rag]}</Badge>
                      <span
                        className={`font-heading text-2xl font-semibold tabular-nums ${
                          s.result.rag === "green" ? "text-evergreen" : s.result.rag === "amber" ? "text-amber" : "text-red"
                        }`}
                      >
                        {s.result.score}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-slate">
        Indicator only, not legal advice. Based on deposit protection, prescribed
        documents, certificates, registration and (England) Right to Rent.
      </p>
    </div>
  );
}
