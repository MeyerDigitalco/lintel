import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Post-login router. Landlords (org members) go to the dashboard; tenants
 * (tenancy members) go to the portal. Used as the default post-auth landing.
 */
export default async function HomeRouter() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership) redirect("/dashboard");

  const { data: tenancy } = await supabase
    .from("tenancy_members")
    .select("tenancy_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (tenancy) redirect("/portal");

  // Signed in but neither landlord nor tenant yet.
  redirect("/onboarding");
}
