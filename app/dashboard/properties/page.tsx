import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddPropertyForm } from "@/components/app/AddPropertyForm";
import { resolveJurisdiction } from "@/lib/jurisdictions";
import type { JurisdictionKey } from "@/lib/jurisdictions";
import { streetViewUrl } from "@/lib/street-view";
import { daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const { orgId, region } = await requireSession();
  const supabase = createClient();

  const [{ data: properties }, { data: tenancies }, { data: compliance }, { data: docs }] = await Promise.all([
    supabase.from("properties").select("id, label, jurisdiction, address_line1, city, postcode, is_hmo").eq("org_id", orgId).order("created_at", { ascending: false }),
    supabase.from("tenancies").select("property_id, status").eq("org_id", orgId),
    supabase.from("compliance_items").select("property_id, expires_at").eq("org_id", orgId),
    supabase.from("property_documents").select("property_id").eq("org_id", orgId),
  ]);

  function meta(propId: string, hasAddress: boolean) {
    const tens = (tenancies ?? []).filter((t) => t.property_id === propId);
    const occupied = tens.some((t) => t.status === "active");
    const comp = (compliance ?? []).filter((c) => c.property_id === propId);
    const hasDocs = (docs ?? []).some((d) => d.property_id === propId);

    let compliance_status: { tone: "red" | "amber" | "evergreen" | "default"; label: string };
    if (comp.length === 0) compliance_status = { tone: "default", label: "Unknown" };
    else if (comp.some((c) => { const d = daysUntil(c.expires_at); return d !== null && d < 0; })) compliance_status = { tone: "red", label: "Action needed" };
    else if (comp.some((c) => { const d = daysUntil(c.expires_at); return d !== null && d <= 30; })) compliance_status = { tone: "amber", label: "Renew soon" };
    else compliance_status = { tone: "evergreen", label: "Compliant" };

    const completion =
      (hasAddress ? 25 : 0) + (tens.length > 0 ? 25 : 0) + (comp.length > 0 ? 25 : 0) + (hasDocs ? 25 : 0);
    return { occupied, compliance_status, completion };
  }

  return (
    <div>
      <PageHeader title="Properties" subtitle="Each property loads its nation's tenancy and compliance rules." />
      <AddPropertyForm region={region} />

      {!properties || properties.length === 0 ? (
        <EmptyState title="No properties yet" body="Add your first property to start tracking income, compliance and rent." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((p) => {
            const j = resolveJurisdiction(p.jurisdiction as JurisdictionKey);
            const hasAddress = Boolean(p.city || p.postcode);
            const m = meta(p.id, hasAddress);
            const img = streetViewUrl(p);
            return (
              <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
                <Card className="h-full overflow-hidden transition-colors hover:border-evergreen/40">
                  {img && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={img} alt={p.label} className="h-36 w-full object-cover" />
                  )}
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold tracking-tight">{p.label}</h3>
                      {p.is_hmo && <Badge tone="amber">HMO</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate">{[p.city, p.postcode].filter(Boolean).join(", ") || "No address"}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone="mint">{j.name}</Badge>
                      <Badge tone={m.compliance_status.tone}>{m.compliance_status.label}</Badge>
                      <Badge tone={m.occupied ? "evergreen" : "default"}>{m.occupied ? "Rented" : "Unoccupied"}</Badge>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate">
                        <span>Profile completion</span>
                        <span>{m.completion}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                        <div className="h-1.5 rounded-full bg-evergreen" style={{ width: `${m.completion}%` }} />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
