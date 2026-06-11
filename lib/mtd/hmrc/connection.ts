import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Server-only HMRC connection status. Returns non-sensitive fields only —
 * tokens never leave the server. Used by the Tax page to show whether the org
 * has connected to HMRC, without granting any client access to the tokens.
 */
export interface HmrcConnectionStatus {
  connected: boolean;
  nino: string | null;
  businessId: string | null;
  maskedNino: string | null;
}

export async function hmrcConnectionStatus(
  orgId: string
): Promise<HmrcConnectionStatus> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("hmrc_connections")
    .select("nino, business_id, access_token")
    .eq("org_id", orgId)
    .maybeSingle();

  const nino = data?.nino ?? null;
  return {
    connected: Boolean(data?.access_token),
    nino,
    businessId: data?.business_id ?? null,
    maskedNino: nino ? nino.replace(/^(.{2}).*(.{1})$/, "$1******$2") : null,
  };
}

/** Persist the taxpayer's NINO + business id (entered by the landlord). */
export async function saveHmrcIdentifiers(
  orgId: string,
  nino: string,
  businessId: string
) {
  const supabase = createServiceClient();
  await supabase
    .from("hmrc_connections")
    .upsert({ org_id: orgId, nino, business_id: businessId }, { onConflict: "org_id" });
}
