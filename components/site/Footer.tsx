import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-slate">
              Calm, precise tax and compliance for landlords worldwide — the UK, USA,
              Middle East and South Africa, correct in every market.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-medium text-ink">Product</p>
              <ul className="space-y-2 text-slate">
                <li><Link href="/#features" className="hover:text-ink">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-ink">Pricing</Link></li>
                <li><Link href="/calculators" className="hover:text-ink">Calculators</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-ink">Regions</p>
              <ul className="space-y-2 text-slate">
                <li>United Kingdom</li>
                <li>United States</li>
                <li>Middle East</li>
                <li>South Africa</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-medium text-ink">Legal</p>
              <ul className="space-y-2 text-slate">
                <li><Link href="/privacy" className="hover:text-ink">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-hairline pt-6 text-xs text-slate">
          <p>
            © {new Date().getFullYear()} Lintel. Lintel provides software tools,
            not legal, tax or financial advice. Always verify with a qualified
            professional. No HMRC filing is available until HMRC recognition is
            granted.
          </p>
        </div>
      </div>
    </footer>
  );
}
