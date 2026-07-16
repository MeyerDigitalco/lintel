import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState } from "@/components/app/ui";
import { AgreementGenerator, type PropertyOption } from "@/components/app/AgreementGenerator";
import { specFor, CORE_FIELDS } from "@/lib/tenancy-agreement";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tenancy agreements",
  description: "Generate a region-aware tenancy agreement and download or email it as a PDF or Word document.",
};

export default async function TenancyAgreementPage() {
  const { orgId, email, country, region } = await requireWriter();
  const supabase = createClient();

  const [{ data: org }, { data: properties }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase
      .from("properties")
      .select("id, label, address_line1, address_line2, city, postcode")
      .eq("org_id", orgId)
      .order("label"),
  ]);

  // Pull the live tenancy per property so the form prefills tenant and rent.
  const ids = (properties ?? []).map((p) => p.id);
  const { data: tenancies } = ids.length
    ? await supabase
        .from("tenancies")
        .select("property_id, tenant_name, tenant_email, tenant_phone, rent_amount, deposit_amount, start_date, end_date")
        .in("property_id", ids)
    : { data: [] as any[] };

  const byProperty = new Map<string, any>();
  for (const t of tenancies ?? []) {
    if (!byProperty.has(t.property_id)) byProperty.set(t.property_id, t);
  }

  const spec = specFor(country, region);

  if (!spec) {
    return (
      <div>
        <PageHeader title="Tenancy agreements" subtitle="Region-aware agreement drafting." />
        <EmptyState
          title="No template for your region yet"
          body="We do not have an agreement template for your country. Tell us where you let and we will build one."
        />
      </div>
    );
  }

  const options: PropertyOption[] = (properties ?? []).map((p) => {
    const t = byProperty.get(p.id);
    return {
      id: p.id,
      label: p.label,
      address: [p.address_line1, p.address_line2, p.city, p.postcode].filter(Boolean).join(", ") || p.label,
      tenant_name: t?.tenant_name ?? null,
      tenant_email: t?.tenant_email ?? null,
      tenant_phone: t?.tenant_phone ?? null,
      rent_amount: t?.rent_amount ?? null,
      deposit_amount: t?.deposit_amount ?? null,
      start_date: t?.start_date ?? null,
      end_date: t?.end_date ?? null,
    };
  });

  return (
    <div>
      <PageHeader
        title="Tenancy agreements"
        subtitle={`Draft a ${spec.documentTitle.toLowerCase()} for ${spec.regionName ?? spec.countryName}, then download or email it.`}
      />
      <AgreementGenerator
        spec={spec}
        coreFields={CORE_FIELDS}
        properties={options}
        orgName={org?.name ?? ""}
        defaultEmail={email ?? ""}
      />
    </div>
  );
}
