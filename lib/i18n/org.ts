import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Fetch an org's currency (defensive — defaults GBP if column/row missing). */
export async function orgCurrency(orgId: string, client?: any): Promise<string> {
  try {
    const supabase = client ?? createClient();
    const { data } = await supabase.from("orgs").select("currency").eq("id", orgId).maybeSingle();
    return (data?.currency as string) || "GBP";
  } catch {
    return "GBP";
  }
}
