import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PLAN, TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";
import { detectCurrency, detectCountry } from "@/lib/i18n/geo";
import { formatMoney, CURRENCIES } from "@/lib/i18n/currency";
import { localPrice, priceDecimals } from "@/lib/i18n/pricing";
import { COUNTRIES } from "@/lib/i18n/regions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

const FEATURES = [
  { title: "Tax-ready record-keeping", body: "Income, expenses, receipts and mileage — organised and export-ready for your accountant or filing. SA105, Schedule E, VAT, ITR12 and more, by country." },
  { title: "Rent & arrears tracking", body: "Log rent due and received, generate receipts, and auto-flag arrears by age. No bank links, no card processing — your data stays simple and yours." },
  { title: "Compliance, on autopilot", body: "The right certificates for your country are auto-added to each property, with reminders at 60, 30 and 7 days before anything expires." },
  { title: "Court-readiness score", body: "See exactly how evidence-ready each tenancy is — deposit, certificates, notices, registration — and a checklist of what to fix before it matters." },
  { title: "Documents vault + AI", body: "Every lease, certificate and receipt in one searchable place. Uploads are auto-summarised and auto-filed — even the expiry dates are read for you." },
  { title: "Tenant portal & maintenance", body: "Give tenants a private link or login to see rent and documents and report repairs with photos — straight into your maintenance queue." },
  { title: "Voice & receipt scanning", body: "Snap a receipt to log an expense, or just say what happened. Always with a confirm step — never autonomous." },
  { title: "iPhone & Android app", body: "A native mobile app for life on the go: report repairs, scan receipts, check compliance and rent from your pocket." },
];

const FAQ = [
  { q: "Do I need a card to start?", a: "No card needed. Every feature is free for everyone until 31 August 2026 — just sign up and start." },
  { q: "Which countries do you support?", a: `${COUNTRIES.length}+ countries across the UK, US, Europe, the Middle East, Africa, Asia and Oceania — each with the correct currency, tenancy rules, compliance items and tax framing.` },
  { q: "Is my data private?", a: "Yes. Every account is isolated with row-level security, and your portfolio data is never shared or sold." },
  { q: "What happens after 31 August 2026?", a: "We'll share simple pricing well before then. Nothing is charged automatically, and you'll always be able to export or delete your data." },
  { q: "Can my accountant get involved?", a: "Yes — invite them to a read-only seat with an accountant pack and export, so they see exactly what they need and nothing they shouldn't." },
];

