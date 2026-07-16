import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/app/ui";
import { markRentPaid } from "@/app/portal/actions";
import { formatMoney } from "@/lib/i18n/currency";
import { orgCurrency } from "@/lib/i18n/org";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PortalRent() {
  const { active } = await requireTenant();
  const cur = active ? await orgCurrency(active.orgId) : "GBP";
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, cur, opts);
  const supabase = createClient();

  const { data: rows } = await supabase
    .from("rent_ledger")
    .select("id, period, due_on, amount_due, status, marked_at")
    .eq("tenancy_id", active.tenancyId)
    .order("due_on", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-xl font-semibold tracking-tight">Rent</h1>
      <p className="text-xs text-slate">
        Lintel doesn&apos;t process payments. Pay your landlord as usual, then
        mark it here, they&apos;ll confirm receipt.
      </p>

      {!rows || rows.length === 0 ? (
        <EmptyState title="No rent records" body="Nothing has been logged for your tenancy yet." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const overdue = r.status !== "confirmed" && (daysUntil(r.due_on) ?? 0) < 0;
            return (
              <Card key={r.id}>
                <CardBody className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-heading text-base font-semibold tabular-nums">
                      {gbp(Number(r.amount_due), { decimals: true })}
                    </p>
                    <p className="text-xs text-slate">
                      {r.period} · due {fmtDate(r.due_on)}
                    </p>
                  </div>
                  <div className="text-right">
                    {r.status === "confirmed" ? (
                      <Badge tone="moss">Confirmed</Badge>
                    ) : r.status === "marked" ? (
                      <Badge tone="amber">Awaiting confirmation</Badge>
                    ) : overdue ? (
                      <Badge tone="red">Overdue</Badge>
                    ) : (
                      <Badge>Due</Badge>
                    )}
                    {r.status === "due" || overdue ? (
                      <form action={markRentPaid} className="mt-2">
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-sm text-evergreen hover:underline"
                        >
                          Mark as paid
                        </button>
                      </form>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
