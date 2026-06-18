import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession, isWriterRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddUnitForm, AddRegistrationForm } from "@/components/app/PropertyDetailForms";
import { PropertyDocumentUpload } from "@/components/app/PropertyDocuments";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { fmtDate } from "@/lib/dates";
import { updateProperty, deleteProperty } from "../actions";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function PropertyDetail({ params }: { params: { id: string } }) {
  const { orgId, role } = await requireSession();
  const canWrite = isWriterRole(role);
  const supabase = createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("id, label, jurisdiction, address_line1, city, postcode, is_hmo")
    .eq("org_id", orgId)
    .eq("id", params.id)
    .maybeSingle();
  if (!property) notFound();

  const [{ data: units }, { data: registrations }, { data: documents }] = await Promise.all([
    supabase.from("units").select("id, label").eq("property_id", property.id),
    supabase.from("registrations").select("id, scheme, reference, issued_at, renews_at").eq("property_id", property.id),
    supabase.from("property_documents").select("id, label, doc_type, storage_path, expires_at, created_at").eq("property_id", property.id).order("created_at", { ascending: false }),
  ]);

  const docsWithUrls = await Promise.all(
    (documents ?? []).map(async (d) => {
      const { data } = await supabase.storage.from("property-docs").createSignedUrl(d.storage_path, 600);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  const j = resolveJurisdiction(property.jurisdiction as JurisdictionKey);

  return (
    <div>
      <Link href="/dashboard/properties" className="text-sm text-slate hover:text-ink">← Properties</Link>
      <div className="mt-3">
        <PageHeader
          title={property.label}
          subtitle={[property.address_line1, property.city, property.postcode].filter(Boolean).join(", ")}
          action={<Badge tone="mint">{j.name}</Badge>}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {canWrite && (
          <Card className="lg:col-span-2">
            <CardBody>
              <h2 className="font-heading text-base font-semibold tracking-tight">Edit property</h2>
              <form action={updateProperty} className="mt-3 grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={property.id} />
                <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-medium text-slate">Name / label</span>
                  <input name="label" defaultValue={property.label} className="h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm" /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium text-slate">Address line</span>
                  <input name="address_line1" defaultValue={property.address_line1 ?? ""} className="h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm" /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium text-slate">Town / city</span>
                  <input name="city" defaultValue={property.city ?? ""} className="h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm" /></label>
                <label className="block"><span className="mb-1 block text-xs font-medium text-slate">Postcode</span>
                  <input name="postcode" defaultValue={property.postcode ?? ""} className="h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm" /></label>
                <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2"><input type="checkbox" name="is_hmo" defaultChecked={property.is_hmo} className="h-4 w-4" /> House in multiple occupation (HMO)</label>
                <div className="sm:col-span-2"><Button type="submit" size="sm">Save changes</Button></div>
              </form>
              <form action={deleteProperty} className="mt-4 border-t border-hairline pt-3">
                <input type="hidden" name="id" value={property.id} />
                <input type="hidden" name="redirect" value="1" />
                <button type="submit" className="text-sm text-red hover:underline">Delete this property</button>
                <p className="mt-1 text-xs text-slate">Removes the property and its tenancies, compliance items and documents. This can&apos;t be undone.</p>
              </form>
            </CardBody>
          </Card>
        )}
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Jurisdiction rules</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Governing law" value={j.governingLaw} />
              <Row label="Tenancy type" value={j.tenancyTypes[0].label} />
              <Row label="Deposit cap" value={j.depositRules.capDescription} />
              <Row label="Right to Rent" value={j.rightToRent ? "Required" : "Not applicable"} />
              <Row label="Disputes" value={j.disputeForum} />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Document checklist</h2>
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

        <Card className="lg:col-span-2">
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">Document vault</h2>
              <PropertyDocumentUpload propertyId={property.id} />
            </div>
            {docsWithUrls.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {docsWithUrls.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lintel bg-paper px-3 py-2">
                    <span>
                      <span className="text-ink">{d.label}</span>
                      {d.doc_type && <Badge>{d.doc_type.replace(/_/g, " ")}</Badge>}
                      {d.expires_at && <span className="ml-2 text-xs text-slate">expires {fmtDate(d.expires_at)}</span>}
                    </span>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-evergreen hover:underline">Download</a>
                    ) : (
                      <span className="text-xs text-slate">—</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate">No documents uploaded yet. Add EPC, gas/electrical certificates, deposit certificate, inventory, correspondence.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Units {property.is_hmo && <Badge tone="amber">HMO</Badge>}</h2>
            {units && units.length > 0 ? (
              <ul className="my-3 space-y-1 text-sm text-ink">
                {units.map((u) => (<li key={u.id} className="rounded-lintel bg-paper px-3 py-2">{u.label}</li>))}
              </ul>
            ) : (<p className="my-3 text-sm text-slate">No units added.</p>)}
            <AddUnitForm propertyId={property.id} />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-base font-semibold tracking-tight">Registrations</h2>
              <AddRegistrationForm propertyId={property.id} defaultScheme={j.landlordRegistrationScheme ?? undefined} />
            </div>
            {registrations && registrations.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {registrations.map((r) => (
                  <li key={r.id} className="rounded-lintel bg-paper px-3 py-2">
                    <div className="flex justify-between"><span className="text-ink">{r.scheme}</span><span className="text-slate">{r.reference}</span></div>
                    {r.renews_at && <p className="mt-0.5 text-xs text-slate">Renews {fmtDate(r.renews_at)}</p>}
                  </li>
                ))}
              </ul>
            ) : (<p className="text-sm text-slate">No registrations recorded.</p>)}
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
