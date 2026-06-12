"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { uploadPropertyDocument } from "@/app/dashboard/properties/document-actions";
import { useReadOnly } from "@/components/app/RoleProvider";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

const DOC_TYPES = [
  ["epc", "EPC"],
  ["gas_safety", "Gas safety certificate"],
  ["eicr", "Electrical (EICR)"],
  ["deposit_cert", "Deposit protection certificate"],
  ["inventory", "Inventory"],
  ["tenancy_agreement", "Tenancy agreement"],
  ["correspondence", "Correspondence"],
  ["e_signature", "E-signature"],
  ["other", "Other"],
];

export function PropertyDocumentUpload({ propertyId }: { propertyId: string }) {
  const readOnly = useReadOnly();
  const [open, setOpen] = useState(false);

  if (readOnly) return null;
  if (!open) return <Button size="sm" onClick={() => setOpen(true)}>Upload document</Button>;

  return (
    <form action={async (fd) => { await uploadPropertyDocument(fd); setOpen(false); }} className="grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="property_id" value={propertyId} />
      <input name="label" placeholder="Label (e.g. EPC 2026)" className={inputCls} />
      <select name="doc_type" className={inputCls} defaultValue="other">
        {DOC_TYPES.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
      </select>
      <label className="text-xs text-slate">Issued<input name="issued_at" type="date" className={inputCls} /></label>
      <label className="text-xs text-slate">Expires<input name="expires_at" type="date" className={inputCls} /></label>
      <input name="file" type="file" required className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm sm:col-span-2" />
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" type="submit">Save</Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
