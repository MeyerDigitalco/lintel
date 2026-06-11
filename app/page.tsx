import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { listJurisdictions } from "@/lib/jurisdictions";
import { PLAN, FULLY_LOADED_PRICE, TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";
import { gbp } from "@/lib/format";

export default function HomePage() {
  const jurisdictions = listJurisdictions();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-slate">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Built for Making Tax Digital · England · Wales · Scotland · NI
          </span>
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            The calm way to run a UK rental portfolio.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate">
            Lintel keeps a digital tax record for Making Tax Digital, then lets
            you switch on only the tools you want. Jurisdiction-correct from day
            one — a Welsh landlord never sees an English-only field.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start your {TRIAL_PERIOD_DAYS}-day free trial</Button>
            </Link>
            <Link href="/calculators">
              <Button variant="outline" size="lg">Try the calculators</Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate">
            Card captured, no charge until day {TRIAL_PERIOD_DAYS + 1}. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Honest, modular, low-cost.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Digital tax record-keeping",
              body: "Income and expenses mapped to SA105, receipt OCR, mileage, and Section 24 finance-cost handling. Quarterly summaries and a year-end declaration preview.",
            },
            {
              title: "Log-only rent ledger",
              body: "Mark rent due and received, generate receipts, auto-flag arrears by age. No bank linking, no card processing — your data stays simple and yours.",
            },
            {
              title: "Jurisdiction-aware compliance",
              body: "The compliance vault tracks exactly what your nation requires, with reminders at 60, 30 and 7 days before anything expires.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardBody>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate">{f.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Jurisdictions */}
      <section id="jurisdictions" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Correct in every nation.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Pick a nation per property. Lintel loads the right tenancy type,
          compliance items, notices and registration fields.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jurisdictions.map((j) => (
            <Card key={j.key}>
              <CardBody>
                <h3 className="font-heading text-base font-semibold tracking-tight">
                  {j.name}
                </h3>
                <p className="mt-1 text-xs text-slate">{j.governingLaw}</p>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate">Tenancy</dt>
                    <dd className="text-right text-ink">{j.tenancyTypes[0].label}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate">Registration</dt>
                    <dd className="text-right text-ink">
                      {j.landlordRegistrationScheme ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate">Right to Rent</dt>
                    <dd className="text-right text-ink">{j.rightToRent ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Start cheap. Add only what you need.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-evergreen/30">
            <CardBody>
              <p className="text-sm text-slate">Core — always on</p>
              <p className="mt-1 font-heading text-3xl font-semibold tracking-tight tnum">
                {gbp(PLAN.core.pricePerMonth, { decimals: true })}
                <span className="text-base font-normal text-slate">/mo</span>
              </p>
              <p className="mt-2 text-sm text-slate">{PLAN.core.label}</p>
              <Link href="/signup" className="mt-5 inline-block">
                <Button>Start free trial</Button>
              </Link>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-slate">Optional add-ons</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[PLAN.voice, PLAN.tenant_portal, PLAN.maintenance_portal].map((p) => (
                  <li key={p.feature} className="flex justify-between border-b border-hairline pb-2 last:border-0">
                    <span className="text-ink">{p.label}</span>
                    <span className="tnum text-slate">
                      +{gbp(p.pricePerMonth, { decimals: true })}/mo
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate">
                Fully loaded:{" "}
                <span className="font-medium text-ink tnum">
                  {gbp(FULLY_LOADED_PRICE, { decimals: true })}/mo
                </span>
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
