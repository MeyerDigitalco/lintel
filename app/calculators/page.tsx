import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Panel, PanelBody } from "@/components/site/Panel";
import { CALCULATORS } from "@/components/calculators/registry";

export const metadata: Metadata = {
  title: "UK landlord calculators, Lintel",
  description:
    "Free calculators for UK landlords: stamp duty (SDLT/LTT/LBTT), rental yield, income tax, CGT, Section 24, MTD, mortgage, rent increase, deposit cap and EPC.",
};

export default function CalculatorsIndex() {
  return (
    <div className="min-h-screen bg-bone">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-char md:text-4xl">
          Landlord calculators
        </h1>
        <p className="mt-3 max-w-2xl text-umber">
          Free, no sign-up. Indicative figures for the 2025/26 tax year, not
          advice.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <Link key={c.slug} href={`/calculators/${c.slug}`}>
              <Panel className="h-full transition-colors hover:border-evergreen/40">
                <PanelBody>
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    {c.title}
                  </h2>
                  <p className="mt-2 text-sm text-umber">{c.blurb}</p>
                </PanelBody>
              </Panel>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
