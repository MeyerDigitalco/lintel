import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sendgrid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron — compliance + certificate expiry sweep.
 * Finds compliance items expiring in 60/30/7 days and sends SendGrid reminders.
 * Guarded by a shared CRON_SECRET.
 *
 * Schedule via vercel.json (see repo root).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const windows = [60, 30, 7];
  const today = new Date();
  let remindersSent = 0;

  for (const days of windows) {
    const target = new Date(today);
    target.setDate(target.getDate() + days);
    const targetDate = target.toISOString().slice(0, 10);

    const { data } = await supabase
      .from("compliance_items")
      .select("id, label, expires_at, org_id, property_id")
      .eq("expires_at", targetDate);

    for (const item of data ?? []) {
      // In a full build we'd resolve the org owner's email; placeholder here.
      await sendEmail({
        to: process.env.SENDGRID_FROM_EMAIL ?? "hello@lintel.app",
        subject: `Reminder: ${(item as any).label} expires in ${days} days`,
        html: `<p>Your compliance item <strong>${(item as any).label}</strong> expires on ${(item as any).expires_at}.</p>`,
      });
      remindersSent++;
    }
  }

  return NextResponse.json({ ok: true, remindersSent });
}
