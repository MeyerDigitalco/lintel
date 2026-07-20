import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { CallbackForm } from "@/components/site/CallbackForm";
import { AccessGate } from "@/components/site/AccessGate";
import { hasAccountantAccess } from "./actions";
import { issueFormToken } from "@/lib/spam";
import { COUNTRIES } from "@/lib/i18n/regions";
import {
  PreviewDataQuality,
  PreviewSa105,
  PreviewQueries,
  PreviewReports,
} from "@/components/site/PortalPreview";

export const dynamic = "force-dynamic";

/** Gated partner page: never index it, never follow from it. */
export const metadata = {
  title: "Lintel for accounting practices",
  description: "The landlord platform that gives you a free seat inside every client's books.",
  robots: { index: false, follow: false, nocache: true },
};

const OBJECTIONS = [
  {
    q: "Does this replace me?",
    a: "No. Lintel does not file, does not advise, and does not compute a tax position. It captures and organises the client's records to the point where your work begins. The judgement calls, capital versus revenue, ownership structure, relief claims, remain entirely yours.",
  },
  {
    q: "What actually changes for my practice?",
    a: "The shoebox disappears. Instead of chasing a client in January for bank statements and missing invoices, you open their portfolio in October and see exactly what is missing, with a query thread to ask for it. The reconciliation work you cannot bill for shrinks.",
  },
  {
    q: "Can I change my client's records?",
    a: "No, and that is deliberate. Your seat is read-only, enforced at the database, not just hidden in the interface. You raise a query, the landlord amends, the trail stays intact. Your professional position is protected because you never touched the books.",
  },
  {
    q: "What does it cost my practice?",
    a: "Nothing. The accountant seat is free and always will be. The landlord holds the subscription. You get the view.",
  },
];

const NUMBERS = [
  { fig: "Free", lab: "Accountant seats, permanently. One per client, unlimited clients." },
  { fig: "Read-only", lab: "Enforced by row-level security, not by hiding buttons in the UI." },
  { fig: String(COUNTRIES.length), lab: "Countries, each mapped to its own return: SA105, Schedule E, ITR12, IR3, Anlage V." },
];

