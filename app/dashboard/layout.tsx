import { requireSession, loadEntitlements, isWriterRole } from "@/lib/auth";
import { getLang } from "@/lib/i18n/lang";
import { availableLanguages, isRTL } from "@/lib/i18n/dictionaries";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { createClient } from "@/lib/supabase/server";
import { EntitlementProvider } from "@/components/app/EntitlementProvider";
import { RoleProvider } from "@/components/app/RoleProvider";
import { Sidebar } from "@/components/app/Sidebar";
import { ContentColumn } from "@/components/app/ContentColumn";
import { Topbar } from "@/components/app/Topbar";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const entitlements = await loadEntitlements(session.orgId);
  const readOnly = !isWriterRole(session.role);
  const lang = getLang(session.country);
  const langs = availableLanguages(session.country);
  const ruleset = resolveRegion(session.country, session.region, session.regionCode);

  const supabase = createClient();
  const { data: org } = await supabase
    .from("orgs")
    .select("name")
    .eq("id", session.orgId)
    .maybeSingle();

  return (
    <EntitlementProvider value={entitlements}>
      <RoleProvider readOnly={readOnly}>
        <div className="flex min-h-screen bg-paper" dir={isRTL(lang) ? "rtl" : "ltr"}>
          <Sidebar readOnly={readOnly} lang={lang} langs={langs} country={session.country} />
          <ContentColumn region={session.region} dir={isRTL(lang) ? "rtl" : "ltr"}>
            <Topbar email={session.email} orgName={org?.name} regionName={ruleset.subregionName ? `${ruleset.subregionName}, ${ruleset.countryName}` : ruleset.countryName} />
            <main className="flex-1 px-5 py-8">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </ContentColumn>
        </div>
      </RoleProvider>
    </EntitlementProvider>
  );
}
