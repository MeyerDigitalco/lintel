import Link from "next/link";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddInvoiceForm } from "@/components/app/AddInvoiceForm";
import { setInvoiceStatus } from "./actions";
import { formatMoney } from "@/lib/i18n/currency";
import { fmtDate } from "@/lib/dates";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "draft", "sent", "viewed", "overdue", "partial", "paid", "void"];
const nextStatus: Record<string, string> = { draft: "sent", sent: "paid", viewed: "paid", overdue: "paid", partial: "paid" };
const tone = (s: string) => (s === "paid" ? "mint" : s === "overdue" ? "red" : s === "void" ? "default" : "amber");

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { orgId, currency} = await requireWriter();
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const [{ data: invoices }, { data: contacts }, { data: properties }] = await Promise.all([
    supabase.from("invoices").select("id, number, status, amount, description, issue_date, due_date, contacts(name), properties(label)").eq("org_id", orgId).order("issue_date", { ascending: false }),
    supabase.from("contacts").select("id, name").eq("org_id", orgId).eq("archived", false),
    supabase.from("properties").select("id, label").eq("org_id", orgId),
  ]);

  const all = invoices ?? [];
  const status = searchParams.status ?? "all";
  const filtered = all.filter((i) => status === "all" || i.status === status);
  const outstanding = all.filter((i) => !["paid", "void"].includes(i.status)).reduce((s, i) => s + Number(i.amount), 0);
  const paid = all.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Create, send and track invoices for your contacts." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Invoices" value={String(all.length)} />
        <Stat label="Outstanding" value={gbp(outstanding)} tone={outstanding ? "amber" : "default"} />
        <Stat label="Paid" value={gbp(paid)} tone="evergreen" />
      </div>

      <AddInvoiceForm contacts={contacts ?? []} properties={properties ?? []} />

      <div className="mb-6 mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/dashboard/invoices?status=${s}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize bg-surface",
              status === s ? "border-evergreen bg-evergreen/8 text-evergreen" : "border-hairline text-slate hover:text-ink"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No invoices" body="Create your first invoice to get started." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i: any) => (
                  <tr key={i.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3 text-ink">{i.number}</td>
                    <td className="px-4 py-3 text-slate">{i.contacts?.name ?? i.properties?.label ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{fmtDate(i.due_date)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{gbp(Number(i.amount), { decimals: true })}</td>
                    <td className="px-4 py-3"><Badge tone={tone(i.status) as any}>{i.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {nextStatus[i.status] && (
                        <form action={setInvoiceStatus}>
                          <input type="hidden" name="id" value={i.id} />
                          <input type="hidden" name="status" value={nextStatus[i.status]} />
                          <button type="submit" className="text-xs text-evergreen hover:underline capitalize">
                            Mark {nextStatus[i.status]}
                          </button>
                        </form>
                      )}
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