export default async function AccountantPage() {
  const unlocked = await hasAccountantAccess();
  const formToken = issueFormToken();

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col bg-bone">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-5 py-20">
          <AccessGate />
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-sepia">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-20">
          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
              Partner briefing, for accounting practices
            </div>
            <h1 className="display mt-5 text-[2.8rem] text-char md:text-[3.8rem]">
              We didn&apos;t cut you out.
              <br />
              <span className="text-clay">We built you a seat.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[19px] leading-relaxed text-char/80">
              Most landlord software quietly positions itself as the thing that replaces the
              accountant. Lintel does the opposite. Every landlord account comes with a free,
              permanent seat for their accountant, with a live view of the books.
            </p>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-umber">
              The hardest part of running a practice isn&apos;t finding clients. It&apos;s keeping
              them. Lintel Squared makes you the person who guided your landlords through Making Tax
              Digital, and that is not a relationship a competitor unpicks easily.
            </p>
            <div className="mt-9">
              <a href="#talk">
                <span className="inline-flex h-14 items-center rounded-edge bg-char px-8 text-[17px] font-medium text-bone transition-colors hover:bg-clay">
                  Talk to us about your practice
                </span>
              </a>
            </div>
          </div>

          <div className="md:pt-2">
            <CallbackForm
              token={formToken}
              source="accountant"
              heading="Add your practice"
              blurb="Tell us about your firm and we will call you back to set up your practice, walk through the portal and discuss onboarding your landlord clients."
              scaleLabel="Landlord clients"
              scaleOptions={["Under 10", "10 to 50", "50 to 200", "200 or more"]}
              submitLabel="Request a partner call"
            />
          </div>
        </div>
      </section>


      {/* The retention argument. The commercial case, not the feature case. */}
      <section className="border-b border-sepia bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
            Why this matters to your practice
          </div>
          <h2 className="display mt-5 max-w-[24ch] text-[2.1rem] text-char md:text-[3rem]">
            A landlord who outgrows you is a client you are already losing.
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="grid gap-5 text-[17px] leading-relaxed text-umber">
              <p>
                A landlord who organises their own finances, files their own returns and starts to
                wonder whether they really need you is not a client you lose suddenly. You lose them
                over two or three years, quietly, and usually you find out at renewal.
              </p>
              <p>
                Making Tax Digital changed the ground under all of this. Paper receipts are no longer
                compliant. The shoebox is finished. Every landlord on your books has to move to
                digital record keeping, and most of them do not know where to start, who to trust, or
                what it means for them in practice.
              </p>
              <p className="font-medium text-char">
                That is not a problem for your practice. It is the opening.
              </p>
            </div>

            <div className="grid gap-5 text-[17px] leading-relaxed text-umber">
              <p>
                The accountant who shows their landlord clients how to make that move, hands them a
                tool, walks them through it and stands behind it, becomes more than a tax
                professional. They become the person who guided their clients through the biggest
                change in property taxation in a generation.
              </p>
              <p>
                Once a landlord&apos;s whole portfolio, their properties, tenants, documents and
                expenses, lives in a platform where you are their accountant, switching stops being
                attractive. Not because they are locked into a contract. Because their financial
                year is built around a process that runs through you.
              </p>
              <p>
                Every quarter, when the return goes in, they are reminded of the same thing: their
                accountant made this easy.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-sepia pt-10">
            <p className="display max-w-[24ch] text-[1.9rem] leading-tight text-char md:text-[2.4rem]">
              Retention you don&apos;t have to chase. Four times a year, automatically.
            </p>
          </div>
        </div>
      </section>

      {/* The problem, named honestly */}
      <section className="border-b border-sepia bg-char">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="display max-w-[20ch] text-[2.1rem] text-bone md:text-[2.9rem]">
            You already know what January looks like.
            <span className="block text-clay">Making Tax Digital just made it four times a year.</span>
          </h2>
          <p className="mt-6 max-w-[56ch] text-[18px] leading-relaxed text-bone/75">
            One annual scramble was survivable. Four quarterly submissions per landlord, per year,
            built on records that arrive late and incomplete, is not. The practices that solve this
            before their clients feel it will keep those clients. The ones that don&apos;t will spend
            the next few years absorbing the cost.
          </p>
          <div className="mt-10 grid gap-8 border-t border-bone/20 pt-10 sm:grid-cols-3">
            {[
              {
                t: "The records arrive late and incomplete",
                b: "Bank statements without narratives, expenses with no receipts, and a client who cannot remember whether the £2,400 boiler was a replacement or an upgrade.",
              },
              {
                t: "You do bookkeeping you cannot bill",
                b: "Hours of categorising and chasing that the fee never really covered, compressed into the worst weeks of your year.",
              },
              {
                t: "The risk sits with you",
                b: "You sign off a return built on records you had to reconstruct, on a client's word, months after the fact.",
              },
            ].map((x) => (
              <div key={x.t}>
                <h3 className="font-display text-[21px] leading-snug text-bone">{x.t}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-bone/70">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal walkthrough */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <h2 className="display max-w-[18ch] text-[2.1rem] text-char md:text-[2.8rem]">
          What your seat actually shows you.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-umber">
          These are the real screens from the accountant seat, with sample figures.
        </p>

        <div className="mt-14 grid gap-16">
          {[
            {
              n: "01",
              title: "Know the state of the records before you start",
              body: "The first thing you see is whether this job is ready. How many transactions, what proportion are categorised, how many expenses actually have a receipt attached, how many documents are on file. If a client is at 60% categorised in November, you know in seconds and you can act on it while there is still time.",
              preview: <PreviewDataQuality />,
            },
            {
              n: "02",
              title: "The return, already broken down",
              body: "Income and expenses per property, and totals mapped to the boxes on the return rather than to some generic chart of accounts. Finance costs are held separately because relief is a basic-rate reducer, not a deduction. Export to CSV and it lands in your software without re-keying.",
              preview: <PreviewSa105 />,
            },
            {
              n: "03",
              title: "Ask the client inside the file, not across a month of email",
              body: "A threaded query list attached to the portfolio. You ask, the landlord answers, either party marks it resolved. No forwarding, no attachments, no chasing a reply across three weeks of inbox. Next year the reasoning behind a judgement call is still sitting beside the transaction it relates to, instead of buried in an email chain nobody can find.",
              preview: <PreviewQueries />,
            },
            {
              n: "04",
              title: "The reports you would otherwise build by hand",
              body: "Income and expense statements, P&L summaries, supplier breakdowns, rent ledgers and compliance status, all exportable. Useful for the return, and useful for the advisory conversation you would rather be having with the client.",
              preview: <PreviewReports />,
            },
          ].map((s, i) => (
            <div key={s.n} className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14">
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="font-display text-[15px] text-clay">{s.n}</div>
                <h3 className="display mt-2 text-[1.7rem] leading-tight text-char md:text-[2.1rem]">
                  {s.title}
                </h3>
                <p className="mt-4 text-[17px] leading-relaxed text-umber">{s.body}</p>
              </div>
              <div className={i % 2 === 1 ? "md:order-1" : ""}>{s.preview}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="border-y border-sepia bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="grid gap-10 sm:grid-cols-3">
            {NUMBERS.map((n) => (
              <div key={n.lab}>
                <div className="display text-[3rem] leading-none text-char">{n.fig}</div>
                <p className="mt-3 max-w-[30ch] text-[16px] leading-relaxed text-umber">{n.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Objections */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
          <h2 className="display text-[2.1rem] text-char md:text-[2.6rem]">
            The questions you&apos;re
            <br />
            about to ask.
          </h2>
          <dl className="border-t border-sepia">
            {OBJECTIONS.map((o) => (
              <div key={o.q} className="border-b border-sepia py-6">
                <dt className="font-display text-[20px] leading-snug text-char">{o.q}</dt>
                <dd className="mt-3 text-[17px] leading-relaxed text-umber">{o.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works for the practice */}
      <section className="border-t border-sepia bg-bone">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <h2 className="display max-w-[16ch] text-[2.1rem] text-char md:text-[2.6rem]">
            How a practice gets started.
          </h2>
          <ol className="mt-12 grid gap-8 border-t border-sepia pt-10 sm:grid-cols-3">
            {[
              { n: "01", t: "We set your practice up", b: "One call. We create your practice profile and show you the portal properly." },
              { n: "02", t: "Your clients invite you", b: "The landlord enters your email and your seat appears. Free, read-only, no licence to buy." },
              { n: "03", t: "You work the portfolio", b: "Review, query, export. Through the year rather than in one January panic." },
            ].map((s) => (
              <li key={s.n}>
                <div className="font-display text-[15px] text-clay">{s.n}</div>
                <h3 className="mt-2 font-display text-[21px] text-char">{s.t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-umber">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>


      {/* Exclusivity. Scarcity is only persuasive if the terms are stated plainly. */}
      <section className="border-t border-sepia bg-char">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
            <div>
              <div className="text-[13px] font-medium uppercase tracking-[0.12em] text-clay">
                One practice per town
              </div>
              <h2 className="display mt-5 max-w-[20ch] text-[2.1rem] text-bone md:text-[2.9rem]">
                We appoint a single Lintel Squared Partner in each area.
              </h2>
              <p className="mt-6 max-w-[52ch] text-[18px] leading-relaxed text-bone/75">
                We are not signing every firm in a postcode and letting them compete over the same
                landlords. One practice per town holds the partnership. If you are reading this,
                your area may still be open. The firm that moves first takes it.
              </p>
              <div className="mt-9">
                <a href="#talk">
                  <span className="inline-flex h-14 items-center rounded-edge bg-bone px-8 text-[17px] font-medium text-char transition-colors hover:bg-clay hover:text-bone">
                    Check if your area is available
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-edge border border-bone/20 p-7">
              <div className="text-[11px] uppercase tracking-[0.14em] text-bone/50">
                Partnership terms
              </div>
              <dl className="mt-5 grid gap-5">
                {[
                  { k: "Exclusivity", v: "One appointed practice per town." },
                  { k: "Qualification", v: "A minimum of 60 landlord sign ups within 60 days of appointment." },
                  { k: "Cost to the practice", v: "None. Accountant seats are free, permanently." },
                  { k: "Your clients pay", v: "Free for everyone until 31 August 2026." },
                ].map((r) => (
                  <div key={r.k} className="border-t border-bone/15 pt-4 first:border-t-0 first:pt-0">
                    <dt className="text-[13px] uppercase tracking-[0.08em] text-bone/50">{r.k}</dt>
                    <dd className="mt-1.5 text-[17px] leading-snug text-bone">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section id="talk" className="border-t border-sepia bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
          <div className="mb-10 text-center">
            <h2 className="display text-[2.2rem] text-char md:text-[3rem]">
              Clients who convert don&apos;t leave.
            </h2>
            <p className="mx-auto mt-5 max-w-[48ch] text-[18px] leading-relaxed text-umber">
              Tell us how many landlord clients you look after and we will call you back, set your
              practice up, and confirm whether your area is still available.
            </p>
          </div>
          <CallbackForm
            id="accountant-bottom"
            token={formToken}
            source="accountant"
            heading="Add your practice"
            blurb="A Lintel partner will call you back to set up your practice and answer anything you need."
            scaleLabel="Landlord clients"
            scaleOptions={["Under 10", "10 to 50", "50 to 200", "200 or more"]}
            submitLabel="Request a partner call"
          />
          <p className="mt-8 text-center text-[14px] leading-relaxed text-umber">
            This briefing is confidential and intended for invited practices. Figures shown in the
            portal screens are sample data. Lintel provides software tools, not legal, tax or
            financial advice.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
