import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/app/ui";
import { NoticeGenerator } from "@/components/app/NoticeGenerator";
import { resolveRegion } from "@/lib/i18n/rulesets";

export const dynamic = "force-dynamic";

export default async function NoticeGeneratorPage() {
  const { orgId, country, region, regionCode } = await requireSession();
  const supabase = createClient();

  const [{ data: org }, { data: properties }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase.from("properties").select("id, label, address_line1, city, postcode").eq("org_id", orgId).order("label"),
  ]);

  const ruleset = resolveRegion(country, region, regionCode);
  const props = (properties ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    address: [p.address_line1, p.city, p.postcode].filter(Boolean).join(", ") || p.label,
  }));

  return (
    <div>
      <PageHeader
        title="Notice generator"
        subtitle={`Fill in, print or save as PDF, ${ruleset.countryName} notice templates.`}
      />
      <NoticeGenerator
        notices={ruleset.notices}
        properties={props}
        orgName={org?.name ?? ""}
        countryName={ruleset.countryName}
        governingLaw={ruleset.governingLaw}
      />
    </div>
  );
}
