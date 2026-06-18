import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "@/components/app/PrintButton";
import { categoryLabel, SA105_CATEGORIES } from "@/lib/sa105";
import { formatMoney } from "@/lib/i18n/currency";
import { quarterlyPeriods, taxYearStartFor, fmtDate } from "@/lib/dates";
import { calcSection24Reducer } from "@/lib/calculators";

export const dynamic = "force-dynamic";

export default async function TaxPackPage() {
  const { orgId, currency} = await requireSession();
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const yStart = taxYearStartFor();
  const periods = quarterlyPeriods(yStart);

  const [{ data: org }, { data: tx }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase
      .from("transactions")
      .select("direction, amount, sa105_category, occurred_on, description")
      .eq("org_id", orgId)
      .gte("occurred_on", periods[0].startDate)
      .lte("occurred_on", periods[3].endDate),
  ]);

  const rows = tx ?? [];
  // Category totals
  const byCategory = new Map<string, number>();
  let income = 0,
    expenses = 0,
    finance = 0;
  for (const t of rows) {
    const a = Number(t.amount);
    byCategory.set(t.sa105_category ?? "uncategorised", (byCategory.get(t.sa105_category ?? "uncategorised") ?? 0) + a);
    if (t.direction === "income") income += a;
    else if (t.sa105_category === "finance_costs") finance += a;
    else expenses += a;
  }
  const s24 = calcSection24Reducer(finance);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/dashboard/tax" className="text-sm text-slate hover:text-ink">
          ← Tax & MTD
        </Link>
        <PrintButton />
      </div>

      <div className="rounded-lintel border border-hairline bg-surface p-8 print:border-0 print:p-0">
        <header className="mb-6 border-b border-hairline pb-4">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-ink">
            Tax pack — {org?.name}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Tax year {yStart}/{(yStart + 1) % 100} · prepared {fmtDate(new Date())} · by Lintel
          </p>
        </header>

        <section className="mb-6">
          <h2 className="mb-2 font-heading text-base font-semibold">Summary</h2>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate">Total income</dt>
            <dd className="text-right tabular-nums">{gbp(income, { decimals: true })}</dd>
            <dt className="text-slate">Total allowable expenses</dt>
            <dd className="text-right tabular-nums">{gbp(expenses, { decimals: true })}</dd>
            <dt className="text-slate">Net profit (before finance)</dt>
            <dd className="text-right tabular-nums font-medium">{gbp(income - expenses, { decimals: true })}</dd>
            <dt className="text-slate">Finance costs (Section 24)</dt>
            <dd className="text-right tabular-nums">{gbp(finance, { decimals: true })}</dd>
            <dt className="text-slate">Basic-rate tax reducer (20%)</dt>
            <dd className="text-right tabular-nums">{gbp(s24, { decimals: true })}</dd>
          </dl>
        </section>

        <section className="mb-6">
          <h2 className="mb-2 font-heading text-base font-semibold">By SA105 category</h2>
          <table className="w-full text-sm">
            <tbody>
              {SA105_CATEGORIES.filter((c) => byCategory.has(c.key)).map((c) => (
                <tr key={c.key} className="border-b border-hairline last:border-0">
                  <td className="py-1.5 text-slate">{c.label}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {gbp(byCategory.get(c.key) ?? 0, { decimals: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 font-heading text-base font-semibold">Quarterly summaries</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase text-slate">
                <th className="py-1.5">Quarter</th>
                <th className="py-1.5 text-right">Income</th>
                <th className="py-1.5 text-right">Expenses</th>
                <th className="py-1.5 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p, i) => {
                let qi = 0,
                  qe = 0;
                for (const t of rows) {
                  if (t.occurred_on < p.startDate || t.occurred_on > p.endDate) continue;
                  const a = Number(t.amount);
                  if (t.direction === "income") qi += a;
                  else if (t.sa105_category !== "finance_costs") qe += a;
                }
                return (
                  <tr key={p.key} className="border-b border-hairline last:border-0">
                    <td className="py-1.5">Q{i + 1} (ends {p.endDate})</td>
                    <td className="py-1.5 text-right tabular-nums">{gbp(qi, { decimals: true })}</td>
                    <td className="py-1.5 text-right tabular-nums">{gbp(qe, { decimals: true })}</td>
                    <td className="py-1.5 text-right tabular-nums">{gbp(qi - qe, { decimals: true })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <footer className="mt-8 border-t border-hairline pt-4 text-xs text-slate">
          Prepared by Lintel from your records. Indicative only — not tax advice,
          and not an HMRC submission. Please review with your accountant.
        </footer>
      </div>
    </div>
  );
}
