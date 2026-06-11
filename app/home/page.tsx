import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Post-login router. Accountants land on the accountant pack; other org members
 * (owners/landlords) on the dashboard; tenants on the portal.
 */
export default async function HomeRouter() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membership) {
    if (membership.role === "accountant") redirect("/dashboard/accountant");
    redirect("/dashboard");
  }

  const { data: tenancy } = await supabase
    .from("tenancy_members")
    .select("tenancy_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (tenancy) redirect("/portal");

  redirect("/onboarding");
}
