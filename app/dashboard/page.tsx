import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { formatMoney } from "@/lib/i18n/currency";
import { fmtDate, daysUntil, quarterlyPeriods, taxYearStartFor } from "@/lib/dates";
import { mtdMandation } from "@/lib/calculators";
import { cn } from "@/lib/cn";
import { getLang } from "@/lib/i18n/lang";
import { translate } from "@/lib/i18n/dictionaries";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const { orgId, currency, country } = await requireSession();
  const lang = getLang(country);
  const t = (k: string) => translate(lang, k);
  const gbp = (n: number) => formatMoney(n, currency);
  const supabase = createClient();

  const [
    { count: propertyCount },
    { data: tx },
    { data: rent },
    { data: compliance },
    { count: tenancyCount },
    { count: docCount },
    { data: openTasks },
  ] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("transactions").select("direction, amount, sa105_category, occurred_on").eq("org_id", orgId),
    supabase.from("rent_ledger").select("status, amount_due, due_on").eq("org_id", orgId),
    supabase.from("compliance_items").select("label, expires_at").eq("org_id", orgId),
    supabase.from("tenancies").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("property_documents").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    supabase.from("tasks").select("id, title, due_on, status").eq("org_id", orgId).eq("status", "open").order("due_on", { ascending: true }).limit(5),
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

  const steps = [
    { label: t("dash.step_property"), done: (propertyCount ?? 0) > 0, href: "/dashboard/properties" },
    { label: t("dash.step_tenancy"), done: (tenancyCount ?? 0) > 0, href: "/dashboard/properties" },
    { label: t("dash.step_compliance"), done: (compliance ?? []).length > 0, href: "/dashboard/compliance" },
    { label: t("dash.step_documents"), done: (docCount ?? 0) > 0, href: "/dashboard/documents" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div>
      <PageHeader title={t("dash.title")} subtitle={`Tax year ${yStart}/${(yStart + 1) % 100}`} />

      {pct < 100 && (
        <Card className="mb-6 border-evergreen/30">
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">{t("dash.getting_started")}</h2>
              <Badge tone="mint">{pct}% complete</Badge>
            </div>
            <p className="mt-1 text-sm text-slate">
              A few minutes now saves hours later — finish setting up your portfolio.
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-hairline">
              <div className="h-2 rounded-full bg-evergreen transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {steps.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="flex items-center gap-2 rounded-lintel border border-hairline px-3 py-2 text-sm transition-colors hover:border-evergreen/40"
                >
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold", s.done ? "bg-evergreen text-paper" : "border border-hairline text-slate")}>
                    {s.done ? "✓" : ""}
                  </span>
                  <span className={s.done ? "text-slate line-through" : "text-ink"}>{s.label}</span>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("dash.stat_properties")} value={String(propertyCount ?? 0)} />
        <Stat label={t("dash.stat_income")} value={gbp(income)} tone="evergreen" />
        <Stat label={t("dash.stat_expenses")} value={gbp(expenses)} />
        <Stat label={t("dash.stat_arrears")} value={gbp(arrearsTotal)} tone={arrearsTotal > 0 ? "red" : "default"} hint={`${arrears.length} overdue`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">MTD for Income Tax</h2>
              <Badge tone={mtd.mandated ? "amber" : "mint"}>{mtd.mandated ? `From ${mtd.from}` : "Not yet mandated"}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate">
              Based on {gbp(income)} property income this year.{" "}
              {mtd.mandated ? `You fall in the ${gbp(mtd.band!)} threshold band.` : "Below the £20,000 band — keep records ready."}
            </p>
            <Link href="/dashboard/tax" className="mt-4 inline-block text-sm text-evergreen hover:underline">View tax & MTD →</Link>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Compliance due soon</h2>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-slate">Nothing due in the next 60 days.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {upcoming.slice(0, 5).map((c, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{c.label}</span>
                    <Badge tone={(c.days ?? 0) <= 7 ? "red" : "amber"}>{c.days! < 0 ? "Overdue" : `${c.days}d · ${fmtDate(c.expires_at)}`}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/compliance" className="mt-4 inline-block text-sm text-evergreen hover:underline">Open compliance vault →</Link>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">{t("dash.tasks")}</h2>
              <Link href="/dashboard/tasks" className="text-sm text-evergreen hover:underline">Open tasks →</Link>
            </div>
            {!openTasks || openTasks.length === 0 ? (
              <p className="mt-3 text-sm text-slate">No open tasks. Add reminders and to-dos to stay on top of your portfolio.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {openTasks.map((t: any) => {
                  const d = daysUntil(t.due_on);
                  return (
                    <li key={t.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{t.title}</span>
                      {t.due_on && (
                        <Badge tone={d !== null && d < 0 ? "red" : d !== null && d <= 7 ? "amber" : "default"}>
                          {d !== null && d < 0 ? "Overdue" : `due ${fmtDate(t.due_on)}`}
                        </Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
