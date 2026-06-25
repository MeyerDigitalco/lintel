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
  const [name, setName] = useState("");
  const [kind, setKind] = useState("contractor");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reading, setReading] = useState(false);
  const [aiNote, setAiNote] = useState("");

  function reset() {
    setName(""); setKind("contractor"); setCompany(""); setPhone(""); setEmail(""); setAiNote("");
  }

  async function onCard(file: File | undefined) {
    if (!file) return;
    setReading(true);
    setAiNote("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract-contact", { method: "POST", body: fd });
      const json = await res.json();
      const f = (json?.fields ?? {}) as Record<string, string>;
      if (f.name) setName(f.name);
      if (f.company) setCompany(f.company);
      if (f.phone) setPhone(f.phone);
      if (f.email) setEmail(f.email);
      if (f.kind) setKind(f.kind);
      if (!f.name && f.company) setName(f.company); // fall back to company as the contact name
      const got = Object.keys(f).length;
      setAiNote(got > 0 ? `Read ${got} field${got > 1 ? "s" : ""} from the photo — check and edit below.` : "Couldn't read the photo — enter details manually.");
    } catch {
      setAiNote("Couldn't read the photo — enter details manually.");
    } finally {
      setReading(false);
    }
  }

  if (!open) return <Button onClick={() => setOpen(true)}>New contact</Button>;
  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => { await createContact(fd); setOpen(false); reset(); }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {/* Snap a card / vehicle decals */}
          <div className="sm:col-span-2 rounded-lintel border border-evergreen/30 bg-evergreen/5 p-4">
            <p className="text-sm font-medium text-ink">Snap a card or van</p>
            <p className="mt-0.5 text-xs text-slate">Photograph a business card or the contractor&apos;s vehicle signage and we&apos;ll fill in their details.</p>
            <label className="mt-3 flex cursor-pointer items-center justify-center rounded-lintel border border-dashed border-evergreen/40 bg-surface px-4 py-3 text-center hover:border-evergreen/60">
              <span className="text-sm text-ink">{reading ? "Reading…" : "Take or upload a photo"}</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" disabled={reading} onChange={(e) => onCard(e.target.files?.[0])} />
            </label>
            {aiNote && <p className="mt-2 text-xs text-evergreen">{aiNote}</p>}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm text-ink">Name</span>
            <input name="name" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Type</span>
            <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
              {KINDS.map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Company</span>
            <input name="company" value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Phone</span>
            <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Email</span>
            <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-ink">Notes</span>
            <input name="notes" className={inputCls} />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit">Save contact</Button>
            <Button type="button" variant="ghost" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
