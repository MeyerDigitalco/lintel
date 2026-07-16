import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { AtlasHero } from "@/components/site/AtlasHero";
import { heroJurisdictions, heroMoreCount } from "@/lib/i18n/hero-jurisdictions";
import { detectCurrency } from "@/lib/i18n/geo";
import { formatMoney, CURRENCIES } from "@/lib/i18n/currency";
import { localPrice, priceDecimals } from "@/lib/i18n/pricing";
import { COUNTRIES } from "@/lib/i18n/regions";
import { LANGUAGES } from "@/lib/i18n/dictionaries";

/**
 * Public home page, editorial direction.
 *
 * Deliberately avoids the stock SaaS recipe (cool grey, Inter, blue accent,
 * centred hero, 4-up card grid) because that is what every AI site builder
 * emits and our competitors ship the identical page. Rules and asymmetry
 * instead of cards; a serif display face; warm paper; one oxblood accent.
 */

const FEATURES = [
 { n: "01", title: "Tenancy agreements, per region", body: "Draft the agreement itself, with every detail your region actually requires, from deposit schemes and How to Rent in England to Healthy Homes in New Zealand and Ejari in Dubai. Download as PDF or Word, or email it to the tenant." },
 { n: "02", title: "Tax-ready record keeping", body: "Income, expenses, receipts and mileage, organised and export ready for your accountant or filing. SA105, Schedule E, VAT, ITR12 and more, by country." },
 { n: "03", title: "Rent and arrears tracking", body: "Log rent due and received, generate receipts, and auto flag arrears by age. No bank links, no card processing, your data stays simple and yours." },
 { n: "04", title: "Compliance, on autopilot", body: "The right certificates for your country are auto added to each property, with reminders at 60, 30 and 7 days before anything expires." },
 { n: "05", title: "Court readiness score", body: "See exactly how evidence ready each tenancy is, deposit, certificates, notices, registration, and a checklist of what to fix before it matters." },
 { n: "06", title: "Documents vault with AI", body: "Every lease, certificate and receipt in one searchable place. Uploads are auto summarised and auto filed, even the expiry dates are read for you." },
 { n: "07", title: "Tenant portal and maintenance", body: "Give tenants a private link or login to see rent and documents and report repairs with photos, straight into your maintenance queue." },
 { n: "08", title: "Voice and receipt scanning", body: "Snap a receipt to log an expense, or just say what happened. Always with a confirm step, never autonomous." },
 { n: "09", title: "iPhone and Android app", body: "A native mobile app for life on the go: report repairs, scan receipts, check compliance and rent from your pocket." },
];

const FAQ = [
 { q: "Do I need a card to start?", a: "No card needed. Every feature is free for everyone until 31 August 2026, just sign up and start." },
 { q: "Which countries do you support?", a: `${COUNTRIES.length} countries across the UK, US, Europe, the Middle East, Africa, Asia and Oceania, each with the correct currency, tenancy rules, compliance items and tax framing.` },
 { q: "Are the tenancy agreements legally binding?", a: "They are professionally drafted against the law of your region and cite the statute they are built on, but they are a drafting tool and not legal advice. Some regions require an official prescribed form, and we tell you when yours does and link you to it. Have any agreement checked by a lawyer where you let before you rely on it." },
 { q: "Is my data private?", a: "Yes. Every account is isolated with row level security, and your portfolio data is never shared or sold." },
 { q: "What happens after 31 August 2026?", a: "We'll share simple pricing well before then. Nothing is charged automatically, and you'll always be able to export or delete your data." },
 { q: "Can my accountant get involved?", a: "Yes, invite them to a read only seat with an accountant pack and export, so they see exactly what they need and nothing they shouldn't." },
];

const SECURITY = [
 { title: "Row level isolation", body: "Every account is walled off at the database, not merely in the interface." },
 { title: "Encrypted throughout", body: "TLS in transit, encryption at rest. Documents are never public." },
 { title: "Your data, yours", body: "Export or delete everything at any time. Never sold, never shared." },
 { title: "Signed document links", body: "Files are served through short lived signed links, never a public bucket." },
];

