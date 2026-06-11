import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// HMRC direct submission has been removed in favour of the accountant workflow.
export async function GET() {
  return NextResponse.json({ error: "HMRC submission is disabled." }, { status: 410 });
}
