import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddUnitForm, AddRegistrationForm } from "@/components/app/PropertyDetailForms";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PropertyDetail({
  params,
}: {
  params: { id: string };
}) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, label, jurisdiction, address_line1, city, postcode, is_hmo")
    .eq("org_id", orgId)
    .eq("id", params.id)
    .maybeSingle();

  if (!property) notFound();

  const [{ data: units }, { data: registrations }] = await Promise.all([
    supabase.from("units").select("id, label").eq("property_id", property.id),
    supabase
      .from("registrations")
      .select("id, scheme, reference, issued_at, renews_at")
      .eq("property_id", property.id),
  ]);

  const j = resolveJurisdiction(property.jurisdiction as JurisdictionKey);

  return (
    <div>
      <Link href="/dashboard/properties" className="text-sm text-slate hover:text-ink">
        ← Properties
      </Link>
      <div className="mt-3">
        <PageHeader
          title={property.label}
          subtitle={[property.address_line1, property.city, property.postcode]
            .filter(Boolean)
            .join(", ")}
          action={<Badge tone="mint">{j.name}</Badge>}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Jurisdiction summary */}
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Jurisdiction rules
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Governing law" value={j.governingLaw} />
              <Row label="Tenancy type" value={j.tenancyTypes[0].label} />
              <Row label="Deposit cap" value={j.depositRules.capDescription} />
              <Row label="Right to Rent" value={j.rightToRent ? "Required" : "Not applicable"} />
              <Row label="Disputes" value={j.disputeForum} />
            </dl>
          </CardBody>
        </Card>

        {/* Document checklist */}
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Document checklist
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {j.documentChecklist.map((d) => (
                <li key={d.key} className="flex items-start justify-between gap-2">
                  <span className="text-ink">{d.label}</span>
                  {d.atTenancyStart && <Badge>At start</Badge>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Units */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">
                Units {property.is_hmo && <Badge tone="amber">HMO</Badge>}
              </h2>
            </div>
            {units && units.length > 0 ? (
              <ul className="my-3 space-y-1 text-sm text-ink">
                {units.map((u) => (
                  <li key={u.id} className="rounded-lintel bg-paper px-3 py-2">{u.label}</li>
                ))}
              </ul>
            ) : (
              <p className="my-3 text-sm text-slate">No units added.</p>
            )}
            <AddUnitForm propertyId={property.id} />
          </CardBody>
        </Card>

        {/* Registrations */}
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">
                Registrations
              </h2>
              <AddRegistrationForm
                propertyId={property.id}
                defaultScheme={j.landlordRegistrationScheme ?? undefined}
              />
            </div>
            {j.landlordRegistrationScheme && (
              <p className="mb-3 text-xs text-slate">
                {j.name} requires: {j.landlordRegistrationScheme}
              </p>
            )}
            {registrations && registrations.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {registrations.map((r) => (
                  <li key={r.id} className="rounded-lintel bg-paper px-3 py-2">
                    <div className="flex justify-between">
                      <span className="text-ink">{r.scheme}</span>
                      <span className="text-slate">{r.reference}</span>
                    </div>
                    {r.renews_at && (
                      <p className="mt-0.5 text-xs text-slate">
                        Renews {fmtDate(r.renews_at)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate">No registrations recorded.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-hairline pb-2 last:border-0">
      <dt className="text-slate">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
