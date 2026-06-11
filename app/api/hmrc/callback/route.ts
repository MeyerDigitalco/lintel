import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/mtd/hmrc/oauth";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * HMRC OAuth callback. Exchanges the code for tokens and stores them server-side
 * (service role) against the org carried in `state`.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/dashboard/tax?hmrc=error`);
  }

  let orgId: string;
  try {
    orgId = JSON.parse(Buffer.from(state, "base64url").toString()).orgId;
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/tax?hmrc=error`);
  }

  try {
    const tokens = await exchangeCode(code);
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();
    const supabase = createServiceClient();
    await supabase.from("hmrc_connections").upsert(
      {
        org_id: orgId,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: expiresAt,
        scope: tokens.scope,
      },
      { onConflict: "org_id" }
    );
    return NextResponse.redirect(`${appUrl}/dashboard/tax?hmrc=connected`);
  } catch {
    return NextResponse.redirect(`${appUrl}/dashboard/tax?hmrc=error`);
  }
}
