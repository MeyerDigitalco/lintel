import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { answerQuestion, type AssistantCtx } from "@/lib/assistant-answer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function resolveUser(req: Request): Promise<{ client: any; userId: string } | null> {
  // Web: cookie session (RLS client).
  try {
    const cookieClient = createClient();
    const { data } = await cookieClient.auth.getUser();
    if (data.user) return { client: cookieClient, userId: data.user.id };
  } catch {
    // no cookie session
  }
  // Mobile: bearer token (service client, scoped by orgId in queries).
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (token) {
    try {
      const service = createServiceClient();
      const { data } = await service.auth.getUser(token);
      if (data.user) return { client: service, userId: data.user.id };
    } catch {
      // invalid token
    }
  }
  return null;
}

export async function POST(req: Request) {
  const who = await resolveUser(req);
  if (!who) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let question = "";
  try {
    const body = await req.json();
    question = String(body?.question ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Resolve the user's org + region context.
  const { data: membership } = await who.client
    .from("memberships")
    .select("org_id")
    .eq("user_id", who.userId)
    .limit(1)
    .maybeSingle();
  if (!membership) return NextResponse.json({ error: "No organisation" }, { status: 403 });

  const { data: org } = await who.client
    .from("orgs")
    .select("region, country, currency, region_code")
    .eq("id", membership.org_id)
    .maybeSingle();

  // Voice entitlement gate.
  const { data: ent } = await who.client
    .from("entitlements")
    .select("active")
    .eq("org_id", membership.org_id)
    .eq("feature", "voice")
    .maybeSingle();
  if (!ent?.active) return NextResponse.json({ error: "The assistant add-on is off for your account." }, { status: 403 });

  const ctx: AssistantCtx = {
    orgId: membership.org_id,
    country: (org?.country as string) ?? "GB",
    region: (org?.region as string) ?? "england",
    regionCode: (org?.region_code as string) ?? null,
    currency: (org?.currency as string) ?? "GBP",
  };

  const answer = await answerQuestion(who.client, ctx, question);
  return NextResponse.json({ answer });
}
