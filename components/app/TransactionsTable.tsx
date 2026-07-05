"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/i18n/currency";
import { categoriesForRegion, categoryLabelForRegion } from "@/lib/tax-categories";
import { updateTransaction, deleteTransaction } from "@/app/dashboard/transactions/actions";
import { fmtDate } from "@/lib/dates";

type Tx = {
  id: string; direction: string; sa105_category: string | null; amount: number;
  occurred_on: string; description: string | null; property_id: string | null;
  recurring?: boolean; receiptUrl?: string | null;
};
type Prop = { id: string; label: string };

const inputCls = "h-9 w-full rounded-lintel border border-hairline bg-surface px-2 text-sm";
const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-xs transition-colors ${active ? "border-evergreen bg-evergreen/8 text-evergreen" : "border-slate/40 text-slate hover:text-ink"}`;

export function TransactionsTable({
  transactions, properties, currency, country,
}: {
  transactions: Tx[]; properties: Prop[]; currency: string; country: string;
}) {
  const [prop, setProp] = useState<string>("all"); // "all" | "none" | property id
  const [dir, setDir] = useState<string>("all");    // "all" | "income" | "expense"
  const [editing, setEditing] = useState<string | null>(null);

  const money = (n: number) => formatMoney(n, currency, { decimals: true });
  const propName = (id: string | null) => (id ? (properties.find((p) => p.id === id)?.label ?? "Property") : "Unassigned");
  const incomeCats = categoriesForRegion(country, "income");
  const expenseCats = categoriesForRegion(country, "expense");

  const filtered = useMemo(() => transactions.filter((t) => {
    const okProp = prop === "all" || (prop === "none" ? !t.property_id : t.property_id === prop);
    const okDir = dir === "all" || t.direction === dir;
    return okProp && okDir;
  }), [transactions, prop, dir]);

  // Group by property (only meaningful when viewing "all")
  const groups = useMemo(() => {
    const byProp = new Map<string, Tx[]>();
    for (const t of filtered) {
      const key = t.property_id ?? "none";
      const arr = byProp.get(key) ?? [];
      arr.push(t); byProp.set(key, arr);
    }
    return [...byProp.entries()];
  }, [filtered]);

  const groupNet = (rows: Tx[]) => rows.reduce((s, t) => s + (t.direction === "income" ? Number(t.amount) : -Number(t.amount)), 0);

  function EditRow({ t }: { t: Tx }) {
    return (
      <tr className="border-b border-hairline bg-paper">
        <td colSpan={5} className="px-4 py-3">
          <form action={updateTransaction} className="grid gap-2 sm:grid-cols-6 sm:items-end">
            <input type="hidden" name="id" value={t.id} />
            <label className="block text-xs text-slate">Date
              <input name="occurred_on" type="date" defaultValue={t.occurred_on} className={inputCls} /></label>
            <label className="block text-xs text-slate">Type
              <select name="direction" defaultValue={t.direction} className={inputCls}>
                <option value="expense">Expense</option><option value="income">Income</option>
              </select></label>
            <label className="block text-xs text-slate sm:col-span-2">Category
              <select name="sa105_category" defaultValue={t.sa105_category ?? ""} className={inputCls}>
                <optgroup label="Income">{incomeCats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</optgroup>
                <optgroup label="Expenses">{expenseCats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</optgroup>
              </select></label>
            <label className="block text-xs text-slate">Amount
              <input name="amount" inputMode="decimal" defaultValue={String(t.amount)} className={inputCls} /></label>
            <label className="block text-xs text-slate">Property
              <select name="property_id" defaultValue={t.property_id ?? ""} className={inputCls}>
                <option value="">Unassigned</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select></label>
            <label className="block text-xs text-slate sm:col-span-4">Description
              <input name="description" defaultValue={t.description ?? ""} className={inputCls} /></label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-9 rounded-lintel bg-evergreen px-3 text-sm font-medium text-paper" onClick={() => setEditing(null)}>Save</button>
              <button type="button" onClick={() => setEditing(null)} className="h-9 rounded-lintel border border-hairline px-3 text-sm text-slate">Cancel</button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  function DisplayRow({ t }: { t: Tx }) {
    return (
      <tr className="border-b border-hairline last:border-0">
        <td className="px-4 py-3 text-slate whitespace-nowrap">{fmtDate(t.occurred_on)}</td>
        <td className="px-4 py-3 text-ink">
          <span className="flex flex-wrap items-center gap-2">
            {t.description || "-"}
            {t.recurring ? <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] text-slate">Monthly</span> : null}
            {t.receiptUrl ? <a href={t.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-evergreen hover:underline">Receipt</a> : null}
          </span>
        </td>
        <td className="px-4 py-3 text-slate">{categoryLabelForRegion(country, t.sa105_category)}</td>
        <td className={`px-4 py-3 text-right tabular-nums ${t.direction === "income" ? "text-evergreen" : "text-ink"}`}>
          {t.direction === "income" ? "+" : "-"}{money(Number(t.amount))}
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          <button onClick={() => setEditing(t.id)} className="text-xs text-evergreen hover:underline">Edit</button>
          <form action={deleteTransaction} className="ml-3 inline">
            <input type="hidden" name="id" value={t.id} />
            <button type="submit" className="text-xs text-slate hover:text-red">Delete</button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button className={chip(prop === "all")} onClick={() => setProp("all")}>All properties</button>
        {properties.map((p) => <button key={p.id} className={chip(prop === p.id)} onClick={() => setProp(p.id)}>{p.label}</button>)}
        <button className={chip(prop === "none")} onClick={() => setProp("none")}>Unassigned</button>
        <span className="mx-1 h-4 w-px bg-hairline" />
        <button className={chip(dir === "all")} onClick={() => setDir("all")}>All</button>
        <button className={chip(dir === "income")} onClick={() => setDir("income")}>Income</button>
        <button className={chip(dir === "expense")} onClick={() => setDir("expense")}>Expenses</button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lintel border border-hairline bg-surface px-4 py-6 text-sm text-slate">No entries for this filter.</p>
      ) : (
        <div className="overflow-hidden rounded-lintel border border-hairline bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-slate">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {prop === "all"
                ? groups.map(([pid, rows]) => (
                    <FragmentGroup key={pid} title={propName(pid === "none" ? null : pid)} net={groupNet(rows)} money={money}>
                      {rows.map((t) => editing === t.id ? <EditRow key={t.id} t={t} /> : <DisplayRow key={t.id} t={t} />)}
                    </FragmentGroup>
                  ))
                : filtered.map((t) => editing === t.id ? <EditRow key={t.id} t={t} /> : <DisplayRow key={t.id} t={t} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentGroup({ title, net, money, children }: { title: string; net: number; money: (n: number) => string; children: React.ReactNode }) {
  return (
    <>
      <tr className="bg-paper">
        <td colSpan={5} className="px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate">{title}</span>
          <span className={`ml-2 text-xs ${net >= 0 ? "text-evergreen" : "text-ink"}`}>net {money(net)}</span>
        </td>
      </tr>
      {children}
    </>
  );
}
