import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { formatMoney } from "@/lib/i18n/currency";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { categoryLabel, SA105_CATEGORIES } from "@/lib/sa105";

export const dynamic = "force-dynamic";

const inputCls = "h-9 rounded-lintel border border-hairline bg-surface px-2 text-sm";

export default async function IncomeExpenseReport({
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

  const sum = (dir: string, key: string) =>
    (tx ?? []).filter((t) => t.direction === dir && (t.sa105_category ?? "uncategorised") === key).reduce((s, t) => s + Number(t.amount), 0);

  const incomeCats = SA105_CATEGORIES.filter((c) => c.direction === "income");
  const expenseCats = SA105_CATEGORIES.filter((c) => c.direction === "expense");
  const incomeTotal = (tx ?? []).filter((t) => t.direction === "income").reduce((s, t) => s + Number(t.amount), 0);
  const expenseTotal = (tx ?? []).filter((t) => t.direction === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const net = incomeTotal - expenseTotal;

  const Section = ({ title, cats, dir, total }: { title: string; cats: typeof SA105_CATEGORIES; dir: string; total: number }) => (
    <section className="mb-6 break-inside-avoid">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <table className="mt-1 w-full text-sm">
        <tbody>
          {cats.map((c) => {
            const v = sum(dir, c.key);
            if (v === 0) return null;
            return (
              <tr key={c.key} className="border-b border-hairline last:border-0">
                <td className="py-1.5 text-ink">{c.label}{c.financeCost && country === "GB" ? " (Section 24)" : ""}</td>
                <td className="py-1.5 text-right tabular-nums text-ink">{money(v)}</td>
              </tr>
            );
          })}
          <tr className="border-t border-ink/20">
            <td className="py-1.5 font-semibold text-ink">Total {title.toLowerCase()}</td>
            <td className="py-1.5 text-right font-semibold tabular-nums text-ink">{money(total)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );

  return (
    <ReportShell title="Income & expense statement" subtitle={ruleset.taxLabel} orgName={org?.name}>
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
          <Section title="Income" cats={incomeCats} dir="income" total={incomeTotal} />
          <Section title="Expenses" cats={expenseCats} dir="expense" total={expenseTotal} />
          <section className="mt-2 border-t border-ink/30 pt-3">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1.5 font-heading text-base font-semibold text-ink">Net {net >= 0 ? "profit" : "loss"}</td>
                  <td className="py-1.5 text-right font-heading text-base font-semibold tabular-nums text-ink">{money(Math.abs(net))}</td>
                </tr>
              </tbody>
            </table>
          </section>
          {country === "GB" && (
            <p className="mt-4 text-xs text-slate">Finance costs are shown separately because under Section 24 they are relieved as a 20% basic-rate tax reducer, not deducted from profit.</p>
          )}
        </>
      )}
    </ReportShell>
  );
}
