import { requireWriter, loadEntitlements } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PLAN, FULLY_LOADED_PRICE, TRIAL_PERIOD_DAYS, priceIdFor } from "@/lib/stripe/config";
import { gbp } from "@/lib/format";
import { fmtDate } from "@/lib/dates";
import { toggleAddon, startCheckout, openBillingPortal } from "../actions";

export const dynamic = "force-dynamic";

const ADDONS = ["voice", "tenant_portal", "maintenance_portal"] as const;

const BLURB: Record<string, string> = {
  voice: "Log income and expenses, query your portfolio and draft tenant messages by voice or text — always with a confirm step.",
  tenant_portal: "Give each tenant a secure login to see rent, documents and report repairs.",
  maintenance_portal: "Triage repairs, assign contractors and track SLAs from the dashboard.",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { checkout?: string };
}) {
  const { orgId, role } = await requireWriter();
  const isAdmin = role === "owner" || role === "admin";
  const ent = await loadEntitlements(orgId);

  const supabase = createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, trial_ends_at, current_period_end, stripe_subscription_id")
    .eq("org_id", orgId)
    .maybeSingle();

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY && priceIdFor("core"));
  const subscribed = Boolean(sub?.stripe_subscription_id);
  const monthly =
    PLAN.core.pricePerMonth +
    ADDONS.reduce((s, f) => s + (ent[f] ? PLAN[f].pricePerMonth : 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan & add-ons"
        subtitle={stripeConfigured ? "Manage your subscription and add-ons." : "Switch features on or off. Changes apply immediately."}
        action={<Badge tone="mint">{gbp(monthly, { decimals: true })}/mo</Badge>}
      />

      {sub?.status === "trialing" && (
        <Card className="border-mint/40">
          <CardBody>
            <p className="text-sm text-evergreen">
              You&apos;re on your free trial — every add-on is on{sub.trial_ends_at ? ` until ${fmtDate(sub.trial_ends_at)}` : ""}.
              Keep the tools you use and switch off the rest before your trial ends; you&apos;ll only be billed for what you keep.
            </p>
          </CardBody>
        </Card>
      )}

      {searchParams?.checkout === "success" && (
        <Card className="border-mint/40">
          <CardBody><p className="text-sm text-evergreen">Subscription started — it can take a few seconds for add-ons to switch on.</p></CardBody>
        </Card>
      )}
      {searchParams?.checkout === "cancelled" && (
        <Card className="border-amber/40">
          <CardBody><p className="text-sm text-slate">Checkout cancelled — nothing was charged.</p></CardBody>
        </Card>
      )}

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

      {stripeConfigured && subscribed && isAdmin && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-semibold tracking-tight">Manage billing</h3>
              <p className="mt-1 text-xs text-slate">Update your card, add or remove add-ons, view invoices or cancel — in the secure Stripe portal.</p>
            </div>
            <form action={openBillingPortal}><Button type="submit">Manage billing &amp; add-ons</Button></form>
          </CardBody>
        </Card>
      )}

      {stripeConfigured && !subscribed && isAdmin ? (
        <form action={startCheckout}>
          <h2 className="mb-3 font-heading text-sm font-semibold tracking-tight text-ink">Choose add-ons & start your {TRIAL_PERIOD_DAYS}-day free trial</h2>
          <div className="space-y-3">
            {ADDONS.map((f) => (
              <Card key={f}>
                <CardBody>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" name="addon" value={f} className="mt-1 h-4 w-4 rounded border-hairline text-evergreen focus:ring-evergreen/30" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-heading text-sm font-semibold tracking-tight">{PLAN[f].label}</span>
                        <span className="font-heading text-sm font-semibold tnum">+{gbp(PLAN[f].pricePerMonth, { decimals: true })}<span className="text-xs font-normal text-slate">/mo</span></span>
                      </span>
                      <span className="mt-1 block text-xs text-slate">{BLURB[f]}</span>
                    </span>
                  </label>
                </CardBody>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button type="submit">Start {TRIAL_PERIOD_DAYS}-day free trial</Button>
            <span className="text-xs text-slate">Card captured, no charge until day {TRIAL_PERIOD_DAYS + 1}. Cancel anytime.</span>
          </div>
        </form>
      ) : (
        <div>
          <h2 className="mb-3 font-heading text-sm font-semibold tracking-tight text-ink">Add-ons</h2>
          <div className="space-y-3">
            {ADDONS.map((f) => {
              const on = ent[f];
              const portalManaged = stripeConfigured && subscribed;
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
                        {isAdmin && !portalManaged && (
                          <form action={toggleAddon} className="mt-2">
                            <input type="hidden" name="feature" value={f} />
                            <input type="hidden" name="active" value={(!on).toString()} />
                            <Button type="submit" variant={on ? "outline" : "primary"} size="sm">{on ? "Turn off" : "Turn on"}</Button>
                          </form>
                        )}
                        {portalManaged && <p className="mt-2 text-xs text-slate">via Stripe</p>}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate">
        Fully loaded is {gbp(FULLY_LOADED_PRICE, { decimals: true })}/mo.{" "}
        {stripeConfigured
          ? "Add-ons are billed monthly with proration through Stripe."
          : "Card billing through Stripe connects once the STRIPE_* env vars are set; for now add-ons toggle instantly."}
        {!isAdmin && " Only an owner or admin can change the plan."}
      </p>
    </div>
  );
}
