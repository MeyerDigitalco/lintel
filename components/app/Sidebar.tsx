"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/properties", label: "Properties" },
  { href: "/dashboard/transactions", label: "Income & expenses" },
  { href: "/dashboard/rent", label: "Rent ledger" },
  { href: "/dashboard/maintenance", label: "Maintenance" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/toolkit", label: "Toolkit" },
  { href: "/dashboard/tax", label: "Tax & MTD" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-hairline bg-surface md:flex md:flex-col">
      <div className="px-5 py-5">
        <Link href="/dashboard" aria-label="Lintel">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 block rounded-lintel px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-evergreen/8 font-medium text-evergreen"
                  : "text-slate hover:bg-ink/5 hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
