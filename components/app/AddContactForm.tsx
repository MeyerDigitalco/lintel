"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { createContact } from "@/app/dashboard/contacts/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

const KINDS = [
  ["contractor", "Contractor"],
  ["supplier", "Supplier"],
  ["agent", "Agent"],
  ["tenant", "Tenant"],
  ["other", "Other"],
];

export function AddContactForm() {
  const [open, setOpen] = useState(false);
  if (!open) return <Button onClick={() => setOpen(true)}>New contact</Button>;
  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => { await createContact(fd); setOpen(false); }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Name</span>
            <input name="name" required className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Type</span>
            <select name="kind" className={inputCls} defaultValue="contractor">
              {KINDS.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Company</span>
            <input name="company" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Phone</span>
            <input name="phone" className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Email</span>
            <input name="email" type="email" className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Notes</span>
            <input name="notes" className={inputCls} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save contact</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
