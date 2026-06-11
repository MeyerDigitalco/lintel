import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { authorizeUrl } from "@/lib/mtd/hmrc/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Begin the HMRC OAuth journey. The org id is carried in `state` so the
 * callback can attribute the tokens. (In production, sign/verify the state.)
 */
export async function GET(_req: NextRequest) {
  const { orgId } = await requireSession();
  const state = Buffer.from(JSON.stringify({ orgId, t: Date.now() })).toString("base64url");
  return NextResponse.redirect(authorizeUrl(state));
}
