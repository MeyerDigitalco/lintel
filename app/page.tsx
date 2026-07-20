import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { CallbackForm } from "@/components/site/CallbackForm";
import { COUNTRIES } from "@/lib/i18n/regions";

/**
 * Public home page.
 *
 * Deliberately thin on detail. Competitors have been lifting our feature list
 * and roadmap wholesale, so the page now sells the outcome and routes serious
 * interest to a human conversation instead of publishing a specification for
 * anyone to copy. Specifics live behind the callback, not on the page.
 *
 * Type is set larger and heavier than the previous draft: the smallest body
 * text here is 16px, and nothing structural sits below 14px.
 */

const PILLARS = [
  {
    title: "The paperwork",
    body: "Tenancy agreements and the documents that must go with them, drawn up for the country your property is actually in.",
  },
  {
    title: "The deadlines",
    body: "Certificates, renewals and registrations tracked for you, with warnings long before anything lapses.",
  },
  {
    title: "The money",
    body: "Rent, arrears and expenses in one ledger, organised the way your tax return needs to see it.",
  },
  {
    title: "The evidence",
    body: "Everything logged and dated, so if a dispute ever reaches a court or tribunal you can prove your position.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader />

      {/* Hero + callback, side by side. The form is above the fold on purpose. */}
      <section className="border-b border-sepia">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-20">
          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
              Property management, {COUNTRIES.length} countries
            </div>
            <h1 className="display mt-5 text-[2.9rem] text-char md:text-[4rem]">
              One platform.
              <br />
              <em className="text-clay">Everything handled.</em>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[19px] leading-relaxed text-char/80">
              Lintel looks after the agreements, the deadlines, the rent and the record keeping for
              landlords, in whichever country the property sits.
            </p>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-umber">
              Most software assumes you let in one place. Lintel knows the rules change at the
              border, and applies the right ones automatically.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link href="#callback">
                <span className="inline-flex h-14 items-center rounded-edge bg-char px-8 text-[17px] font-medium text-bone transition-colors hover:bg-clay">
                  Speak to a partner
                </span>
              </Link>
              <Link
                href="/signup"
                className="border-b-2 border-char pb-0.5 text-[17px] font-medium text-char transition-colors hover:border-clay hover:text-clay"
              >
                Or start free
              </Link>
            </div>
          </div>

          <div className="md:pt-2">
            <CallbackForm />
          </div>
        </div>
      </section>

      {/* Four pillars. Outcomes, not a feature specification. */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="display max-w-[16ch] text-[2.1rem] text-char md:text-[2.8rem]">
          What we take off your hands.
        </h2>
        <div className="mt-12 grid gap-x-14 gap-y-10 border-t border-sepia pt-10 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title}>
              <h3 className="font-display text-[24px] leading-tight text-char">{p.title}</h3>
              <p className="mt-3 max-w-[38ch] text-[17px] leading-relaxed text-umber">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reach, stated plainly without publishing the rules themselves. */}
      <section id="regions" className="border-y border-sepia bg-char">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="display max-w-[20ch] text-[2.1rem] text-bone md:text-[2.9rem]">
            Correct wherever the property is.
          </h2>
          <p className="mt-6 max-w-[52ch] text-[18px] leading-relaxed text-bone/75">
            Tenancy law, compliance duties and tax treatment differ in every market we cover. Lintel
            applies the right ones for each property you own, without you having to know them.
          </p>
          <div className="mt-12 grid gap-10 border-t border-bone/20 pt-10 sm:grid-cols-3">
            {[
              { fig: String(COUNTRIES.length), lab: "Countries covered" },
              { fig: "10", lab: "Languages, including right to left" },
              { fig: "20", lab: "Currencies, formatted locally" },
            ].map((s) => (
              <div key={s.lab}>
                <div className="display text-[3.6rem] leading-none tabular-nums text-bone">{s.fig}</div>
                <p className="mt-3 text-[16px] text-bone/70">{s.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust, kept short. */}
      <section id="security" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <h2 className="display text-[2.1rem] text-char md:text-[2.5rem]">
            Your information is protected.
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { t: "Isolated accounts", b: "Your data is walled off at the database, not just in the interface." },
              { t: "Encrypted throughout", b: "In transit and at rest. Documents are never publicly accessible." },
              { t: "Yours to take", b: "Export or delete everything at any time. Never sold, never shared." },
              { t: "Free until 31 August 2026", b: "Every feature switched on. No card, no tiers, nothing to cancel." },
            ].map((x) => (
              <div key={x.t}>
                <h3 className="font-display text-[20px] text-char">{x.t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-umber">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Second callback, for anyone who scrolled instead of converting. */}
      <section className="border-t border-sepia bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <div className="mb-10 text-center">
            <h2 className="display text-[2.2rem] text-char md:text-[3rem]">
              Let&apos;s talk it through.
            </h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-[18px] leading-relaxed text-umber">
              Tell us a little about your portfolio and a Lintel partner will call you back, show you
              the platform and help you set it up.
            </p>
          </div>
          <CallbackForm id="callback-bottom" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
