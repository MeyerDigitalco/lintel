import Link from "next/link";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddTenancyForm } from "@/components/app/RentForms";
import { generateRentPeriods, confirmRent } from "@/app/dashboard/rent/actions";
import { formatMoney } from "@/lib/i18n/currency";
import { getLang } from "@/lib/i18n/lang";
import { translate } from "@/lib/i18n/dictionaries";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function RentPage() {
  const { orgId, currency, country } = await requireWriter();
  const lang = getLang(country);
  const t = (k: string) => translate(lang, k);
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, label")
    .eq("org_id", orgId);
  const propMap = new Map((properties ?? []).map((p) => [p.id, p.label]));

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select("id, property_id, rent_amount, rent_period, start_date, tenant_name, tenant_email")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const { data: ledger } = await supabase
    .from("rent_ledger")
    .select("id, tenancy_id, period, due_on, amount_due, status, confirmed_at")
    .eq("org_id", orgId)
    .order("due_on", { ascending: true });

  const byTenancy = new Map<string, typeof ledger>();
  for (const row of ledger ?? []) {
    const arr = byTenancy.get(row.tenancy_id) ?? [];
    arr.push(row);
    byTenancy.set(row.tenancy_id, arr);
  }

  return (
    <div>
      <PageHeader
        title={t("p.rent_title")}
        subtitle={t("p.rent_sub")}
      />
      <AddTenancyForm properties={properties ?? []} />

      {!tenancies || tenancies.length === 0 ? (
        <EmptyState title="No tenancies yet" body="Create a tenancy to start logging rent." />
      ) : (
        <div className="space-y-4">
          {tenancies.map((t) => {
            const rows = byTenancy.get(t.id) ?? [];
            return (
              <Card key={t.id}>
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-base font-semibold tracking-tight">
                        {propMap.get(t.property_id) ?? "Property"}
                      </h3>
                      {t.tenant_name ? (
                        <p className="text-sm text-ink">{t.tenant_name}{t.tenant_email ? ` · ${t.tenant_email}` : ""}</p>
                      ) : null}
                      <p className="text-sm text-slate">
                        {gbp(Number(t.rent_amount ?? 0), { decimals: true })}/{t.rent_period === "weekly" ? "wk" : "mo"}
                        {t.start_date ? ` · since ${fmtDate(t.start_date)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/tenancies/${t.id}`}>
                        <Button size="sm" variant="ghost" type="button">Manage</Button>
                      </Link>
                      <form action={generateRentPeriods}>
                        <input type="hidden" name="tenancy_id" value={t.id} />
                        <Button size="sm" variant="outline" type="submit">
                          Generate periods
                        </Button>
                      </form>
                    </div>
                  </div>

                  {rows.length > 0 && (
                    <table className="mt-4 w-full text-sm">
                      <tbody>
                        {rows.map((r) => {
                          const overdue =
                            r.status !== "confirmed" && (daysUntil(r.due_on) ?? 0) < 0;
                          return (
                            <tr key={r.id} className="border-b border-hairline last:border-0">
                              <td className="py-2 text-slate">{r.period}</td>
                              <td className="py-2 tabular-nums text-ink">
                                {gbp(Number(r.amount_due), { decimals: true })}
                              </td>
                              <td className="py-2 text-slate">due {fmtDate(r.due_on)}</td>
                              <td className="py-2">
                                {r.status === "confirmed" ? (
                                  <Badge tone="moss">Received</Badge>
                                ) : r.status === "marked" ? (
                                  <Badge tone="amber">Tenant marked paid</Badge>
                                ) : overdue ? (
                                  <Badge tone="red">Arrears</Badge>
                                ) : (
                                  <Badge tone="amber">Due</Badge>
                                )}
                              </td>
                              <td className="py-2 text-right">
                                {r.status !== "confirmed" && (
                                  <form action={confirmRent}>
                                    <input type="hidden" name="id" value={r.id} />
                                    <button type="submit" className="text-sm text-evergreen hover:underline">
                                      Mark received
                                    </button>
                                  </form>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
