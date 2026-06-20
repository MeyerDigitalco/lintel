import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const REPORTS: {
  slug?: string;
  title: string;
  body: string;
  group: string;
  soon?: boolean;
}[] = [
  { slug: "rent-ledger", title: "Rent ledger", body: "Complete history of rent charges and payments per property.", group: "Rent" },
  { slug: "overdue-rent", title: "Overdue rent payments", body: "Outstanding tenant balances and arrears. Section 8-ready PDF.", group: "Rent" },
  { slug: "fault-transcript", title: "Fault transcript", body: "Court-ready timestamped fault chronology, per maintenance fault.", group: "Evidence" },
  { slug: "compliance-status", title: "Compliance status", body: "Per-property Gas Safety, EICR, EPC, insurance status.", group: "Compliance" },
  { slug: "court-readiness", title: "Court-readiness assessment", body: "Per-tenancy readiness score with the exact items to fix.", group: "Evidence" },
  { slug: "tenancy-journey", title: "Tenancy journey", body: "Every event for a tenancy — setup, notices, rent, maintenance.", group: "Evidence" },
  { slug: "income-expense", title: "Income & expense statement", body: "Breakdown of income and expenses by category over a period.", group: "Accounting" },
  { slug: "profit-loss", title: "P&L summary", body: "Profit and loss totals with a month-by-month view.", group: "Accounting" },
  { slug: "supplier-expenses", title: "Supplier expenses", body: "Expenses grouped by supplier or contractor.", group: "Accounting" },
];

export default async function ReportsPage() {
  await requireSession();
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Court-ready evidence and financial reports. Print or save as PDF."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => {
          const inner = (
            <Card className={`h-full ${r.slug ? "transition-colors hover:border-evergreen/40" : "opacity-60"}`}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-slate">{r.group}</span>
                  {r.soon && <Badge>Soon</Badge>}
                </div>
                <h3 className="mt-2 font-heading text-sm font-semibold tracking-tight">{r.title}</h3>
                <p className="mt-1 text-xs text-slate">{r.body}</p>
              </CardBody>
            </Card>
          );
          return r.slug ? (
            <Link key={r.title} href={`/dashboard/reports/${r.slug}`}>{inner}</Link>
          ) : (
            <div key={r.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
