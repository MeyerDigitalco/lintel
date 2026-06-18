import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddTransactionForm } from "@/components/app/AddTransactionForm";
import { deleteTransaction } from "./actions";
import { categoryLabel } from "@/lib/sa105";
import { formatMoney } from "@/lib/i18n/currency";
import { fmtDate, quarterlyPeriods, taxYearStartFor } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { orgId, currency} = await requireWriter();
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const [{ data: properties }, { data: tx }] = await Promise.all([
    supabase.from("properties").select("id, label").eq("org_id", orgId),
    supabase
      .from("transactions")
      .select("id, direction, sa105_category, amount, occurred_on, description, receipt_url")
      .eq("org_id", orgId)
      .order("occurred_on", { ascending: false })
      .limit(200),
  ]);

  const yStart = taxYearStartFor();
  const periods = quarterlyPeriods(yStart);
  const inYear = (d: string) => d >= periods[0].startDate && d <= periods[3].endDate;

  let income = 0;
  let expenses = 0;
  let finance = 0;
  for (const t of tx ?? []) {
    if (!inYear(t.occurred_on)) continue;
    const a = Number(t.amount);
    if (t.direction === "income") income += a;
    else if (t.sa105_category === "finance_costs") finance += a;
    else expenses += a;
  }

  return (
    <div>
      <PageHeader
        title="Income & expenses"
        subtitle="Mapped to SA105 categories for your tax return."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Income (year)" value={gbp(income)} tone="evergreen" />
        <Stat label="Expenses (year)" value={gbp(expenses)} />
        <Stat label="Finance costs" value={gbp(finance)} hint="Section 24 — 20% reducer" />
        <Stat label="Net (excl. finance)" value={gbp(income - expenses)} />
      </div>

      <AddTransactionForm properties={properties ?? []} />

      {!tx || tx.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          body="Add income and expenses, or snap a receipt to auto-fill the details."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {tx.map((t) => (
                  <tr key={t.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3 text-slate">{fmtDate(t.occurred_on)}</td>
                    <td className="px-4 py-3 text-ink">
                      <span className="flex items-center gap-2">
                        {t.description || "—"}
                        {t.receipt_url && <Badge>Receipt</Badge>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate">{categoryLabel(t.sa105_category)}</td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        t.direction === "income" ? "text-evergreen" : "text-ink"
                      }`}
                    >
                      {t.direction === "income" ? "+" : "−"}
                      {gbp(Number(t.amount), { decimals: true })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteTransaction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-xs text-slate hover:text-red">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
