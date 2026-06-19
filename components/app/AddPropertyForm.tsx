"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { resolveJurisdiction, type JurisdictionKey } from "@/lib/jurisdictions";
import { createProperty } from "@/app/dashboard/properties/actions";
import { useReadOnly } from "@/components/app/RoleProvider";
import { AddressAutocomplete } from "@/components/app/AddressAutocomplete";
import { cn } from "@/lib/cn";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";
const labelCls = "mb-1 block text-sm text-ink";
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function AddPropertyForm({ region }: { region: JurisdictionKey }) {
  const readOnly = useReadOnly();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [labelTouched, setLabelTouched] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [isHmo, setIsHmo] = useState(false);
  const [ownership, setOwnership] = useState<"personal" | "company">("personal");
  const [photoName, setPhotoName] = useState("");

  if (readOnly) return null;
  if (!open) return <Button onClick={() => setOpen(true)}>Add property</Button>;

  const regionName = resolveJurisdiction(region).name;
  const card = (active: boolean) =>
    cn("flex-1 rounded-lintel border p-4 text-left transition-colors", active ? "border-evergreen bg-evergreen/5" : "border-hairline hover:border-evergreen/40");

  return (
    <Card className="mb-6">
      <CardBody>
        <form
          action={async (fd) => {
            await createProperty(fd);
            setOpen(false);
            setLabel(""); setLabelTouched(false); setLine1(""); setLine2(""); setCity(""); setPostcode(""); setIsHmo(false); setOwnership("personal"); setPhotoName("");
          }}
          className="space-y-5"
        >
          <input type="hidden" name="jurisdiction" value={region} />
          <input type="hidden" name="is_hmo" value={isHmo ? "on" : "off"} />
          <input type="hidden" name="ownership" value={ownership} />

          {/* Photo */}
          <div>
            <span className={labelCls}>Property photo</span>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lintel border border-dashed border-hairline bg-paper px-4 py-6 text-center hover:border-evergreen/40">
              <span className="text-sm font-medium text-ink">{photoName || "Click to upload a photo"}</span>
              <span className="mt-1 text-xs text-slate">JPG, PNG or WebP</span>
              <input type="file" name="photo" accept="image/*" className="hidden" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>

          <AddressAutocomplete
            onSelect={(a) => {
              setLine1(a.line1); setCity(a.city); setPostcode(a.postcode);
              // Auto-name the property from the address unless the user typed their own name.
              if (!labelTouched) setLabel([a.line1, a.city].filter(Boolean).join(", ") || a.formatted);
            }}
          />

          <label className="block">
            <span className={labelCls}>Property name *</span>
            <input name="label" required value={label} onChange={(e) => { setLabel(e.target.value); setLabelTouched(e.target.value.length > 0); }} placeholder="Auto-fills from the address — or type your own" className={inputCls} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className={labelCls}>Address line 1 *</span>
              <input name="address_line1" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="e.g. 1 Example Road" className={inputCls} /></label>
            <label className="block sm:col-span-2"><span className={labelCls}>Address line 2</span>
              <input name="address_line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apartment, suite, etc." className={inputCls} /></label>
            <label className="block"><span className={labelCls}>City *</span>
              <input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Postcode *</span>
              <input name="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="SW1A 1AA" className={inputCls} /></label>
          </div>

          <div>
            <span className={labelCls}>Region</span>
            <div className="flex h-11 items-center rounded-lintel border border-hairline bg-paper px-3 text-sm text-slate">
              {regionName} <span className="ml-2 text-xs">· your account region</span>
            </div>
          </div>

          {/* Property type */}
          <div>
            <span className={labelCls}>Property type</span>
            <div className="flex gap-3">
              <button type="button" onClick={() => setIsHmo(false)} className={card(!isHmo)}>
                <p className="font-medium text-ink">Single household</p>
                <p className="text-xs text-slate">One tenancy</p>
              </button>
              <button type="button" onClick={() => setIsHmo(true)} className={card(isHmo)}>
                <p className="font-medium text-ink">Multi-unit / HMO</p>
                <p className="text-xs text-slate">Rooms or multiple units</p>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Sub-type</span>
              <select name="subtype" defaultValue="" className={inputCls}>
                <option value="">Select…</option>
                {["House","Flat","Bungalow","Maisonette","Studio","Room","Other"].map((x) => <option key={x} value={x.toLowerCase()}>{x}</option>)}
              </select></label>
            <label className="block"><span className={labelCls}>Bedrooms</span>
              <input name="bedrooms" type="number" min="0" className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Status</span>
              <select name="status" defaultValue="vacant" className={inputCls}>
                <option value="vacant">Vacant</option>
                <option value="rented">Rented</option>
                <option value="unoccupied">Unoccupied</option>
              </select></label>
          </div>

          {/* All-electric */}
          <label className="flex items-start gap-3 rounded-lintel border border-hairline bg-paper p-4">
            <input type="checkbox" name="all_electric" className="mt-1 h-4 w-4 rounded border-hairline" />
            <span>
              <span className="block text-sm font-medium text-ink">All-electric property (no gas supply)</span>
              <span className="mt-0.5 block text-xs text-slate">A gas safety certificate won&apos;t be required and won&apos;t show as missing in compliance.</span>
            </span>
          </label>

          {/* Ownership */}
          <div className="rounded-lintel border border-hairline bg-paper p-4">
            <span className={labelCls}>Owned by</span>
            <div className="flex gap-3">
              <button type="button" onClick={() => setOwnership("personal")} className={card(ownership === "personal")}>
                <p className="font-medium text-ink">Personal</p>
                <p className="text-xs text-slate">MTD ITSA / Section 24 applies</p>
              </button>
              <button type="button" onClick={() => setOwnership("company")} className={card(ownership === "company")}>
                <p className="font-medium text-ink">Limited company</p>
                <p className="text-xs text-slate">Corporation tax; interest deductible</p>
              </button>
            </div>
            {ownership === "company" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="block"><span className="mb-1 block text-xs text-slate">Company name</span>
                  <input name="company_name" placeholder="e.g. Acme Property Holdings Ltd" className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-slate">Company number</span>
                  <input name="company_no" placeholder="12345678" className={inputCls} /></label>
                <label className="block"><span className="mb-1 block text-xs text-slate">Year-end month</span>
                  <select name="year_end_month" defaultValue="March" className={inputCls}>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit">Add property</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
