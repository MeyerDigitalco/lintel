import { requireWriter } from "@/lib/auth";
import { loadEntitlements } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PLAN, FULLY_LOADED_PRICE } from "@/lib/stripe/config";
import { gbp } from "@/lib/format";
import { fmtDate } from "@/lib/dates";
import { toggleAddon } from "../actions";

export const dynamic = "force-dynamic";

const ADDONS = ["voice", "tenant_portal", "maintenance_portal"] as const;

const BLURB: Record<string, string> = {
  voice: "Log income and expenses, query your portfolio and draft tenant messages by voice or text — always with a confirm step.",
  tenant_portal: "Give each tenant a secure login to see rent, documents and report repairs.",
  maintenance_portal: "Triage repairs, assign contractors and track SLAs from the dashboard.",
};

export default async function BillingPage() {
  const { orgId, role } = await requireWriter();
  const isAdmin = role === "owner" || role === "admin";
  const ent = await loadEntitlements(orgId);

  const supabase = createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end")
    .eq("org_id", orgId)
    .maybeSingle();

  const activeAddons = ADDONS.filter((f) => ent[f]).length;
  const monthly = PLAN.core.pricePerMonth + ADDONS.reduce((s, f) => s + (ent[f] ? PLAN[f].pricePerMonth : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan & add-ons"
        subtitle="Switch features on or off. Changes apply immediately."
        action={<Badge tone="mint">{gbp(monthly, { decimals: true })}/mo</Badge>}
      />

      <Card className="border-evergreen/30">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold tracking-tight">Core — {PLAN.core.label}</h2>
              <p className="mt-1 text-xs text-slate">Always on. Properties, tax record-keeping, rent ledger, compliance and reports.</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-semibold tnum">{gbp(PLAN.core.pricePerMonth, { decimals: true })}<span className="text-xs font-normal text-slate">/mo</span></p>
              <Badge tone="mint">Included</Badge>
            </div>
          </div>
          {sub && (
            <p className="mt-3 border-t border-hairline pt-3 text-xs text-slate">
              Subscription status: <span className="text-ink">{sub.status}</span>
              {sub.trial_ends_at ? ` · trial ends ${fmtDate(sub.trial_ends_at)}` : ""}
              {sub.current_period_end ? ` · renews ${fmtDate(sub.current_period_end)}` : ""}
            </p>
          )}
        </CardBody>
      </Card>

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold tracking-tight text-ink">Add-ons</h2>
        <div className="space-y-3">
          {ADDONS.map((f) => {
            const on = ent[f];
            return (
              <Card key={f}>
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-sm font-semibold tracking-tight">{PLAN[f].label}</h3>
                        {on ? <Badge tone="mint">On</Badge> : <Badge>Off</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-slate">{BLURB[f]}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-heading text-sm font-semibold tnum">+{gbp(PLAN[f].pricePerMonth, { decimals: true })}<span className="text-xs font-normal text-slate">/mo</span></p>
                      {isAdmin && (
                        <form action={toggleAddon} className="mt-2">
                          <input type="hidden" name="feature" value={f} />
                          <input type="hidden" name="active" value={(!on).toString()} />
                          <Button type="submit" variant={on ? "outline" : "primary"} size="sm">
                            {on ? "Turn off" : "Turn on"}
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate">
        {activeAddons === ADDONS.length
          ? `Fully loaded — ${gbp(FULLY_LOADED_PRICE, { decimals: true })}/mo.`
          : `Fully loaded would be ${gbp(FULLY_LOADED_PRICE, { decimals: true })}/mo.`}
        {" "}Card billing through Stripe connects later; for now add-ons toggle instantly.
        {!isAdmin && " Only an owner or admin can change the plan."}
      </p>
    </div>
  );
}
