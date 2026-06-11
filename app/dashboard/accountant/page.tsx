import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { categoryLabel, SA105_CATEGORIES } from "@/lib/sa105";
import { gbp } from "@/lib/format";
import { quarterlyPeriods, taxYearStartFor, fmtDate } from "@/lib/dates";
import { addAccountantNote, resolveAccountantNote } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountantPage() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const yStart = taxYearStartFor();
  const periods = quarterlyPeriods(yStart);

  const [{ data: properties }, { data: tx }, { data: notes }, { count: docCount }] =
    await Promise.all([
      supabase.from("properties").select("id, label").eq("org_id", orgId),
      supabase
        .from("transactions")
        .select("property_id, direction, amount, sa105_category, occurred_on, receipt_url")
        .eq("org_id", orgId)
        .gte("occurred_on", periods[0].startDate)
        .lte("occurred_on", periods[3].endDate),
      supabase.from("accountant_notes").select("id, body, author_role, resolved, created_at").eq("org_id", orgId).order("created_at", { ascending: false }),
      supabase.from("property_documents").select("id", { count: "exact", head: true }).eq("org_id", orgId),
    ]);

  const propMap = new Map((properties ?? []).map((p) => [p.id, p.label]));
  const rows = tx ?? [];

  // Books readiness
  const total = rows.length;
  const categorised = rows.filter((r) => r.sa105_category).length;
  const expenses = rows.filter((r) => r.direction === "expense");
  const expensesWithReceipt = expenses.filter((r) => r.receipt_url).length;
  const uncategorised = total - categorised;
  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 100);

  // Per-property SA105 breakdown
  const breakdown = (properties ?? []).map((p) => {
    const propRows = rows.filter((r) => r.property_id === p.id);
    const byCat = new Map<string, number>();
    let income = 0;
    let expense = 0;
    for (const r of propRows) {
      const a = Number(r.amount);
      byCat.set(r.sa105_category ?? "uncategorised", (byCat.get(r.sa105_category ?? "uncategorised") ?? 0) + a);
      if (r.direction === "income") income += a;
      else expense += a;
    }
    return { id: p.id, label: p.label, income, expense, byCat };
  });
  const unassigned = rows.filter((r) => !r.property_id);

  return (
    <div>
      <PageHeader
        title="Accountant pack"
        subtitle={`Everything your accountant needs for ${yStart}/${(yStart + 1) % 100} — SA105 breakdown, evidence and queries.`}
        action={
          <a href={`/api/export/csv?year=${yStart}`}>
            <Button size="sm">Export SA105 CSV</Button>
          </a>
        }
      />

      {/* Books readiness */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Transactions" value={String(total)} />
        <Stat label="Categorised" value={`${pct(categorised, total)}%`} tone={pct(categorised, total) === 100 ? "evergreen" : "amber"} hint={`${uncategorised} to review`} />
        <Stat label="Expenses with receipt" value={`${pct(expensesWithReceipt, expenses.length)}%`} tone={pct(expensesWithReceipt, expenses.length) >= 80 ? "evergreen" : "amber"} />
        <Stat label="Property documents" value={String(docCount ?? 0)} />
      </div>

      {/* Per-property SA105 */}
      <Card className="mb-6">
        <CardBody className="p-0">
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="font-heading text-base font-semibold tracking-tight">SA105 by property</h2>
          </div>
          {breakdown.length === 0 ? (
            <div className="p-4"><EmptyState title="No properties" body="Add properties and transactions to build the pack." /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 text-right font-medium">Income</th>
                  <th className="px-4 py-3 text-right font-medium">Expenses</th>
                  <th className="px-4 py-3 text-right font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b) => (
                  <tr key={b.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3 text-ink">{b.label}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-evergreen">{gbp(b.income)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{gbp(b.expense)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{gbp(b.income - b.expense)}</td>
                  </tr>
                ))}
                {unassigned.length > 0 && (
                  <tr className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3 text-slate">Unassigned</td>
                    <td className="px-4 py-3 text-right tabular-nums" colSpan={3}>{unassigned.length} transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Category totals (portfolio) */}
      <Card className="mb-6">
        <CardBody>
          <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">Category totals (SA105)</h2>
          <table className="w-full text-sm">
            <tbody>
              {SA105_CATEGORIES.map((c) => {
                const tot = rows.filter((r) => r.sa105_category === c.key).reduce((s, r) => s + Number(r.amount), 0);
                if (tot === 0) return null;
                return (
                  <tr key={c.key} className="border-b border-hairline last:border-0">
                    <td className="py-2 text-slate">{categoryLabel(c.key)}</td>
                    <td className="py-2 text-right tabular-nums">{gbp(tot, { decimals: true })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Queries */}
      <Card>
        <CardBody>
          <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">Queries for your accountant</h2>
          <form action={addAccountantNote} className="flex gap-2">
            <input name="body" required placeholder="e.g. Is the new boiler capital or revenue?" className="h-10 flex-1 rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30" />
            <Button size="sm" type="submit">Add</Button>
          </form>
          {notes && notes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 rounded-lintel bg-paper px-3 py-2 text-sm">
                  <span className={n.resolved ? "text-slate line-through" : "text-ink"}>{n.body}</span>
                  <span className="flex items-center gap-2">
                    {n.resolved ? <Badge tone="mint">Resolved</Badge> : (
                      <form action={resolveAccountantNote}>
                        <input type="hidden" name="id" value={n.id} />
                        <button type="submit" className="text-xs text-evergreen hover:underline">Resolve</button>
                      </form>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate">No open queries.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
