"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * The Atlas hero.
 *
 * The competitive point of this product is that it is correct in 27
 * jurisdictions, not that it is "one platform for landlords", which is what
 * every rival says. So the hero is the claim: pick a jurisdiction and watch the
 * page restate itself in that country's law. A UK-only competitor structurally
 * cannot copy it.
 *
 * Facts are precomputed on the server from lib/i18n/rulesets so this switches
 * instantly with no fetch, and so the marketing copy can never drift from the
 * rules the product actually applies.
 */
export interface HeroJurisdiction {
  key: string;
  label: string;
  tenancyTerm: string;
  depositCap: string;
  noticeLabel: string;
  noticePeriod: string;
  taxLabel: string;
  governingLaw: string;
}

export function AtlasHero({
  jurisdictions,
  moreCount,
}: {
  jurisdictions: HeroJurisdiction[];
  moreCount: number;
}) {
  const [active, setActive] = useState(0);
  const j = jurisdictions[active];

  return (
    <section className="border-b border-sepia bg-bone">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        {/* Jurisdiction picker */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-umber">
            Show me
          </span>
          {jurisdictions.map((x, i) => (
            <button
              key={x.key}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={
                i === active
                  ? "rounded-edge bg-char px-2.5 py-1 text-xs font-medium text-bone"
                  : "rounded-edge border border-sepia px-2.5 py-1 text-xs text-umber transition-colors hover:border-char hover:text-char"
              }
            >
              {x.label}
            </button>
          ))}
          <span className="rounded-edge px-2.5 py-1 text-xs text-umber">
            and {moreCount} more
          </span>
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          {/* Claim */}
          <div>
            <div className="h-px w-full bg-char/85" />
            <h1 className="display mt-6 text-[2.6rem] text-char md:text-[3.6rem]">
              Correct in{" "}
              <span className="italic text-clay">{j.label}</span>.
              <br />
              Correct everywhere.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-umber">
              Tenancy agreements, compliance, rent and evidence for {jurisdictions.length + moreCount}{" "}
              jurisdictions. Drafted against the statute that actually governs your property,
              not a template that assumes everyone is in England.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/signup">
                <span className="inline-flex h-11 items-center rounded-edge bg-char px-6 text-sm font-medium text-bone transition-colors hover:bg-clay">
                  Start free
                </span>
              </Link>
              <Link
                href="#features"
                className="border-b border-char pb-0.5 text-sm text-char transition-colors hover:border-clay hover:text-clay"
              >
                See what it handles
              </Link>
            </div>
            <p className="mt-5 text-xs text-umber">
              No card. Free for everyone until 31 August 2026.
            </p>
          </div>

          {/* Live jurisdiction facts, styled as a document extract */}
          <div className="border-l border-sepia pl-6 md:pl-8">
            <div className="text-[10px] uppercase tracking-[0.14em] text-umber">
              {j.label}, at a glance
            </div>
            <dl className="mt-4">
              {[
                { k: "Tenancy type", v: j.tenancyTerm },
                { k: "Deposit cap", v: j.depositCap },
                { k: j.noticeLabel, v: j.noticePeriod },
                { k: "Tax return", v: j.taxLabel },
              ].map((row) => (
                <div key={row.k} className="border-t border-sepia py-3 first:border-t-0 first:pt-0">
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-umber">{row.k}</dt>
                  <dd className="mt-1 font-display text-[17px] leading-snug text-char">{row.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-sepia pt-3">
              <div className="text-[10px] uppercase tracking-[0.1em] text-umber">Governing law</div>
              <p className="mt-1 text-xs leading-relaxed text-umber">{j.governingLaw}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
