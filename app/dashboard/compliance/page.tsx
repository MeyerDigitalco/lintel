import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddComplianceForm } from "@/components/app/AddComplianceForm";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

function statusBadge(days: number | null) {
  if (days === null) return <Badge>No expiry</Badge>;
  if (days < 0) return <Badge tone="red">Overdue</Badge>;
  if (days <= 7) return <Badge tone="red">{days}d left</Badge>;
  if (days <= 30) return <Badge tone="amber">{days}d left</Badge>;
  if (days <= 60) return <Badge tone="amber">{days}d left</Badge>;
  return <Badge tone="mint">Valid</Badge>;
}

export default async function CompliancePage() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, label, jurisdiction")
    .eq("org_id", orgId);

  const { data: items } = await supabase
    .from("compliance_items")
    .select("id, property_id, label, statutory_basis, issued_at, expires_at")
    .eq("org_id", orgId);

  // Build the jurisdiction → selectable items map for the nations in use.
  const itemsByJurisdiction: Record<string, { key: string; label: string }[]> = {};
  for (const p of properties ?? []) {
    if (!itemsByJurisdiction[p.jurisdiction]) {
      const rules = resolveJurisdiction(p.jurisdiction as JurisdictionKey);
      itemsByJurisdiction[p.jurisdiction] = rules.complianceItems.map((c) => ({
        key: c.key,
        label: c.label,
      }));
    }
  }

  const propMap = new Map((properties ?? []).map((p) => [p.id, p.label]));
  const enriched = (items ?? [])
    .map((i) => ({ ...i, days: daysUntil(i.expires_at) }))
    .sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity));

  return (
    <div>
      <PageHeader
        title="Compliance vault"
        subtitle="Jurisdiction-aware. Reminders fire at 60, 30 and 7 days before expiry."
      />
      <AddComplianceForm
        properties={(properties ?? []).map((p) => ({
          id: p.id,
          label: p.label,
          jurisdiction: p.jurisdiction,
        }))}
        itemsByJurisdiction={itemsByJurisdiction}
      />

      {enriched.length === 0 ? (
        <EmptyState
          title="No compliance items"
          body="Add certificates and checks. Lintel only shows what your nation requires."
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((i) => (
                  <tr key={i.id} className="border-b border-hairline last:border-0">
                    <td className="px-4 py-3">
                      <div className="text-ink">{i.label}</div>
                      {i.statutory_basis && (
                        <div className="text-xs text-slate">{i.statutory_basis}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate">{propMap.get(i.property_id)}</td>
                    <td className="px-4 py-3 text-slate">{fmtDate(i.expires_at)}</td>
                    <td className="px-4 py-3">{statusBadge(i.days)}</td>
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
