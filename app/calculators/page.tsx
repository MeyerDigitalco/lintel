import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Card, CardBody } from "@/components/ui/Card";
import { CALCULATORS } from "@/components/calculators/registry";

export const metadata: Metadata = {
  title: "UK landlord calculators, Lintel",
  description:
    "Free calculators for UK landlords: stamp duty (SDLT/LTT/LBTT), rental yield, income tax, CGT, Section 24, MTD, mortgage, rent increase, deposit cap and EPC.",
};

export default function CalculatorsIndex() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Landlord calculators
        </h1>
        <p className="mt-3 max-w-2xl text-slate">
          Free, no sign-up. Indicative figures for the 2025/26 tax year, not
          advice.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULATORS.map((c) => (
            <Link key={c.slug} href={`/calculators/${c.slug}`}>
              <Card className="h-full transition-colors hover:border-evergreen/40">
                <CardBody>
                  <h2 className="font-heading text-base font-semibold tracking-tight">
                    {c.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate">{c.blurb}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
