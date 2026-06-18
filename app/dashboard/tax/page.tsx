import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/i18n/currency";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { quarterlyPeriods, taxYearStartFor } from "@/lib/dates";
import { mtdMandation, calcSection24Reducer } from "@/lib/calculators";

export const dynamic = "force-dynamic";

export default async function TaxPage() {
  const { orgId, currency, country, region } = await requireSession();
  const ruleset = resolveRegion(country, region);
  const isUK = country === "GB";
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const yStart = taxYearStartFor();
  const periods = quarterlyPeriods(yStart);

  const { data: tx } = await supabase
    .from("transactions")
    .select("direction, amount, sa105_category, occurred_on")
    .eq("org_id", orgId)
    .gte("occurred_on", periods[0].startDate)
    .lte("occurred_on", periods[3].endDate);

  const rows = tx ?? [];
  const summarise = (start: string, end: string) => {
    let income = 0, expenses = 0, finance = 0;
    for (const t of rows) {
      if (t.occurred_on < start || t.occurred_on > end) continue;
      const a = Number(t.amount);
      if (t.direction === "income") income += a;
      else if (t.sa105_category === "finance_costs") finance += a;
      else expenses += a;
    }
    return { income, expenses, finance, net: income - expenses };
  };

  const quarters = periods.map((p) => ({ ...p, ...summarise(p.startDate, p.endDate) }));
  const yearIncome = quarters.reduce((s, q) => s + q.income, 0);
  const yearExpenses = quarters.reduce((s, q) => s + q.expenses, 0);
  const yearFinance = quarters.reduce((s, q) => s + q.finance, 0);
  const netProfit = yearIncome - yearExpenses;
  const s24 = calcSection24Reducer(yearFinance);
  const mtd = mtdMandation(yearIncome);

  return (
    <div>
      <PageHeader
        title={isUK ? "Tax & MTD" : "Tax & records"}
        subtitle={isUK ? `Tax year ${yStart}/${(yStart + 1) % 100} · quarters end 5 Jul, 5 Oct, 5 Jan, 5 Apr` : `${ruleset.taxLabel} · records export-ready for your accountant`}
        action={
          <div className="flex gap-2">
            <a href={`/api/export/csv?year=${yStart}`}>
              <Button variant="outline" size="sm">Export CSV</Button>
            </a>
            <Link href="/dashboard/accountant">
              <Button size="sm">Accountant pack</Button>
            </Link>
          </div>
        }
      />

      <Card className="mb-6 border-evergreen/30">
        <CardBody>
          {isUK ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold tracking-tight">
                    Making Tax Digital for Income Tax
                  </h2>
                  <p className="mt-1 text-sm text-slate">
                    Qualifying property income {gbp(yearIncome)}.{" "}
                    {mtd.mandated
                      ? `You fall in the ${gbp(mtd.band!)} band — MTD applies from ${mtd.from}.`
                      : "Below the £20,000 band; keep digital records ready."}
                  </p>
                </div>
                <Badge tone={mtd.mandated ? "amber" : "mint"}>
                  {mtd.mandated ? `From ${mtd.from}` : "Not yet mandated"}
                </Badge>
              </div>
              <p className="mt-3 rounded-lintel bg-paper px-3 py-2 text-xs text-slate">
                Lintel keeps HMRC-shaped quarterly summaries and a full SA105 breakdown
                ready for your accountant to review, adjust and file on your behalf.
              </p>
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-semibold tracking-tight">{ruleset.taxLabel}</h2>
                <p className="mt-1 text-sm text-slate">
                  Property income {gbp(yearIncome)} this year. Lintel keeps your income and
                  expenses organised and export-ready for {ruleset.taxLabel}.
                </p>
              </div>
              <Badge tone="mint">{ruleset.countryName}</Badge>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Income" value={gbp(yearIncome)} tone="evergreen" />
        <Stat label="Expenses" value={gbp(yearExpenses)} />
        <Stat label="Net profit" value={gbp(netProfit)} />
        <Stat label="S24 reducer" value={gbp(s24)} hint={`on ${gbp(yearFinance)} finance costs`} />
      </div>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                <th className="px-4 py-3 font-medium">Quarter</th>
                <th className="px-4 py-3 text-right font-medium">Income</th>
                <th className="px-4 py-3 text-right font-medium">Expenses</th>
                <th className="px-4 py-3 text-right font-medium">Finance</th>
                <th className="px-4 py-3 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {quarters.map((q, i) => (
                <tr key={q.key} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 text-ink">
                    Q{i + 1}
                    <span className="ml-2 text-xs text-slate">ends {q.endDate}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-evergreen">{gbp(q.income)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{gbp(q.expenses)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-slate">{gbp(q.finance)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{gbp(q.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <p className="mt-4 text-xs text-slate">
        Indicative and not tax advice. Section 24 means finance costs are not
        deducted from profit; instead they give a 20% basic-rate tax reducer
        ({gbp(s24)} this year).
      </p>
    </div>
  );
}
