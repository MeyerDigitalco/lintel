import { requireSession, loadEntitlements, isWriterRole } from "@/lib/auth";
import { resolveJurisdiction } from "@/lib/jurisdictions";
import { createClient } from "@/lib/supabase/server";
import { EntitlementProvider } from "@/components/app/EntitlementProvider";
import { RoleProvider } from "@/components/app/RoleProvider";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const entitlements = await loadEntitlements(session.orgId);
  const readOnly = !isWriterRole(session.role);

  const supabase = createClient();
  const { data: org } = await supabase
    .from("orgs")
    .select("name")
    .eq("id", session.orgId)
    .maybeSingle();

  // Regional landscape behind the content column only (never the sidebar).
  // Prefers a real photo at /regions/<region>.jpg; falls back to the bundled
  // vector landscape if the photo isn't present (CSS skips a 404 layer).
  const r = session.region;
  const contentStyle: React.CSSProperties = {
    backgroundImage:
      `linear-gradient(to bottom, rgba(246,248,251,0.30) 0px, rgba(246,248,251,0.88) 250px, #F6F8FB 470px), ` +
      `url(/regions/${r}.jpg), url(/regions/${r}.svg)`,
    backgroundRepeat: "no-repeat, no-repeat, no-repeat",
    backgroundSize: "cover, cover, cover",
    backgroundPosition: "top center, top center, top center",
    backgroundAttachment: "fixed, fixed, fixed",
  };

  return (
    <EntitlementProvider value={entitlements}>
      <RoleProvider readOnly={readOnly}>
        <div className="flex min-h-screen bg-paper">
          <Sidebar readOnly={readOnly} />
          <div className="flex min-w-0 flex-1 flex-col" style={contentStyle}>
            <Topbar email={session.email} orgName={org?.name} regionName={resolveJurisdiction(session.region).name} />
            <main className="flex-1 px-5 py-8">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        </div>
      </RoleProvider>
    </EntitlementProvider>
  );
}
