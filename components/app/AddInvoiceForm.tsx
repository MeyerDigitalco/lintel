"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { createInvoice } from "@/app/dashboard/invoices/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function AddInvoiceForm({
  contacts,
  properties,
}: {
  contacts: { id: string; name: string }[];
  properties: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (!open) return <Button onClick={() => setOpen(true)}>New invoice</Button>;
  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => { await createInvoice(fd); setOpen(false); }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Contact</span>
            <select name="contact_id" className={inputCls} defaultValue="">
              <option value="">— None —</option>
              {contacts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Property (optional)</span>
            <select name="property_id" className={inputCls} defaultValue="">
              <option value="">— None —</option>
              {properties.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Amount</span>
            <input name="amount" required inputMode="decimal" placeholder="£0.00" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Due date</span>
            <input name="due_date" type="date" className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Description</span>
            <input name="description" placeholder="e.g. Boiler service" className={inputCls} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Create invoice</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
