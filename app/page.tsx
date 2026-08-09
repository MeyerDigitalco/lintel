import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { CallbackForm } from "@/components/site/CallbackForm";
import { issueFormToken } from "@/lib/spam";

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

/**
 * Rendered per request, not at build time. The callback form carries a signed
 * token minted at render; a statically generated page would freeze that token
 * and every visitor would be told the form had expired.
 */
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lintelsquared.com";

export const metadata = {
  title: "UK landlord software: tax, compliance, rent & agreements",
  description:
    "Lintel Squared keeps tax records, compliance, rent and tenancy agreements in one place for UK landlords, with the right rules for England, Scotland, Wales and Northern Ireland. Free until 31 August 2026.",
  alternates: { canonical: "/" },
};

// Structured data helps Google understand what Lintel is and can earn a richer
// result. SoftwareApplication is the right type for a SaaS product.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lintel Squared",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: APP_URL,
  description:
    "Property management software for UK landlords: tax records, compliance tracking, rent, documents and region-aware tenancy agreements.",
  areaServed: "GB",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Free for all users until 31 August 2026.",
  },
};

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
  // Minted per render, so a scraped copy of the page expires.
  const formToken = issueFormToken();

  return (
    <div className="min-h-screen bg-bone">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <SiteHeader />

      {/* Hero + callback, side by side. The form is above the fold on purpose. */}
      <section className="border-b border-sepia">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-20">
          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
              Property management for UK landlords
            </div>
            <h1 className="display mt-5 text-[2.9rem] text-char md:text-[4rem]">
              One platform.
              <br />
              <span className="text-clay">Everything handled.</span>
            </h1>
            <p className="mt-6 max-w-[44ch] text-[19px] leading-relaxed text-char/80">
              Lintel looks after the agreements, the deadlines, the rent and the record keeping so
              you can run your whole portfolio from one place.
            </p>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-umber">
              Built for the way letting works in England, Scotland, Wales and Northern Ireland, with
              the right rules for each nation applied automatically.
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
            <CallbackForm token={formToken} />
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

      {/* Reach, UK-focused: the four nations, not a country count. */}
      <section id="regions" className="border-y border-sepia bg-char">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="display max-w-[20ch] text-[2.1rem] text-bone md:text-[2.9rem]">
            Correct in all four UK nations.
          </h2>
          <p className="mt-6 max-w-[54ch] text-[18px] leading-relaxed text-bone/75">
            Tenancy law and compliance duties are not the same across the UK. An assured periodic
            tenancy in England is an occupation contract in Wales and a private residential tenancy
            in Scotland. Lintel applies the right rules for each property, so you do not have to
            keep track of which nation changed what.
          </p>
          <div className="mt-12 grid gap-8 border-t border-bone/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "England", d: "Renters' Rights Act, assured periodic tenancies" },
              { n: "Scotland", d: "Private residential tenancies, First-tier Tribunal" },
              { n: "Wales", d: "Occupation contracts, Renting Homes (Wales) Act" },
              { n: "Northern Ireland", d: "Private tenancies, rent books, deposit rules" },
            ].map((x) => (
              <div key={x.n}>
                <div className="font-display text-[22px] leading-tight text-bone">{x.n}</div>
                <p className="mt-2 text-[15px] leading-relaxed text-bone/65">{x.d}</p>
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
          <CallbackForm id="callback-bottom" token={formToken} />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
