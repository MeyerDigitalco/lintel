import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { gbp } from "@/lib/format";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RentLedgerReport() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const [{ data: org }, { data: tenancies }, { data: ledger }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("tenancies").select("id, rent_amount, properties(label)").eq("org_id", orgId),
    supabase.from("rent_ledger").select("tenancy_id, period, due_on, amount_due, status, confirmed_at").eq("org_id", orgId).order("due_on", { ascending: true }),
  ]);

  const byTenancy = new Map<string, any[]>();
  for (const r of ledger ?? []) {
    const arr = byTenancy.get(r.tenancy_id) ?? [];
    arr.push(r);
    byTenancy.set(r.tenancy_id, arr);
  }

  return (
    <ReportShell title="Rent ledger" orgName={org?.name}>
      {(tenancies ?? []).length === 0 ? (
        <p className="text-sm text-slate">No tenancies recorded.</p>
      ) : (
        (tenancies ?? []).map((t: any) => {
          const rows = byTenancy.get(t.id) ?? [];
          const charged = rows.reduce((s, r) => s + Number(r.amount_due), 0);
          const received = rows.filter((r) => r.status === "confirmed").reduce((s, r) => s + Number(r.amount_due), 0);
          return (
            <section key={t.id} className="mb-6">
              <h2 className="font-heading text-base font-semibold">{t.properties?.label ?? "Property"}</h2>
              <p className="mb-2 text-xs text-slate">{gbp(Number(t.rent_amount ?? 0), { decimals: true })}/mo</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left text-xs uppercase text-slate">
                    <th className="py-1.5">Period</th>
                    <th className="py-1.5">Due</th>
                    <th className="py-1.5 text-right">Charged</th>
                    <th className="py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-hairline last:border-0">
                      <td className="py-1.5">{r.period}</td>
                      <td className="py-1.5 text-slate">{fmtDate(r.due_on)}</td>
                      <td className="py-1.5 text-right tabular-nums">{gbp(Number(r.amount_due), { decimals: true })}</td>
                      <td className="py-1.5 capitalize">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-medium">
                    <td className="py-1.5" colSpan={2}>Totals</td>
                    <td className="py-1.5 text-right tabular-nums">{gbp(charged, { decimals: true })}</td>
                    <td className="py-1.5 text-xs text-slate">received {gbp(received, { decimals: true })}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          );
        })
      )}
    </ReportShell>
  );
}
