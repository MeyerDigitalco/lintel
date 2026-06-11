import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  MtdProvider,
  QuarterlyPeriod,
  QuarterlySummary,
  ObligationPeriod,
  SubmissionResult,
} from "@/lib/mtd";
import { HMRC_BASE_URL, MTD_HMRC_RECOGNISED } from "./config";
import { buildFraudHeaders, type ClientContext } from "./fraud-headers";
import { buildPeriodSummary, type LedgerLine } from "./mapping";
import { refreshTokens } from "./oauth";

/**
 * HMRC MTD ITSA provider. Implements the real submission journey behind the
 * shared MtdProvider interface. `canSubmit()` is gated on HMRC recognition, so
 * even when this provider is active the UI will not offer filing until the
 * recognition flag is set.
 */
export class HmrcMtdProvider implements MtdProvider {
  constructor(private clientContext: ClientContext = {}) {}

  canSubmit(): boolean {
    return MTD_HMRC_RECOGNISED;
  }

  async buildQuarterlySummary(
    orgId: string,
    period: QuarterlyPeriod
  ): Promise<QuarterlySummary> {
    const lines = await this.ledgerLines(orgId, period.startDate, period.endDate);
    let income = 0;
    let expenses = 0;
    let financeCosts = 0;
    for (const l of lines) {
      if (l.direction === "income") income += l.amount;
      else if (l.sa105_category === "finance_costs") financeCosts += l.amount;
      else expenses += l.amount;
    }
    return { period, income, expenses, financeCosts, net: income - expenses };
  }

  async getObligations(orgId: string, taxYear: string): Promise<ObligationPeriod[]> {
    const { nino, businessId } = await this.connection(orgId);
    const json = await this.call(
      orgId,
      "GET",
      `/obligations/details/${nino}/income-and-expenditure?typeOfBusiness=uk-property&taxYear=${taxYear}&businessId=${businessId}`
    );
    const obligations = json?.obligations?.[0]?.obligationDetails ?? [];
    return obligations.map((o: any) => ({
      periodKey: o.periodKey ?? `${o.periodStartDate}_${o.periodEndDate}`,
      startDate: o.periodStartDate,
      endDate: o.periodEndDate,
      dueDate: o.dueDate,
      status: o.status === "Fulfilled" ? "Fulfilled" : "Open",
    }));
  }

  async submitQuarterlyUpdate(
    orgId: string,
    period: QuarterlyPeriod
  ): Promise<SubmissionResult> {
    if (!this.canSubmit()) {
      return { ok: false, message: "HMRC recognition not yet granted." };
    }
    const { nino, businessId } = await this.connection(orgId);
    const lines = await this.ledgerLines(orgId, period.startDate, period.endDate);
    const body = buildPeriodSummary(period.startDate, period.endDate, lines);

    const json = await this.call(
      orgId,
      "POST",
      `/individuals/business/property/uk/${nino}/${businessId}/period`,
      body
    );
    return { ok: true, reference: json?.submissionId };
  }

  async submitFinalDeclaration(
    orgId: string,
    taxYear: string
  ): Promise<SubmissionResult> {
    if (!this.canSubmit()) {
      return { ok: false, message: "HMRC recognition not yet granted." };
    }
    const { nino } = await this.connection(orgId);
    // Crystallisation: intent-to-crystallise then final declaration. Simplified.
    await this.call(
      orgId,
      "POST",
      `/individuals/calculations/${nino}/self-assessment/${taxYear}/${taxYear}/final-declaration`
    );
    return { ok: true };
  }

  // --- internals -----------------------------------------------------------

  private async ledgerLines(
    orgId: string,
    from: string,
    to: string
  ): Promise<LedgerLine[]> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("transactions")
      .select("direction, amount, sa105_category, occurred_on")
      .eq("org_id", orgId)
      .gte("occurred_on", from)
      .lte("occurred_on", to);
    return (data ?? []).map((t: any) => ({
      direction: t.direction,
      amount: Number(t.amount) || 0,
      sa105_category: t.sa105_category,
    }));
  }

  private async connection(orgId: string) {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("hmrc_connections")
      .select("nino, business_id")
      .eq("org_id", orgId)
      .maybeSingle();
    if (!data?.nino || !data?.business_id) {
      throw new Error("HMRC not connected for this org.");
    }
    return { nino: data.nino, businessId: data.business_id };
  }

  /** Authenticated HMRC call with token refresh + fraud-prevention headers. */
  private async call(orgId: string, method: string, path: string, body?: unknown) {
    const token = await this.accessToken(orgId);
    const res = await fetch(`${HMRC_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.hmrc.2.0+json",
        "Content-Type": "application/json",
        ...buildFraudHeaders(this.clientContext),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`HMRC ${method} ${path} failed ${res.status}: ${await res.text()}`);
    }
    return res.status === 204 ? null : res.json();
  }

  private async accessToken(orgId: string): Promise<string> {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("hmrc_connections")
      .select("access_token, refresh_token, expires_at")
      .eq("org_id", orgId)
      .maybeSingle();
    if (!data?.access_token) throw new Error("HMRC not connected.");

    const expired = data.expires_at && new Date(data.expires_at) <= new Date();
    if (expired && data.refresh_token) {
      const refreshed = await refreshTokens(data.refresh_token);
      const expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
      await supabase
        .from("hmrc_connections")
        .update({
          access_token: refreshed.accessToken,
          refresh_token: refreshed.refreshToken,
          expires_at: expiresAt,
        })
        .eq("org_id", orgId);
      return refreshed.accessToken;
    }
    return data.access_token;
  }
}