export default function HomePage() {
  const currency = detectCurrency();
  const country = detectCountry();
  const dec = priceDecimals(currency);
  const money = (n: number) => formatMoney(n, currency, { decimals: dec });
  const corePrice = money(localPrice("core", currency));
  const currencyCount = Object.keys(CURRENCIES).length;
  const langCount = Object.keys(LANGUAGES).length;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-mint/8 via-paper to-paper" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-slate">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            Expanding to {COUNTRIES.length} countries · {currencyCount} currencies · {langCount} languages
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-semibold leading-[1.04] tracking-tight text-ink md:text-6xl">
            Run your rentals like a pro — anywhere in the world.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate">
            Lintel keeps your tax records, compliance, rent, documents and tenants in one calm place —
            tuned to your country&apos;s rules. Every feature is free for everyone until 31 August 2026.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup"><Button size="lg">Start free — no card needed</Button></Link>
            <Link href="#pricing"><Button variant="outline" size="lg">See pricing</Button></Link>
          </div>
          <p className="mt-3 text-xs text-slate">Every feature free for everyone until 31 August 2026 · no card needed</p>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lintel border border-hairline bg-hairline text-center sm:grid-cols-4">
            {[
              [`${COUNTRIES.length}`, "Countries, expanding"],
              [`${currencyCount}`, "Currencies"],
              [`${langCount}`, "Languages"],
              ["Free", "until 31 Aug 2026"],
            ].map(([n, l]) => (
              <div key={l} className="bg-surface px-4 py-5">
                <p className="font-heading text-2xl font-semibold text-evergreen">{n}</p>
                <p className="mt-1 text-xs text-slate">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">Everything a landlord needs. Nothing they don&apos;t.</h2>
          <p className="mt-3 text-slate">One workspace replaces the spreadsheets, the folder of certificates, the chasing and the guesswork — and it speaks your jurisdiction, not a generic one.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="h-full">
              <CardBody>
                <h3 className="font-heading text-base font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-slate">{f.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Free month */}
      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">Free until 31 August 2026. Everything switched on.</h2>
            <p className="mt-3 max-w-xl text-slate">
              No tiers, no card, nothing to puzzle over. Voice assistant, tenant portal, maintenance, documents and reports —
              every feature is on the moment you sign up, and completely free for everyone until 31 August 2026.
            </p>
            <div className="mt-6"><Link href="/signup"><Button>Get started — it&apos;s free</Button></Link></div>
          </div>
          <Card className="border-evergreen/30">
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-slate">Included free for everyone</p>
              <ul className="mt-3 space-y-2 text-sm text-ink">
                {["Tax records, rent & arrears", "Compliance vault & reminders", "Voice assistant & receipt scanning", "Tenant portal & maintenance", "Reports, tasks & court-readiness", "iPhone & Android app"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><span className="text-mint">✓</span> {x}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Court-readiness differentiator */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Card>
          <CardBody>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wide text-mint">The Lintel difference</span>
                <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-ink">Always know if you&apos;re ready for court.</h2>
                <p className="mt-3 text-slate">
                  Most tools tell you a certificate expired. Lintel scores every tenancy on how evidence-ready it is —
                  deposit protected in time, prescribed documents served, certificates in date, registration valid —
                  and hands you the exact checklist to fix, before it ever matters.
                </p>
              </div>
              <div className="shrink-0 rounded-lintel border border-hairline bg-paper p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-slate">Court-readiness</p>
                <p className="mt-1 font-heading text-5xl font-semibold tabular-nums text-evergreen">92</p>
                <p className="mt-1 text-xs text-slate">/ 100 · Strong</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Global */}
      <section id="regions" className="border-y border-hairline bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">Correct in every market.</h2>
          <p className="mt-3 max-w-2xl text-slate">
            Pick your country and region per property. Lintel loads the right currency, tenancy type, compliance items,
            notice templates and tax framing — expanding to {COUNTRIES.length} countries and counting.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <span key={c.code} className="rounded-full border border-hairline bg-paper px-3 py-1 text-sm text-slate">{c.name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-5 py-16">
        <span className="text-xs font-semibold uppercase tracking-wide text-mint">Security &amp; privacy</span>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-ink">Your information is protected.</h2>
        <p className="mt-3 max-w-2xl text-slate">
          You&apos;re trusting Lintel with tenancy, financial and tax records. We treat that seriously, with bank-grade
          infrastructure and strict access controls on every account.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Encrypted end to end", "Every connection runs over HTTPS/TLS, and your data is stored in an encrypted, access-controlled database."],
            ["Your data is isolated", "Row-level security walls off each landlord&apos;s records — other customers and unauthorised staff can never see them."],
            ["Least-access sharing", "Tenants and contractors only ever see the single tenancy or job you share with them, through links you can revoke anytime."],
            ["Reliable, backed-up infrastructure", "Your data lives on managed cloud infrastructure with regular encrypted backups and high availability."],
            ["You stay in control", "Export your records or permanently delete your account and its data whenever you choose."],
            ["Court-ready audit trail", "Key actions are timestamped and logged, so your evidence stands up when it matters."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lintel border border-hairline bg-surface p-5">
              <h3 className="font-heading text-base font-semibold tracking-tight text-ink" dangerouslySetInnerHTML={{ __html: title }} />
              <p className="mt-2 text-sm text-slate" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-2xl">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">Free for everyone until 31 August 2026.</h2>
          <p className="mt-3 text-slate">Every tool — core and add-ons — is completely free to use until 31 August 2026. No card required to start.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="border-evergreen/30">
            <CardBody>
              <p className="text-sm text-slate">Core — included free until 31 Aug 2026</p>
              <p className="mt-1 font-heading text-4xl font-semibold tracking-tight">{corePrice}<span className="text-base font-normal text-slate">/mo</span></p>
              <p className="mt-2 text-sm text-slate">{PLAN.core.label}</p>
              <Link href="/signup" className="mt-6 inline-block"><Button size="lg">Start free</Button></Link>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-slate">Optional add-ons (free until 31 Aug 2026)</p>
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

      {/* FAQ */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-ink">Questions, answered.</h2>
          <div className="mt-8 divide-y divide-hairline">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-ink">{f.q}</summary>
                <p className="mt-2 text-sm text-slate">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">Your whole portfolio, finally in one calm place.</h2>
        <p className="mx-auto mt-4 max-w-xl text-slate">Start free today. Set up your first property in minutes, with everything switched on.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup"><Button size="lg">Start free — no card needed</Button></Link>
          <Link href="/calculators"><Button variant="outline" size="lg">Try the calculators</Button></Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
