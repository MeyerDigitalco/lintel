import { requireSession, loadEntitlements } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EntitlementProvider } from "@/components/app/EntitlementProvider";
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

  const supabase = createClient();
  const { data: org } = await supabase
    .from("orgs")
    .select("name")
    .eq("id", session.orgId)
    .maybeSingle();

  return (
    <EntitlementProvider value={entitlements}>
      <div className="flex min-h-screen bg-paper">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar email={session.email} orgName={org?.name} />
          <main className="flex-1 px-5 py-8">
            <div className="mx-auto max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </EntitlementProvider>
  );
}
