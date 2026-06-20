import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { formatMoney } from "@/lib/i18n/currency";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { categoryLabelForRegion } from "@/lib/tax-categories";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function SupplierExpensesReport() {
  const { orgId, country, region, regionCode, currency } = await requireSession();
  const supabase = createClient();
  const ruleset = country === "GB" ? resolveRegion("GB", region) : resolveRegion(country, region, regionCode);
  const money = (n: number) => formatMoney(n, currency, { decimals: true });

  const [{ data: org }, { data: contacts }, { data: tx }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("contacts").select("name, company, kind").eq("org_id", orgId).in("kind", ["supplier", "contractor"]),
    supabase.from("transactions").select("description, amount, occurred_on, sa105_category").eq("org_id", orgId).eq("direction", "expense").order("occurred_on", { ascending: false }),
  ]);

  // Match each expense to a supplier/contractor by name or company appearing in the description.
  const suppliers = (contacts ?? []).map((c) => ({ label: c.company || c.name, needles: [c.name, c.company].filter(Boolean).map((x) => String(x).toLowerCase()) }));
  const buckets = new Map<string, { total: number; items: any[] }>();
  const UNATTRIB = "Unattributed / other";
  for (const t of tx ?? []) {
    const desc = String(t.description ?? "").toLowerCase();
    const match = suppliers.find((s) => s.needles.some((n) => n && desc.includes(n)));
    const key = match?.label ?? UNATTRIB;
    const b = buckets.get(key) ?? { total: 0, items: [] };
    b.total += Number(t.amount);
    b.items.push(t);
    buckets.set(key, b);
  }
  const groups = [...buckets.entries()].sort((a, b) => b[1].total - a[1].total);
  const grandTotal = (tx ?? []).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <ReportShell title="Supplier & contractor expenses" subtitle={ruleset.taxLabel} orgName={org?.name}>
      {(tx ?? []).length === 0 ? (
        <p className="text-sm text-slate">No expenses recorded.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate">Total expenses: <span className="font-semibold text-ink">{money(grandTotal)}</span></p>
          {groups.map(([name, b]) => (
            <section key={name} className="mb-6 break-inside-avoid">
              <div className="flex items-center justify-between border-b border-hairline pb-1">
                <h2 className="font-heading text-base font-semibold">{name}</h2>
                <span className="font-semibold tabular-nums text-ink">{money(b.total)}</span>
              </div>
              <table className="mt-1 w-full text-sm">
                <tbody>
                  {b.items.map((t, i) => (
                    <tr key={i} className="border-b border-hairline last:border-0">
                      <td className="py-1.5 text-slate">{fmtDate(t.occurred_on)}</td>
                      <td className="py-1.5 text-ink">{t.description || categoryLabelForRegion(country, t.sa105_category)}</td>
                      <td className="py-1.5 text-right tabular-nums text-ink">{money(Number(t.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
          <p className="mt-4 text-xs text-slate">Expenses are matched to a saved supplier or contractor when their name or company appears in the entry description; others are grouped as unattributed.</p>
        </>
      )}
    </ReportShell>
  );
}