export default function HomePage() {
 const currency = detectCurrency();
 const dec = priceDecimals(currency);
 const money = (n: number) => formatMoney(n, currency, { decimals: dec });
 const corePrice = money(localPrice("core", currency));
 const currencyCount = Object.keys(CURRENCIES).length;
 const langCount = Object.keys(LANGUAGES).length;
 const jurisdictions = heroJurisdictions();
 const moreCount = heroMoreCount();

 return (
  <div className="min-h-screen bg-bone">
   <SiteHeader />

   <AtlasHero jurisdictions={jurisdictions} moreCount={moreCount} />

   {/* Features, as a numbered index rather than a card grid */}
   <section id="features" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
     <div className="md:sticky md:top-24 md:self-start">
      <div className="text-[11px] uppercase tracking-[0.14em] text-clay">What it handles</div>
      <h2 className="display mt-4 text-[2rem] text-char md:text-[2.6rem]">
       Everything a landlord owes.<br />Nothing they don&apos;t.
      </h2>
      <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-umber">
       One workspace replaces the spreadsheets, the folder of certificates, the chasing and the
       guesswork. It speaks your jurisdiction, not a generic one.
      </p>
     </div>
     <ol className="border-t border-sepia">
      {FEATURES.map((f) => (
       <li key={f.n} className="border-b border-sepia py-6">
        <div className="flex gap-5">
         <span className="mt-1 shrink-0 font-display text-sm text-clay">{f.n}</span>
         <div>
          <h3 className="font-display text-[19px] leading-tight text-char">{f.title}</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-umber">{f.body}</p>
         </div>
        </div>
       </li>
      ))}
     </ol>
    </div>
   </section>

   {/* Court readiness, the differentiator, given a full editorial spread */}
   <section className="border-y border-sepia bg-char">
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
     <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-bone/50">The Lintel difference</div>
      <h2 className="display mt-4 text-[2rem] text-bone md:text-[2.8rem]">
       Always know if you&apos;re<br /><em className="text-clay not-italic">ready for court.</em>
      </h2>
      <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-bone/70">
       Most tools tell you a certificate expired. Lintel scores every tenancy on how evidence ready it
       is: deposit protected in time, prescribed documents served, certificates in date, registration
       valid. Then it hands you the exact checklist to fix, before it ever matters.
      </p>
     </div>
     <div className="border border-bone/15 p-8 text-center">
      <p className="text-[10px] uppercase tracking-[0.14em] text-bone/50">Court readiness</p>
      <p className="display mt-3 text-[4.5rem] tabular-nums text-bone">92</p>
      <p className="mt-1 text-xs text-bone/50">out of 100 &middot; Strong</p>
      <div className="mt-6 space-y-2 border-t border-bone/15 pt-5 text-left">
       {["Deposit protected in time", "Prescribed documents served", "Certificates in date"].map((x) => (
        <p key={x} className="text-xs text-bone/70">{x}</p>
       ))}
      </div>
     </div>
    </div>
   </section>

   {/* Free until 31 August */}
   <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
     <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-clay">No tiers, no card</div>
      <h2 className="display mt-4 text-[2rem] text-char md:text-[2.6rem]">
       Free until 31 August 2026.<br />Everything switched on.
      </h2>
      <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-umber">
       Nothing to puzzle over. Tenancy agreements, voice assistant, tenant portal, maintenance,
       documents and reports. Every feature is on the moment you sign up, and completely free for
       everyone until 31 August 2026.
      </p>
      <div className="mt-8">
       <Link href="/signup">
        <span className="inline-flex h-11 items-center rounded-edge bg-char px-6 text-sm font-medium text-bone transition-colors hover:bg-clay">
         Get started, it&apos;s free
        </span>
       </Link>
      </div>
     </div>
     <ul className="border-t border-sepia">
      {["Tenancy agreements, PDF or Word", "Tax records, rent and arrears", "Compliance vault and reminders", "Voice assistant and receipt scanning", "Tenant portal and maintenance", "Reports, tasks and court readiness", "iPhone and Android app"].map((x) => (
       <li key={x} className="flex items-baseline gap-3 border-b border-sepia py-3 text-[14px] text-char">
        <span className="text-clay">&#43;</span> {x}
       </li>
      ))}
     </ul>
    </div>
   </section>

   {/* Reach */}
   <section id="regions" className="border-y border-sepia bg-white">
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
     <div className="text-[11px] uppercase tracking-[0.14em] text-clay">Correct in every market</div>
     <h2 className="display mt-4 max-w-[18ch] text-[2rem] text-char md:text-[2.6rem]">
      Built for landlords, wherever the property is.
     </h2>
     <div className="mt-12 grid gap-8 border-t border-sepia pt-8 sm:grid-cols-3">
      {[
       { fig: String(COUNTRIES.length), lab: "Countries, each with its own tenancy, compliance and tax rules" },
       { fig: String(currencyCount), lab: "Currencies, formatted the way people there actually write them" },
       { fig: String(langCount), lab: "Languages, including right to left for Arabic and Hebrew" },
      ].map((s) => (
       <div key={s.lab}>
        <div className="display text-[3.5rem] leading-none tabular-nums text-char">{s.fig}</div>
        <p className="mt-3 max-w-[28ch] text-[13px] leading-relaxed text-umber">{s.lab}</p>
       </div>
      ))}
     </div>
    </div>
   </section>

   {/* Security */}
   <section id="security" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
     <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-clay">Security and privacy</div>
      <h2 className="display mt-4 text-[2rem] text-char md:text-[2.4rem]">
       Your information is protected.
      </h2>
     </div>
     <dl className="border-t border-sepia">
      {SECURITY.map((s) => (
       <div key={s.title} className="border-b border-sepia py-5">
        <dt className="font-display text-[17px] text-char">{s.title}</dt>
        <dd className="mt-1.5 text-[14px] leading-relaxed text-umber">{s.body}</dd>
       </div>
      ))}
     </dl>
    </div>
   </section>

   {/* Pricing */}
   <section id="pricing" className="border-y border-sepia bg-white">
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
     <div className="text-[11px] uppercase tracking-[0.14em] text-clay">Pricing</div>
     <h2 className="display mt-4 text-[2rem] text-char md:text-[2.6rem]">
      Free for everyone until 31 August 2026.
     </h2>
     <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-umber">
      Every feature, every country, no card. When pricing starts we&apos;ll tell you well in advance,
      and nothing will ever be charged automatically. For reference, we expect the core plan to be
      around {corePrice} a month.
     </p>
     <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 border-t border-sepia pt-6">
      {["No card required", "Cancel any time", "Export everything", "Delete on request"].map((x) => (
       <span key={x} className="text-[13px] text-umber"><span className="mr-2 text-clay">&#43;</span>{x}</span>
      ))}
     </div>
    </div>
   </section>

   {/* FAQ */}
   <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
    <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
     <div>
      <div className="text-[11px] uppercase tracking-[0.14em] text-clay">Questions</div>
      <h2 className="display mt-4 text-[2rem] text-char md:text-[2.4rem]">Questions, answered.</h2>
     </div>
     <dl className="border-t border-sepia">
      {FAQ.map((f) => (
       <div key={f.q} className="border-b border-sepia py-5">
        <dt className="font-display text-[17px] leading-snug text-char">{f.q}</dt>
        <dd className="mt-2 text-[14px] leading-relaxed text-umber">{f.a}</dd>
       </div>
      ))}
     </dl>
    </div>
   </section>

   {/* Close */}
   <section className="border-t border-sepia bg-char">
    <div className="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
     <h2 className="display mx-auto max-w-[20ch] text-[2.2rem] text-bone md:text-[3.2rem]">
      Your whole portfolio, finally in one calm place.
     </h2>
     <p className="mx-auto mt-5 max-w-[48ch] text-[15px] leading-relaxed text-bone/60">
      Free for everyone until 31 August 2026. No card, no tiers, nothing to cancel.
     </p>
     <div className="mt-9">
      <Link href="/signup">
       <span className="inline-flex h-12 items-center rounded-edge bg-bone px-8 text-sm font-medium text-char transition-colors hover:bg-clay hover:text-bone">
        Create your free account
       </span>
      </Link>
     </div>
    </div>
   </section>

   <SiteFooter />
  </div>
 );
}
