/**
 * Recreations of the accountant portal UI for the partner page.
 *
 * These are built from the real portal's layout, palette and data shapes rather
 * than being bitmap screenshots, so they stay sharp on any display, reflow on
 * mobile, and are readable by screen readers and by search engines. The figures
 * are illustrative sample data, and the page says so.
 *
 * They deliberately use the APP palette (evergreen/paper/hairline), not the
 * editorial marketing palette, because the point is to show the accountant what
 * the actual product looks like.
 */

function Chrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-edge border border-sepia bg-white">
      <div className="flex items-center gap-2 border-b border-sepia bg-bone px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-sepia" />
        <span className="h-2.5 w-2.5 rounded-full bg-sepia" />
        <span className="h-2.5 w-2.5 rounded-full bg-sepia" />
        <span className="ml-3 font-mono text-[12px] text-umber">{title}</span>
      </div>
      <div className="bg-paper p-4 md:p-5">{children}</div>
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "good" | "warn" }) {
  const colour = tone === "good" ? "text-moss" : tone === "warn" ? "text-amber" : "text-evergreen";
  return (
    <div className="rounded-lintel border border-hairline bg-surface p-3.5">
      <div className="text-[11px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`mt-1.5 font-heading text-[26px] font-semibold tabular-nums ${colour}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-slate">{hint}</div>}
    </div>
  );
}

/** The data-quality header the accountant sees on opening a client. */
export function PreviewDataQuality() {
  return (
    <Chrome title="lintelsquared.com/dashboard/accountant">
      <div className="mb-4">
        <div className="font-heading text-[19px] font-semibold text-ink">Accountant pack</div>
        <div className="mt-0.5 text-[12px] text-slate">
          Everything your accountant needs for 2026/27, SA105 breakdown, evidence and queries.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Transactions" value="412" />
        <Stat label="Categorised" value="94%" hint="26 to review" tone="warn" />
        <Stat label="Expenses with receipt" value="88%" tone="good" />
        <Stat label="Property documents" value="63" />
      </div>
      <div className="mt-3 rounded-lintel border border-hairline bg-surface px-3.5 py-2.5 text-[12px] text-slate">
        You have read-only access to this portfolio. You can review everything and post queries, but
        cannot change the landlord&apos;s records.
      </div>
    </Chrome>
  );
}

/** Per-property SA105 breakdown. */
export function PreviewSa105() {
  const rows = [
    { label: "12 Priory Road", income: "£13,200", expense: "£3,940", net: "£9,260" },
    { label: "Flat 3, 88 Elm Street", income: "£25,800", expense: "£8,115", net: "£17,685" },
    { label: "2A Oak Gardens", income: "£13,200", expense: "£2,470", net: "£10,730" },
    { label: "17 Beech Lane", income: "£17,100", expense: "£4,880", net: "£12,220" },
  ];
  return (
    <Chrome title="SA105 by property">
      <div className="overflow-hidden rounded-lintel border border-hairline bg-surface">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-hairline text-left text-[10px] uppercase tracking-wide text-slate">
              <th className="px-3.5 py-2.5 font-medium">Property</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Income</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Expenses</th>
              <th className="px-3.5 py-2.5 text-right font-medium">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-hairline last:border-0">
                <td className="px-3.5 py-2.5 text-ink">{r.label}</td>
                <td className="px-3.5 py-2.5 text-right tabular-nums text-moss">{r.income}</td>
                <td className="px-3.5 py-2.5 text-right tabular-nums text-slate">{r.expense}</td>
                <td className="px-3.5 py-2.5 text-right font-medium tabular-nums text-ink">{r.net}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-1.5 rounded-lintel border border-hairline bg-surface p-3.5">
        <div className="mb-1 text-[10px] uppercase tracking-wide text-slate">Category totals (SA105)</div>
        {[
          ["Rents & other income from property", "£69,300.00"],
          ["Property repairs & maintenance", "£7,215.40"],
          ["Loan interest & other finance costs", "£8,940.00"],
          ["Legal, management & other professional fees", "£2,180.00"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between border-b border-hairline py-1.5 text-[12px] last:border-0">
            <span className="text-slate">{k}</span>
            <span className="tabular-nums text-ink">{v}</span>
          </div>
        ))}
      </div>
    </Chrome>
  );
}

/** The two-way query thread. */
export function PreviewQueries() {
  const notes = [
    { role: "accountant", body: "Is the £2,400 boiler at Elm Street a replacement or an upgrade? Affects capital vs revenue.", resolved: false },
    { role: "landlord", body: "Like-for-like replacement, same spec. Invoice is attached to the transaction.", resolved: true },
    { role: "accountant", body: "Please confirm the Oak Gardens mortgage is on the personal name, not the company.", resolved: false },
  ];
  return (
    <Chrome title="Queries">
      <div className="rounded-lintel border border-hairline bg-surface p-4">
        <div className="mb-3 font-heading text-[15px] font-semibold text-ink">Queries</div>
        <div className="flex gap-2">
          <div className="h-9 flex-1 rounded-lintel border border-hairline bg-paper px-3 text-[12px] leading-9 text-slate">
            Ask the landlord a question...
          </div>
          <div className="flex h-9 items-center rounded-lintel bg-evergreen px-3.5 text-[12px] font-medium text-paper">
            Add
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li key={n.body} className="flex items-start justify-between gap-3 rounded-lintel bg-paper px-3 py-2.5 text-[12px]">
              <span className={n.resolved ? "text-slate line-through" : "text-ink"}>
                <span className="mr-1.5 inline-flex items-center rounded-full bg-ink/5 px-1.5 py-0.5 text-[10px] font-medium text-slate">
                  {n.role}
                </span>
                {n.body}
              </span>
              {!n.resolved && <span className="shrink-0 text-[11px] text-evergreen underline">Resolve</span>}
            </li>
          ))}
        </ul>
      </div>
    </Chrome>
  );
}

/** Report library. */
export function PreviewReports() {
  const reports = [
    ["Income & expense statement", "Accounting"],
    ["P&L summary", "Accounting"],
    ["Supplier expenses", "Accounting"],
    ["Rent ledger", "Rent"],
    ["Overdue rent payments", "Rent"],
    ["Compliance status", "Compliance"],
  ];
  return (
    <Chrome title="Reports">
      <div className="grid gap-2.5 sm:grid-cols-2">
        {reports.map(([title, group]) => (
          <div key={title} className="rounded-lintel border border-hairline bg-surface p-3.5">
            <div className="text-[10px] uppercase tracking-wide text-slate">{group}</div>
            <div className="mt-1 font-heading text-[14px] font-semibold text-ink">{title}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lintel border border-hairline bg-surface px-3.5 py-3">
        <span className="text-[12px] text-slate">Every report exports to PDF or CSV.</span>
        <span className="rounded-lintel bg-evergreen px-3 py-1.5 text-[11px] font-medium text-paper">
          Export SA105 CSV
        </span>
      </div>
    </Chrome>
  );
}
