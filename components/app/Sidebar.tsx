"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { translate } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { FreeCountdown } from "@/components/app/FreeCountdown";

const NAV = [
  { href: "/dashboard", key: "nav.overview" },
  { href: "/dashboard/properties", key: "nav.properties" },
  { href: "/dashboard/contacts", key: "nav.contacts", writerOnly: true },
  { href: "/dashboard/transactions", key: "nav.income", writerOnly: true },
  { href: "/dashboard/invoices", key: "nav.invoices", writerOnly: true },
  { href: "/dashboard/rent", key: "nav.rent", writerOnly: true },
  { href: "/dashboard/court-readiness", key: "nav.court" },
  { href: "/dashboard/maintenance", key: "nav.maintenance", writerOnly: true },
  { href: "/dashboard/tasks", key: "nav.tasks" },
  { href: "/dashboard/notice-generator", key: "nav.notice", writerOnly: true },
  { href: "/dashboard/tenancy-agreement", key: "nav.agreement", writerOnly: true },
  { href: "/dashboard/compliance", key: "nav.compliance" },
  { href: "/dashboard/region", key: "nav.region" },
  { href: "/dashboard/documents", key: "nav.documents" },
  { href: "/dashboard/toolkit", key: "nav.toolkit", writerOnly: true },
  { href: "/dashboard/reports", key: "nav.reports" },
  { href: "/dashboard/assistant", key: "nav.assistant", writerOnly: true },
  { href: "/dashboard/tax", key: "nav.tax" },
  { href: "/dashboard/accountant", key: "nav.accountant" },
  { href: "/dashboard/settings", key: "nav.settings" },
  { href: "/dashboard/leads", key: "nav.leads", adminOnly: true },
];

const TAX_SHORT: Record<string, string> = { en: "Tax", es: "Impuestos", fr: "Impôts", de: "Steuern", ar: "الضرائب", hi: "कर", it: "Tasse", pt: "Impostos", ja: "税金" };

export function Sidebar({
  readOnly = false,
  lang = "en",
  langs = ["en"],
  country = "GB",
  isAdmin = false,
}: {
  readOnly?: boolean;
  lang?: string;
  langs?: string[];
  country?: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const isUK = country === "GB";
  const items = NAV.filter((i) => !(readOnly && i.writerOnly))
    .filter((i) => isUK || i.href !== "/dashboard/toolkit")
    .filter((i) => isAdmin || !i.adminOnly);
  return (
    <aside className="hidden w-60 shrink-0 border-r border-hairline bg-surface md:flex md:flex-col">
      <div className="border-b border-hairline px-5 py-6">
        <Link href="/dashboard" aria-label="Lintel" className="block">
          <Logo iconSize={52} wordmarkClassName="text-[2rem]" className="gap-2.5" />
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 block rounded-lintel px-3 py-2 text-sm transition-colors",
                active ? "bg-evergreen/8 font-medium text-evergreen" : "text-slate hover:bg-ink/5 hover:text-ink"
              )}
            >
              {item.key === "nav.tax" && !isUK ? (TAX_SHORT[lang] ?? "Tax") : translate(lang, item.key)}
            </Link>
          );
        })}
      </nav>
      <FreeCountdown />
      <LanguageSwitcher lang={lang} langs={langs} />
    </aside>
  );
}
