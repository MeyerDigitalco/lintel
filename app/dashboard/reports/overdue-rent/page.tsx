import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { formatMoney } from "@/lib/i18n/currency";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function OverdueRentReport() {
  const { orgId, currency} = await requireSession();
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const [{ data: org }, { data: tenancies }, { data: ledger }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("tenancies").select("id, rent_amount, properties(label)").eq("org_id", orgId),
    supabase.from("rent_ledger").select("tenancy_id, period, due_on, amount_due, status").eq("org_id", orgId).neq("status", "confirmed"),
  ]);

  const propFor = new Map((tenancies ?? []).map((t: any) => [t.id, { label: t.properties?.label ?? "Property", rent: Number(t.rent_amount ?? 0) }]));
  const overdue = (ledger ?? [])
    .map((r) => ({ ...r, days: daysUntil(r.due_on) ?? 0 }))
    .filter((r) => r.days < 0)
    .sort((a, b) => a.days - b.days);

  const byTenancy = new Map<string, any[]>();
  for (const r of overdue) {
    const arr = byTenancy.get(r.tenancy_id) ?? [];
    arr.push(r);
    byTenancy.set(r.tenancy_id, arr);
  }

  const grandTotal = overdue.reduce((s, r) => s + Number(r.amount_due), 0);

  return (
    <ReportShell title="Overdue rent, arrears schedule" subtitle="Section 8-ready" orgName={org?.name}>
      {overdue.length === 0 ? (
        <p className="text-sm text-slate">No rent is currently in arrears.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink">
            Total arrears across the portfolio: <strong className="tabular-nums">{gbp(grandTotal, { decimals: true })}</strong>.
            The schedule below evidences each unpaid period and may support a
            Section 8 claim (Grounds 8/10/11). Confirm the current prescribed Form
            3A and take legal advice before serving.
          </p>
          {Array.from(byTenancy.entries()).map(([tid, rows]) => {
            const info = propFor.get(tid)!;
            const total = rows.reduce((s, r) => s + Number(r.amount_due), 0);
            const months = info.rent ? (total / info.rent).toFixed(1) : "-";
            return (
              <section key={tid} className="mb-6">
                <h2 className="font-heading text-base font-semibold">{info.label}</h2>
                <p className="mb-2 text-xs text-slate">
                  Monthly rent {gbp(info.rent, { decimals: true })} · arrears equivalent ≈ {months} months
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline text-left text-xs uppercase text-slate">
                      <th className="py-1.5">Period</th>
                      <th className="py-1.5">Due</th>
                      <th className="py-1.5">Days overdue</th>
                      <th className="py-1.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-b border-hairline last:border-0">
                        <td className="py-1.5">{r.period}</td>
                        <td className="py-1.5 text-slate">{fmtDate(r.due_on)}</td>
                        <td className="py-1.5">{Math.abs(r.days)}</td>
                        <td className="py-1.5 text-right tabular-nums">{gbp(Number(r.amount_due), { decimals: true })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-medium">
                      <td className="py-1.5" colSpan={3}>Subtotal</td>
                      <td className="py-1.5 text-right tabular-nums">{gbp(total, { decimals: true })}</td>
                    </tr>
                  </tfoot>
                </table>
              </section>
            );
          })}
        </>
      )}
    </ReportShell>
  );
}
