"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createUnit, createRegistration } from "@/app/dashboard/properties/actions";
import { useReadOnly } from "@/components/app/RoleProvider";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export function AddUnitForm({ propertyId }: { propertyId: string }) {
  const readOnly = useReadOnly();
  if (readOnly) return null;
  return (
    <form action={createUnit} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="property_id" value={propertyId} />
      <input name="label" required placeholder="e.g. Room A / Flat 1" className={`${inputCls} w-48`} />
      <Button size="sm" type="submit">Add unit</Button>
    </form>
  );
}

export function AddRegistrationForm({
  propertyId,
  defaultScheme,
}: {
  propertyId: string;
  defaultScheme?: string;
}) {
  const readOnly = useReadOnly();
  const [open, setOpen] = useState(false);

  if (readOnly) return null;
  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Add registration</Button>
    );
  }
  return (
    <form action={async (fd) => { await createRegistration(fd); setOpen(false); }} className="grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="property_id" value={propertyId} />
      <input name="scheme" required defaultValue={defaultScheme} placeholder="Scheme" className={inputCls} />
      <input name="reference" placeholder="Reference number" className={inputCls} />
      <label className="text-xs text-slate">Issued<input name="issued_at" type="date" className={inputCls} /></label>
      <label className="text-xs text-slate">Renews<input name="renews_at" type="date" className={inputCls} /></label>
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" type="submit">Save</Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
