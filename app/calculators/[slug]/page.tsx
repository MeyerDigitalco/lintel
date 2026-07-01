import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";
import { Calculator } from "@/components/calculators/Calculator";
import { CALCULATORS, metaFor } from "@/components/calculators/registry";

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const meta = metaFor(params.slug);
  if (!meta) return { title: "Calculator, Lintel" };
  return { title: `${meta.title}, Lintel`, description: meta.blurb };
}

export default function CalculatorPage({
  params,
}: {
  params: { slug: string };
}) {
  const meta = metaFor(params.slug);
  if (!meta) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/calculators" className="text-sm text-slate hover:text-ink">
          ← All calculators
        </Link>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {meta.title}
        </h1>
        <p className="mt-2 mb-8 text-slate">{meta.blurb}</p>
        <Calculator kind={meta.kind} />
      </main>
      <SiteFooter />
    </div>
  );
}
