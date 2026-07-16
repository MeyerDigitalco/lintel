import Link from "next/link";
import { Logo } from "@/components/Logo";
import { COUNTRIES } from "@/lib/i18n/regions";

/** Public site footer, editorial palette. */
export function SiteFooter() {
 return (
  <footer className="border-t border-sepia bg-bone">
   <div className="mx-auto max-w-6xl px-5 py-14">
    <div className="flex flex-col gap-10 md:flex-row md:justify-between">
     <div className="max-w-xs">
      <Logo />
      <p className="mt-4 text-[13px] leading-relaxed text-umber">
       Tenancy agreements, tax, compliance and rent for landlords in {COUNTRIES.length} countries.
       Correct in every market, not just the one the software was written in.
      </p>
     </div>
     <div className="grid grid-cols-2 gap-10 text-[13px] sm:grid-cols-3">
      <div>
       <p className="mb-3 font-display text-[15px] text-char">Product</p>
       <ul className="space-y-2 text-umber">
        <li><Link href="/#features" className="transition-colors hover:text-clay">Features</Link></li>
        <li><Link href="/#pricing" className="transition-colors hover:text-clay">Pricing</Link></li>
        <li><Link href="/calculators" className="transition-colors hover:text-clay">Calculators</Link></li>
        <li><Link href="/#security" className="transition-colors hover:text-clay">Security</Link></li>
       </ul>
      </div>
      <div>
       <p className="mb-3 font-display text-[15px] text-char">Regions</p>
       <ul className="space-y-2 text-umber">
        <li>United Kingdom</li>
        <li>Europe</li>
        <li>United States</li>
        <li>Middle East</li>
        <li>Africa, Asia, Oceania</li>
       </ul>
      </div>
      <div>
       <p className="mb-3 font-display text-[15px] text-char">Legal</p>
       <ul className="space-y-2 text-umber">
        <li><Link href="/privacy" className="transition-colors hover:text-clay">Privacy</Link></li>
        <li><Link href="/terms" className="transition-colors hover:text-clay">Terms</Link></li>
       </ul>
      </div>
     </div>
    </div>
    <div className="mt-12 border-t border-sepia pt-6 text-[11px] leading-relaxed text-umber">
     <p>
      &copy; {new Date().getFullYear()} Lintel. Lintel provides software tools,
      not legal, tax or financial advice. Tenancy agreements are drafted against the law of your
      region and are a drafting aid, not a certified form. Always verify with a qualified
      professional. No HMRC filing is available until HMRC recognition is granted.
     </p>
    </div>
   </div>
  </footer>
 );
}
