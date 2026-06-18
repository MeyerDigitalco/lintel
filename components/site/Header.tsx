import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Lintel home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-slate md:flex">
          <Link href="/#features" className="hover:text-ink">Features</Link>
          <Link href="/#regions" className="hover:text-ink">Regions</Link>
          <Link href="/calculators" className="hover:text-ink">Calculators</Link>
          <Link href="/#pricing" className="hover:text-ink">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm text-slate hover:text-ink sm:block">
            Sign in
          </Link>
          <Link href="/signup">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
