"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { createTenancy } from "@/app/dashboard/rent/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function AddTenancyForm({
  properties,
}: {
  properties: { id: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (properties.length === 0) {
    return (
      <p className="text-sm text-slate">
        Add a property first to create a tenancy.
      </p>
    );
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Add tenancy</Button>;
  }

  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => {
            await createTenancy(fd);
            setOpen(false);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Property</span>
            <select name="property_id" className={inputCls} required>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate">
              Tenancy type is set automatically from the property&apos;s nation.
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Monthly rent</span>
            <input name="rent_amount" required inputMode="decimal" placeholder="0.00" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Start date</span>
            <input name="start_date" type="date" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Deposit held</span>
            <input name="deposit_amount" inputMode="decimal" placeholder="0.00" className={inputCls} />
          </label>
          <input type="hidden" name="rent_period" value="monthly" />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save tenancy</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
