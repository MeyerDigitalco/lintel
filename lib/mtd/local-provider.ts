import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import type { MtdProvider, QuarterlyPeriod, QuarterlySummary } from "./index";

/**
 * Local MTD provider — computes quarterly summaries from the local ledger.
 * Cannot submit to HMRC until recognition is granted (canSubmit() === false).
 */
export class LocalMtdProvider implements MtdProvider {
  canSubmit() {
    return false; // No "file to HMRC" until HMRC recognition is granted.
  }

  async buildQuarterlySummary(
    orgId: string,
    period: QuarterlyPeriod
  ): Promise<QuarterlySummary> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("transactions")
      .select("direction, amount, sa105_category, occurred_on")
      .eq("org_id", orgId)
      .gte("occurred_on", period.startDate)
      .lte("occurred_on", period.endDate);

    const rows = data ?? [];
    let income = 0;
    let expenses = 0;
    let financeCosts = 0;

    for (const r of rows as Array<{
      direction: string;
      amount: number;
      sa105_category: string | null;
    }>) {
      const amt = Number(r.amount) || 0;
      if (r.direction === "income") {
        income += amt;
      } else if (r.sa105_category === "finance_costs") {
        // Section 24: tracked separately, gives a 20% basic-rate tax reducer.
        financeCosts += amt;
      } else {
        expenses += amt;
      }
    }

    return {
      period,
      income,
      expenses,
      financeCosts,
      net: income - expenses, // finance costs excluded from the deduction
    };
  }
}

export const mtdProvider = new LocalMtdProvider();
