import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PLAN, TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";
import { detectCurrency } from "@/lib/i18n/geo";
import { formatMoney } from "@/lib/i18n/currency";
import { localPrice, priceDecimals } from "@/lib/i18n/pricing";

const REGIONS = [
  { name: "United Kingdom", detail: "England · Wales · Scotland · Northern Ireland", note: "MTD-ready records, SA105 mapping and jurisdiction-correct compliance.", status: "Live" },
  { name: "United States", detail: "All 50 states", note: "State-aware leases and deposits, Schedule E-ready income & expense records.", status: "New" },
  { name: "Middle East", detail: "UAE · Dubai · GCC", note: "Ejari-friendly tenancy records, cheque rent schedules and VAT-ready expenses.", status: "New" },
  { name: "South Africa", detail: "All provinces", note: "Lease and deposit tracking aligned to the Rental Housing Act.", status: "New" },
  { name: "Australia", detail: "All states & territories", note: "State bond authorities, condition reports and ATO-ready records.", status: "New" },
  { name: "New Zealand", detail: "Nationwide", note: "Healthy Homes Standards, Tenancy Services bonds and IR3 records.", status: "New" },
  { name: "Canada", detail: "All provinces", note: "Provincial tenancy boards, deposit rules and T776 records.", status: "New" },
  { name: "Ireland", detail: "Nationwide", note: "RTB registration, minimum standards and Rent Pressure Zone caps.", status: "New" },
  { name: "Germany", detail: "All Bundesländer", note: "BGB tenancy, Kaution in a separate account and Mietspiegel rent index.", status: "New" },
  { name: "Spain", detail: "All regions", note: "LAU leases, fianza lodgement and IRPF-ready records.", status: "New" },
  { name: "India", detail: "Major states", note: "Model Tenancy Act agreements, registration and TDS-ready records.", status: "New" },
  { name: "France", detail: "All régions", note: "Loi 1989 baux, dépôt de garantie and DPE diagnostics.", status: "New" },
  { name: "Netherlands", detail: "All provinces", note: "WWS points system, energy label and Huurcommissie oversight.", status: "New" },
  { name: "Singapore", detail: "Nationwide", note: "Stamped tenancy agreements, HDB rules and IRAS-ready records.", status: "New" },
];

const FEATURES = [
  {
    title: "Tax-ready record-keeping",
    body: "Income, expenses, receipts and mileage — organised and export-ready for your accountant or tax filing. SA105 in the UK, Schedule E in the US, VAT-ready in the Gulf.",
  },
  {
    title: "Rent, arrears & documents",
    body: "Log rent and flag arrears by age, then keep every certificate, lease and receipt in one searchable vault with expiry reminders before anything lapses.",
  },
  {
    title: "Compliance, localised",
    body: "Lintel tracks exactly what your country and region require — and a landlord in one place never sees a field meant for another.",
  },
];

export default function HomePage() {
  const currency = detectCurrency();
  const dec = priceDecimals(currency);
  const money = (n: number) => formatMoney(n, currency, { decimals: dec });
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-slate">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Landlord software for the UK, USA, Middle East &amp; South Africa
          </span>
          <h1 className="mt-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Your whole rental portfolio, in one calm place.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate">
            Lintel keeps your tax records, compliance, rent and documents organised —
            tuned to your country&apos;s rules. Start with every tool switched on, free for{" "}
            {TRIAL_PERIOD_DAYS} days. After that, keep only what you love.
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
            Everything included free for {TRIAL_PERIOD_DAYS} days. No charge until day {TRIAL_PERIOD_DAYS + 1}. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Free month band */}
      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
              One free month. Everything switched on.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate">
              No tiers to choose on day one. Every feature — voice assistant, tenant portal,
              maintenance, documents, reports — is on from the moment you sign up. When your
              {" "}{TRIAL_PERIOD_DAYS} days are up, a single screen lets you keep what you use and switch off the rest.
              Most landlords keep the lean core and a couple of add-ons.
            </p>
          </div>
          <Card className="border-evergreen/30">
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-slate">During your free month</p>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                <li className="flex items-center gap-2"><span className="text-evergreen">✓</span> Tax records, rent ledger &amp; arrears</li>
                <li className="flex items-center gap-2"><span className="text-evergreen">✓</span> Compliance vault &amp; document storage</li>
                <li className="flex items-center gap-2"><span className="text-evergreen">✓</span> Voice assistant &amp; receipt scanning</li>
                <li className="flex items-center gap-2"><span className="text-evergreen">✓</span> Tenant portal &amp; maintenance</li>
                <li className="flex items-center gap-2"><span className="text-evergreen">✓</span> Reports, tasks &amp; court-readiness</li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Honest, modular, low-cost.
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardBody>
                <h3 className="font-heading text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-slate">{f.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Regions */}
      <section id="regions" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Correct in every market.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Pick your country and region per property. Lintel loads the right currency, tenancy
          type, compliance items and tax framing — so the app speaks your jurisdiction, not a generic one.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REGIONS.map((r) => (
            <Card key={r.name}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-semibold tracking-tight">{r.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "Live" ? "bg-mint/15 text-evergreen" : "bg-ink/5 text-slate"}`}>
                    {r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate">{r.detail}</p>
                <p className="mt-3 text-xs text-slate">{r.note}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink">
          Free for a month. Then only what you keep.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Every tool is included free for {TRIAL_PERIOD_DAYS} days. After that, keep the always-on core and
          add only the modules you actually use. Prices shown in your local currency.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-evergreen/30">
            <CardBody>
              <p className="text-sm text-slate">Core — always on after your trial</p>
              <p className="mt-1 font-heading text-3xl font-semibold tracking-tight">
                {money(localPrice("core", currency))}
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
              <p className="text-sm text-slate">Optional add-ons (free during trial)</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[PLAN.voice, PLAN.tenant_portal, PLAN.maintenance_portal].map((p) => (
                  <li key={p.feature} className="flex justify-between border-b border-hairline pb-2 last:border-0">
                    <span className="text-ink">{p.label}</span>
                    <span className="text-slate">+{money(localPrice(p.feature, currency))}/mo</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate">Keep, drop or re-add any add-on at any time.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
