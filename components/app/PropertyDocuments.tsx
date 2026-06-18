"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { uploadPropertyDocument } from "@/app/dashboard/properties/document-actions";
import { useReadOnly } from "@/components/app/RoleProvider";
import { DOC_TYPES, DOC_CATEGORIES } from "@/lib/doc-types";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";



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
        {DOC_CATEGORIES.map((cat) => (
          <optgroup key={cat} label={cat}>
            {DOC_TYPES.filter((d) => d.category === cat).map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <label className="text-xs text-slate">Issued<input name="issued_at" type="date" className={inputCls} /></label>
      <label className="text-xs text-slate">Expires<input name="expires_at" type="date" className={inputCls} /></label>
      <label className="flex items-center gap-2 text-xs text-slate sm:col-span-2"><input type="checkbox" name="visible_to_tenant" className="h-4 w-4" /> Show this document to the tenant in their portal</label>
      <input name="file" type="file" required className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm sm:col-span-2" />
      <div className="flex gap-2 sm:col-span-2">
        <Button size="sm" type="submit">Save</Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
