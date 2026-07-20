import Link from "next/link";
import { Logo } from "@/components/Logo";

/** Public site header, editorial palette. The app shell uses its own nav. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sepia bg-bone/85 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Lintel home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-[15px] text-umber md:flex">
          <Link href="/#features" className="transition-colors hover:text-clay">Features</Link>
          <Link href="/#regions" className="transition-colors hover:text-clay">Regions</Link>
          <Link href="/calculators" className="transition-colors hover:text-clay">Calculators</Link>
          <Link href="/#pricing" className="transition-colors hover:text-clay">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-[15px] text-umber transition-colors hover:text-clay sm:block">
            Sign in
          </Link>
          <Link href="/signup">
            <span className="inline-flex h-9 items-center rounded-edge bg-char px-4 text-[15px] font-medium text-bone transition-colors hover:bg-clay">
              Start free
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
