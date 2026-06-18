"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DOC_TYPES, DOC_CATEGORIES } from "@/lib/doc-types";

const selCls =
  "h-9 rounded-lintel border border-hairline bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-evergreen/30";

export function DocumentsFilter({ properties }: { properties: { id: string; label: string }[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const set = (key: string, value: string) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/dashboard/documents?${p.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <select value={sp.get("type") ?? ""} onChange={(e) => set("type", e.target.value)} className={selCls}>
        <option value="">All document types</option>
        {DOC_CATEGORIES.map((cat) => (
          <optgroup key={cat} label={cat}>
            {DOC_TYPES.filter((d) => d.category === cat).map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </optgroup>
        ))}
      </select>

      <select value={sp.get("property") ?? ""} onChange={(e) => set("property", e.target.value)} className={selCls}>
        <option value="">All properties</option>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      <select value={sp.get("status") ?? ""} onChange={(e) => set("status", e.target.value)} className={selCls}>
        <option value="">Any status</option>
        <option value="valid">Valid</option>
        <option value="expiring">Expiring soon</option>
        <option value="expired">Expired</option>
        <option value="filed">Filed (no expiry)</option>
      </select>
    </div>
  );
}
