import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel } from "@/lib/sa105";
import { quarterlyPeriods } from "@/lib/dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Accountant CSV export of a tax year's transactions (SA105-mapped). */
export async function GET(req: NextRequest) {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const year = Number(req.nextUrl.searchParams.get("year"));
  const yStart = Number.isFinite(year) ? year : new Date().getFullYear();
  const periods = quarterlyPeriods(yStart);

  const { data: tx } = await supabase
    .from("transactions")
    .select("occurred_on, direction, sa105_category, amount, description")
    .eq("org_id", orgId)
    .gte("occurred_on", periods[0].startDate)
    .lte("occurred_on", periods[3].endDate)
    .order("occurred_on", { ascending: true });

  const header = ["Date", "Type", "SA105 category", "Amount", "Description"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const t of tx ?? []) {
    lines.push(
      [
        t.occurred_on,
        t.direction,
        escape(categoryLabel(t.sa105_category)),
        Number(t.amount).toFixed(2),
        escape(t.description ?? ""),
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lintel-tax-pack-${yStart}-${yStart + 1}.csv"`,
    },
  });
}
