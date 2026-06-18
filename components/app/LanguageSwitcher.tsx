"use client";

import { useRef } from "react";
import { LANGUAGES } from "@/lib/i18n/dictionaries";
import { setLanguage } from "@/app/lang-actions";

export function LanguageSwitcher({ lang, langs }: { lang: string; langs: string[] }) {
  const ref = useRef<HTMLFormElement>(null);
  if (!langs || langs.length < 2) return null;
  return (
    <form ref={ref} action={setLanguage} className="border-t border-hairline px-3 py-3">
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate">Language</label>
      <select
        name="lang"
        defaultValue={lang}
        onChange={() => ref.current?.requestSubmit()}
        className="h-9 w-full rounded-lintel border border-hairline bg-surface px-2 text-sm text-ink outline-none focus:ring-2 focus:ring-evergreen/30"
      >
        {langs.map((l) => (
          <option key={l} value={l}>{LANGUAGES[l]?.nativeName ?? l}</option>
        ))}
      </select>
    </form>
  );
}
