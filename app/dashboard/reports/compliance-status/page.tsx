import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ComplianceStatusReport() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const [{ data: org }, { data: properties }, { data: items }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("properties").select("id, label").eq("org_id", orgId),
    supabase.from("compliance_items").select("property_id, label, statutory_basis, expires_at").eq("org_id", orgId),
  ]);

  const byProp = new Map<string, any[]>();
  for (const i of items ?? []) {
    const arr = byProp.get(i.property_id) ?? [];
    arr.push(i);
    byProp.set(i.property_id, arr);
  }

  const statusOf = (expires: string | null) => {
    if (!expires) return "No expiry";
    const d = daysUntil(expires) ?? -1;
    if (d < 0) return "Expired";
    if (d <= 30) return "Due soon";
    return "Valid";
  };

  return (
    <ReportShell title="Compliance status" orgName={org?.name}>
      {(properties ?? []).length === 0 ? (
        <p className="text-sm text-slate">No properties recorded.</p>
      ) : (
        (properties ?? []).map((p) => {
          const its = byProp.get(p.id) ?? [];
          return (
            <section key={p.id} className="mb-6 break-inside-avoid">
              <h2 className="font-heading text-base font-semibold">{p.label}</h2>
              {its.length === 0 ? (
                <p className="text-sm text-slate">No compliance items recorded.</p>
              ) : (
                <table className="mt-1 w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-left text-xs uppercase text-slate">
                      <th className="py-1.5">Item</th>
                      <th className="py-1.5">Expires</th>
                      <th className="py-1.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {its.map((i, idx) => (
                      <tr key={idx} className="border-b border-hairline last:border-0">
                        <td className="py-1.5">
                          <div className="text-ink">{i.label}</div>
                          {i.statutory_basis && <div className="text-xs text-slate">{i.statutory_basis}</div>}
                        </td>
                        <td className="py-1.5 text-slate">{fmtDate(i.expires_at)}</td>
                        <td className="py-1.5">{statusOf(i.expires_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })
      )}
    </ReportShell>
  );
}
