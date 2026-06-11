"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { addComplianceItem } from "@/app/dashboard/compliance/actions";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

type Prop = { id: string; label: string; jurisdiction: string };
type Item = { key: string; label: string };

export function AddComplianceForm({
  properties,
  itemsByJurisdiction,
}: {
  properties: Prop[];
  itemsByJurisdiction: Record<string, Item[]>;
}) {
  const [open, setOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");

  if (properties.length === 0) {
    return (
      <p className="text-sm text-slate">Add a property first to track compliance.</p>
    );
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Add compliance item</Button>;
  }

  const selected = properties.find((p) => p.id === propertyId);
  const items = selected ? itemsByJurisdiction[selected.jurisdiction] ?? [] : [];

  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => {
            await addComplianceItem(fd);
            setOpen(false);
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Property</span>
            <select
              name="property_id"
              className={inputCls}
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Item</span>
            <select name="item_key" className={inputCls}>
              {items.map((i) => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate">
              Only items required in this property&apos;s nation are shown.
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Issued</span>
            <input name="issued_at" type="date" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Expires</span>
            <input name="expires_at" type="date" className={inputCls} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
