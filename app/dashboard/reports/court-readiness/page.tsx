import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { tenancyReadiness } from "@/lib/court-readiness-server";

export const dynamic = "force-dynamic";

const ragLabel = { green: "Strong", amber: "Needs attention", red: "At risk" } as const;
const statusWord = { ok: "OK", warning: "Check", fail: "Missing", na: "N/A" } as const;

export default async function CourtReadinessReport() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const [{ data: org }, { data: tenancies }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("tenancies").select("id, properties(label)").eq("org_id", orgId).order("created_at", { ascending: false }),
  ]);

  const scored = await Promise.all(
    (tenancies ?? []).map(async (t: any) => ({
      label: t.properties?.label ?? "Tenancy",
      result: await tenancyReadiness(orgId, t.id),
    }))
  );

  return (
    <ReportShell title="Court-readiness assessment" orgName={org?.name}>
      {scored.filter((s) => s.result).length === 0 ? (
        <p className="text-sm text-slate">No tenancies recorded.</p>
      ) : (
        scored.map((s, idx) => {
          if (!s.result) return null;
          return (
            <section key={idx} className="mb-6 break-inside-avoid">
              <div className="flex items-baseline justify-between">
                <h2 className="font-heading text-base font-semibold">{s.label}</h2>
                <span className="text-sm">
                  <strong className="tabular-nums">{s.result.score}</strong>/100 · {ragLabel[s.result.rag]}
                </span>
              </div>
              <table className="mt-2 w-full text-sm">
                <tbody>
                  {s.result.checks.map((c) => (
                    <tr key={c.key} className="border-b border-hairline last:border-0">
                      <td className="py-1.5 text-ink">{c.label}</td>
                      <td className="py-1.5 w-20 text-slate">{statusWord[c.status]}</td>
                      <td className="py-1.5 text-xs text-slate">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })
      )}
      <p className="mt-4 text-xs text-slate">
        Scored on deposit protection timing, prescribed documents served,
        certificate validity, landlord registration and (England) Right to Rent.
        Indicator only — confirm with a solicitor before relying on a tenancy in
        possession proceedings.
      </p>
    </ReportShell>
  );
}
