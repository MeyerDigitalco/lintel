import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddTransactionForm } from "@/components/app/AddTransactionForm";
import { TransactionsTable } from "@/components/app/TransactionsTable";
import { Button } from "@/components/ui/Button";
import { deleteRepeatedEntries } from "@/app/dashboard/transactions/actions";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { formatMoney } from "@/lib/i18n/currency";
import { fmtDate, quarterlyPeriods, taxYearStartFor } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const { orgId, currency, country, region, regionCode } = await requireWriter();
  const ruleset = country === "GB" ? resolveRegion("GB", region) : resolveRegion(country, region, regionCode);
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: properties }, { data: tx }, { count: repeatedAll }, { count: repeatedFuture }] = await Promise.all([
    supabase.from("properties").select("id, label").eq("org_id", orgId),
    supabase
      .from("transactions")
      .select("id, direction, sa105_category, amount, occurred_on, description, receipt_url, property_id, recurring")
      .eq("org_id", orgId)
      .order("occurred_on", { ascending: false })
      .limit(200),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("org_id", orgId).eq("recurring", true),
    supabase.from("transactions").select("id", { count: "exact", head: true }).eq("org_id", orgId).eq("recurring", true).gt("occurred_on", today),
  ]);

  const rows = await Promise.all(
    (tx ?? []).map(async (t: any) => {
      let receiptUrl: string | null = null;
      if (t.receipt_url) {
        const { data } = await supabase.storage.from("receipts").createSignedUrl(t.receipt_url as string, 3600);
        receiptUrl = data?.signedUrl ?? null;
      }
      return { ...t, receiptUrl };
    })
  );

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
        subtitle={`Categorised for ${ruleset.taxLabel}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Income (year)" value={gbp(income)} tone="evergreen" />
        <Stat label="Expenses (year)" value={gbp(expenses)} />
        <Stat label="Finance costs" value={gbp(finance)} hint={country === "GB" ? "Section 24, 20% reducer" : "Interest & finance"} />
        <Stat label="Net (excl. finance)" value={gbp(income - expenses)} />
      </div>

      {(repeatedAll ?? 0) > 0 && (
        <Card className="mb-6">
          <CardBody>
            <p className="text-sm font-medium text-ink">
              {repeatedAll} repeated {repeatedAll === 1 ? "entry" : "entries"} from the old repeat/backdate option
            </p>
            <p className="mt-1 text-xs text-slate">
              {repeatedFuture ?? 0} dated after today. Deleting removes them permanently, including any attached receipt.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(repeatedFuture ?? 0) > 0 && (
                <form action={deleteRepeatedEntries}>
                  <input type="hidden" name="scope" value="future" />
                  <Button size="sm" variant="outline" type="submit">Delete {repeatedFuture} future</Button>
                </form>
              )}
              <form action={deleteRepeatedEntries}>
                <input type="hidden" name="scope" value="all" />
                <Button size="sm" variant="ghost" type="submit">Delete all {repeatedAll}</Button>
              </form>
            </div>
          </CardBody>
        </Card>
      )}

      <AddTransactionForm properties={properties ?? []} country={country} />

      {rows.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          body="Add income and expenses, or snap a receipt to auto-fill the details."
        />
      ) : (
        <TransactionsTable transactions={rows} properties={properties ?? []} currency={currency} country={country} />
      )}
    </div>
  );
}
