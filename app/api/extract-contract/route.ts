import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { extractContractFields } from "@/lib/contract-extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Authenticate via cookie session (web) or Bearer token (mobile). */
async function authed(req: Request): Promise<boolean> {
  try {
    const cookieUser = await createClient().auth.getUser();
    if (cookieUser.data.user) return true;
  } catch {
    // no cookie session
  }
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (token) {
    try {
      const { data } = await createServiceClient().auth.getUser(token);
      if (data.user) return true;
    } catch {
      // invalid token
    }
  }
  return false;
}

export async function POST(req: Request) {
  if (!(await authed(req))) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const fields = await extractContractFields(buffer, file.type || "");
  return NextResponse.json({ fields });
}
