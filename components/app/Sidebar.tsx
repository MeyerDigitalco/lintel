"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/properties", label: "Properties" },
  { href: "/dashboard/contacts", label: "Contacts", writerOnly: true },
  { href: "/dashboard/transactions", label: "Income & expenses", writerOnly: true },
  { href: "/dashboard/invoices", label: "Invoices", writerOnly: true },
  { href: "/dashboard/rent", label: "Rent ledger", writerOnly: true },
  { href: "/dashboard/court-readiness", label: "Court-readiness" },
  { href: "/dashboard/maintenance", label: "Maintenance", writerOnly: true },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/toolkit", label: "Toolkit", writerOnly: true },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/assistant", label: "Assistant", writerOnly: true },
  { href: "/dashboard/tax", label: "Tax & MTD" },
  { href: "/dashboard/accountant", label: "Accountant" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Sidebar({ readOnly = false }: { readOnly?: boolean }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !(readOnly && i.writerOnly));
  return (
    <aside className="hidden w-60 shrink-0 border-r border-hairline bg-surface md:flex md:flex-col">
      <div className="px-5 py-5">
        <Link href="/dashboard" aria-label="Lintel">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
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
