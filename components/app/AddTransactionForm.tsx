"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { type Direction } from "@/lib/sa105";
import { categoriesForRegion } from "@/lib/tax-categories";
import { createTransaction } from "@/app/dashboard/transactions/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function AddTransactionForm({
  properties,
  country,
}: {
  properties: { id: string; label: string }[];
  country: string;
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<Direction>("expense");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [vendor, setVendor] = useState("");
  const [ocrState, setOcrState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [repeatMode, setRepeatMode] = useState<"none" | "forward" | "back">("none");
  const [repeatFreq, setRepeatFreq] = useState("monthly");
  const [repeatCount, setRepeatCount] = useState("12");

  async function handleReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrState("scanning");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.amount != null) setAmount(String(data.amount));
      if (data.date) setDate(data.date);
      if (data.vendor) setVendor(data.vendor);
      setOcrState("done");
    } catch {
      setOcrState("error");
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Add transaction</Button>;
  }

  const categories = categoriesForRegion(country, direction);

  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => {
            await createTransaction(fd);
            setOpen(false);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Type</span>
            <select
              name="direction"
              className={inputCls}
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Category</span>
            <select name="sa105_category" className={inputCls} defaultValue={categories[0]?.key}>
              {categories.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Amount</span>
            <input
              name="amount"
              required
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Date</span>
            <input
              name="occurred_on"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Description</span>
            <input
              name="description"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. British Gas, boiler service"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Property (optional)</span>
            <select name="property_id" className={inputCls} defaultValue="">
              <option value="">- Unassigned -</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-sm text-ink">
              Receipt (photo or PDF)
              {ocrState === "scanning" && <Badge tone="amber">Scanning…</Badge>}
              {ocrState === "done" && <Badge tone="mint">Fields pre-filled</Badge>}
              {ocrState === "error" && <Badge tone="red">OCR failed, enter manually</Badge>}
            </span>
            <input
              name="receipt"
              type="file"
              accept="image/*,application/pdf"
              onChange={handleReceipt}
              className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm"
            />
            <span className="mt-1 block text-xs text-slate">
              We read the amount, date and vendor automatically. Always check them.
            </span>
          </label>

          <div className="rounded-lintel border border-hairline bg-paper p-3 sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-ink">Repeat or backdate</span>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs text-slate">Mode</span>
                <select name="repeat_mode" value={repeatMode} onChange={(e) => setRepeatMode(e.target.value as any)} className={inputCls}>
                  <option value="none">Just this entry</option>
                  <option value="forward">Repeat forward (future)</option>
                  <option value="back">Backdate (past)</option>
                </select>
              </label>
              {repeatMode !== "none" && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate">Every</span>
                    <select name="repeat_freq" value={repeatFreq} onChange={(e) => setRepeatFreq(e.target.value)} className={inputCls}>
                      <option value="monthly">Month</option>
                      <option value="quarterly">Quarter</option>
                      <option value="yearly">Year</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate">How many</span>
                    <input name="repeat_count" type="number" min="1" max="60" value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)} className={inputCls} />
                  </label>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-slate">
              {repeatMode === "none"
                ? "Creates a single entry on the date above."
                : repeatMode === "forward"
                ? `Creates ${repeatCount || 0} entries of the same amount going forward, one per ${repeatFreq === "yearly" ? "year" : repeatFreq === "quarterly" ? "quarter" : "month"}, starting on the date above.`
                : `Backdates ${repeatCount || 0} entries of the same amount, one per ${repeatFreq === "yearly" ? "year" : repeatFreq === "quarterly" ? "quarter" : "month"}, working back from the date above. Each one is editable and deletable.`}
            </p>
          </div>

          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
