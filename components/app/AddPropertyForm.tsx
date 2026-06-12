"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { JURISDICTION_OPTIONS } from "@/lib/jurisdictions";
import { createProperty } from "@/app/dashboard/properties/actions";
import { useReadOnly } from "@/components/app/RoleProvider";
import { AddressAutocomplete } from "@/components/app/AddressAutocomplete";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function AddPropertyForm() {
  const readOnly = useReadOnly();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  if (readOnly) return null;
  if (!open) return <Button onClick={() => setOpen(true)}>Add property</Button>;

  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => {
            await createProperty(fd);
            setOpen(false);
            setLabel(""); setLine1(""); setCity(""); setPostcode("");
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Find address</span>
            <AddressAutocomplete
              onSelect={(a) => {
                setLine1(a.line1);
                setCity(a.city);
                setPostcode(a.postcode);
                if (!label) setLabel(a.line1 || a.formatted);
              }}
            />
          </div>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Property name / label</span>
            <input name="label" required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. 12 Oak Street" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Nation</span>
            <select name="jurisdiction" className={inputCls} defaultValue="england">
              {JURISDICTION_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <span className="mt-1 block text-xs text-slate">Loads the correct tenancy &amp; compliance rules.</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Postcode</span>
            <input name="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="SW1A 1AA" className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Address line</span>
            <input name="address_line1" value={line1} onChange={(e) => setLine1(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Town / city</span>
            <input name="city" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
            <input type="checkbox" name="is_hmo" className="h-4 w-4 rounded border-hairline" />
            This is a house in multiple occupation (HMO)
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save property</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
