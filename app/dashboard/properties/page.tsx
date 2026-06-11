import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddPropertyForm } from "@/components/app/AddPropertyForm";
import { resolveJurisdiction } from "@/lib/jurisdictions";
import type { JurisdictionKey } from "@/lib/jurisdictions";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const { orgId } = await requireSession();
  const supabase = createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, label, jurisdiction, city, postcode, is_hmo")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Each property loads its nation's tenancy and compliance rules."
      />
      <AddPropertyForm />

      {!properties || properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          body="Add your first property to start tracking income, compliance and rent."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((p) => {
            const j = resolveJurisdiction(p.jurisdiction as JurisdictionKey);
            return (
              <Link key={p.id} href={`/dashboard/properties/${p.id}`}>
                <Card className="h-full transition-colors hover:border-evergreen/40">
                  <CardBody>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-semibold tracking-tight">
                        {p.label}
                      </h3>
                      {p.is_hmo && <Badge tone="amber">HMO</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-slate">
                      {[p.city, p.postcode].filter(Boolean).join(", ") || "No address"}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge tone="mint">{j.name}</Badge>
                      <span className="text-xs text-slate">{j.tenancyTypes[0].label}</span>
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
