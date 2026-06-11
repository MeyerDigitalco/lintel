import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HmrcPanel } from "@/components/app/tax/HmrcPanel";
import { gbp } from "@/lib/format";
import { quarterlyPeriods, taxYearStartFor } from "@/lib/dates";
import { mtdMandation, calcSection24Reducer } from "@/lib/calculators";
import { getMtdProvider } from "@/lib/mtd/select";
import { MTD_PROVIDER } from "@/lib/mtd/hmrc/config";
import { hmrcConnectionStatus } from "@/lib/mtd/hmrc/connection";

export const dynamic = "force-dynamic";

export default async function TaxPage() {
  const { orgId } = await requireSession();
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

  const provider = getMtdProvider();
  const showHmrc = MTD_PROVIDER === "hmrc";
  const hmrc = showHmrc ? await hmrcConnectionStatus(orgId) : null;

  return (
    <div>
      <PageHeader
        title="Tax & MTD"
        subtitle={`Tax year ${yStart}/${(yStart + 1) % 100} · quarters end 5 Jul, 5 Oct, 5 Jan, 5 Apr`}
        action={
          <div className="flex gap-2">
            <a href={`/api/export/csv?year=${yStart}`}>
              <Button variant="outline" size="sm">Export CSV</Button>
            </a>
            <Link href="/dashboard/tax/pack">
              <Button size="sm">Tax pack (print)</Button>
            </Link>
          </div>
        }
      />

      <Card className="mb-6 border-evergreen/30">
        <CardBody>
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
            Lintel keeps HMRC-shaped quarterly summaries now.{" "}
            {provider.canSubmit()
              ? "Submission to HMRC is enabled."
              : "Filing to HMRC is not yet available — it switches on once Lintel is HMRC-recognised."}
          </p>
        </CardBody>
      </Card>

      {showHmrc && hmrc && (
        <HmrcPanel
          connected={hmrc.connected}
          recognised={provider.canSubmit()}
          maskedNino={hmrc.maskedNino}
          businessId={hmrc.businessId}
          periods={periods}
        />
      )}

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
        Final-declaration preview is indicative and not tax advice. Section 24
        means finance costs are not deducted from profit; instead they give a 20%
        basic-rate tax reducer ({gbp(s24)} this year).
      </p>
    </div>
  );
}
