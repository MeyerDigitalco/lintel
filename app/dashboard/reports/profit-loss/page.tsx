import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { formatMoney } from "@/lib/i18n/currency";
import { resolveRegion } from "@/lib/i18n/rulesets";

export const dynamic = "force-dynamic";

const inputCls = "h-9 rounded-lintel border border-hairline bg-surface px-2 text-sm";

export default async function ProfitLossReport({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const { orgId, country, region, regionCode, currency } = await requireSession();
  const supabase = createClient();
  const ruleset = country === "GB" ? resolveRegion("GB", region) : resolveRegion(country, region, regionCode);
  const money = (n: number) => formatMoney(n, currency, { decimals: true });

  const from = searchParams.from || "";
  const to = searchParams.to || "";

  let q = supabase.from("transactions").select("direction, sa105_category, amount, occurred_on").eq("org_id", orgId);
  if (from) q = q.gte("occurred_on", from);
  if (to) q = q.lte("occurred_on", to);
  const { data: org } = await supabase.from("orgs").select("name").eq("id", orgId).maybeSingle();
  const { data: tx } = await q;

  const income = (tx ?? []).filter((t) => t.direction === "income").reduce((s, t) => s + Number(t.amount), 0);
  const finance = (tx ?? []).filter((t) => t.direction === "expense" && t.sa105_category === "finance_costs").reduce((s, t) => s + Number(t.amount), 0);
  const operating = (tx ?? []).filter((t) => t.direction === "expense" && t.sa105_category !== "finance_costs").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = operating + finance;
  const net = income - expenses;

  // Month-by-month
  const months = new Map<string, { inc: number; exp: number }>();
  for (const t of tx ?? []) {
    const m = String(t.occurred_on).slice(0, 7);
    const row = months.get(m) ?? { inc: 0, exp: 0 };
    if (t.direction === "income") row.inc += Number(t.amount);
    else row.exp += Number(t.amount);
    months.set(m, row);
  }
  const monthRows = [...months.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));

  return (
    <ReportShell title="Profit & loss summary" subtitle={ruleset.taxLabel} orgName={org?.name}>
      <form className="mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <label className="text-xs text-slate">From<br /><input type="date" name="from" defaultValue={from} className={inputCls} /></label>
        <label className="text-xs text-slate">To<br /><input type="date" name="to" defaultValue={to} className={inputCls} /></label>
        <button type="submit" className="h-9 rounded-lintel border border-hairline px-3 text-sm text-ink hover:border-evergreen/50">Apply</button>
        <span className="text-xs text-slate">{from || to ? `${from || "start"} → ${to || "today"}` : "All dates"}</span>
      </form>

      {(tx ?? []).length === 0 ? (
        <p className="text-sm text-slate">No transactions in this period.</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">Total income</td><td className="py-2 text-right tabular-nums text-ink">{money(income)}</td></tr>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">Operating expenses</td><td className="py-2 text-right tabular-nums text-ink">{money(operating)}</td></tr>
              <tr className="border-b border-hairline"><td className="py-2 text-ink">Finance costs{country === "GB" ? " (Section 24)" : ""}</td><td className="py-2 text-right tabular-nums text-ink">{money(finance)}</td></tr>
              <tr className="border-t border-ink/30"><td className="py-2 font-heading text-base font-semibold text-ink">Net {net >= 0 ? "profit" : "loss"}</td><td className="py-2 text-right font-heading text-base font-semibold tabular-nums text-ink">{money(Math.abs(net))}</td></tr>
            </tbody>
          </table>

          <section className="mt-8 break-inside-avoid">
            <h2 className="font-heading text-base font-semibold">Month by month</h2>
            <table className="mt-1 w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase text-slate">
                  <th className="py-1.5">Month</th><th className="py-1.5 text-right">Income</th><th className="py-1.5 text-right">Expenses</th><th className="py-1.5 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {monthRows.map(([m, r]) => (
                  <tr key={m} className="border-b border-hairline last:border-0">
                    <td className="py-1.5 text-ink">{m}</td>
                    <td className="py-1.5 text-right tabular-nums text-ink">{money(r.inc)}</td>
                    <td className="py-1.5 text-right tabular-nums text-ink">{money(r.exp)}</td>
                    <td className="py-1.5 text-right tabular-nums text-ink">{money(r.inc - r.exp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          {country === "GB" && (
            <p className="mt-4 text-xs text-slate">Under Section 24, finance costs are not deducted from profit but relieved as a 20% basic-rate tax reducer.</p>
          )}
        </>
      )}
    </ReportShell>
  );
}
