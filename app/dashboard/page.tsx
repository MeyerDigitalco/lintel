import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { gbp } from "@/lib/format";
import { fmtDate, daysUntil, quarterlyPeriods, taxYearStartFor } from "@/lib/dates";
import { mtdMandation } from "@/lib/calculators";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const [{ count: propertyCount }, { data: tx }, { data: rent }, { data: compliance }] =
    await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase.from("transactions").select("direction, amount, sa105_category, occurred_on").eq("org_id", orgId),
      supabase.from("rent_ledger").select("status, amount_due, due_on").eq("org_id", orgId),
      supabase.from("compliance_items").select("label, expires_at").eq("org_id", orgId),
    ]);

  const yStart = taxYearStartFor();
  const periods = quarterlyPeriods(yStart);
  const inYear = (d: string) => d >= periods[0].startDate && d <= periods[3].endDate;

  let income = 0;
  let expenses = 0;
  for (const t of tx ?? []) {
    if (!inYear(t.occurred_on)) continue;
    if (t.direction === "income") income += Number(t.amount);
    else if (t.sa105_category !== "finance_costs") expenses += Number(t.amount);
  }

  const arrears = (rent ?? []).filter((r) => r.status === "overdue");
  const arrearsTotal = arrears.reduce((s, r) => s + Number(r.amount_due), 0);

  const upcoming = (compliance ?? [])
    .map((c) => ({ ...c, days: daysUntil(c.expires_at) }))
    .filter((c) => c.days !== null && c.days <= 60)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

  const mtd = mtdMandation(income);

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle={`Tax year ${yStart}/${(yStart + 1) % 100}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Properties" value={String(propertyCount ?? 0)} />
        <Stat label="Income (year)" value={gbp(income)} tone="evergreen" />
        <Stat label="Expenses (year)" value={gbp(expenses)} />
        <Stat
          label="Arrears"
          value={gbp(arrearsTotal)}
          tone={arrearsTotal > 0 ? "red" : "default"}
          hint={`${arrears.length} overdue`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">
                MTD for Income Tax
              </h2>
              <Badge tone={mtd.mandated ? "amber" : "mint"}>
                {mtd.mandated ? `From ${mtd.from}` : "Not yet mandated"}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-slate">
              Based on {gbp(income)} property income this year.{" "}
              {mtd.mandated
                ? `You fall in the ${gbp(mtd.band!)} threshold band.`
                : "Below the £20,000 band — keep records ready."}
            </p>
            <Link
              href="/dashboard/tax"
              className="mt-4 inline-block text-sm text-evergreen hover:underline"
            >
              View tax & MTD →
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Compliance due soon
            </h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-slate">Nothing due in the next 60 days.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.slice(0, 5).map((c, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{c.label}</span>
                    <Badge tone={(c.days ?? 0) <= 7 ? "red" : "amber"}>
                      {c.days! < 0 ? "Overdue" : `${c.days}d · ${fmtDate(c.expires_at)}`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/dashboard/compliance"
              className="mt-4 inline-block text-sm text-evergreen hover:underline"
            >
              Open compliance vault →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
