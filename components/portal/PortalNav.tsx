"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/portal", label: "Home" },
  { href: "/portal/rent", label: "Rent" },
  { href: "/portal/documents", label: "Docs" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/settings", label: "Settings" },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map((t) => {
          const active =
            t.href === "/portal" ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs",
                active ? "text-evergreen" : "text-slate"
              )}
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  active ? "bg-evergreen" : "bg-transparent"
                )}
              />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
