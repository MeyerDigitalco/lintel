"use client";

import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Notice = { label: string; when: string; period: string };
type Property = { id: string; label: string; address: string };

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";
const labelCls = "mb-1 block text-xs font-medium text-slate";

export function NoticeGenerator({
  notices,
  properties,
  orgName,
  countryName,
  governingLaw,
}: {
  notices: Notice[];
  properties: Property[];
  orgName: string;
  countryName: string;
  governingLaw: string;
}) {
  const [idx, setIdx] = useState(0);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [landlordName, setLandlordName] = useState(orgName);
  const [landlordContact, setLandlordContact] = useState("");
  const [tenantName, setTenantName] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [dateServed, setDateServed] = useState(today);
  const [expiry, setExpiry] = useState("");
  const [reason, setReason] = useState("");

  const notice = notices[idx];
  const property = useMemo(() => properties.find((p) => p.id === propertyId), [properties, propertyId]);
  const fmt = (d: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "__________");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <style dangerouslySetInnerHTML={{ __html: "@media print { body * { visibility: hidden !important; } #notice-print, #notice-print * { visibility: visible !important; } #notice-print { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; } .no-print { display: none !important; } }" }} />

      <Card className="no-print">
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Build your notice</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className={labelCls}>Notice type</label>
              <select className={inputCls} value={idx} onChange={(e) => setIdx(Number(e.target.value))}>
                {notices.map((n, i) => (<option key={n.label} value={i}>{n.label}</option>))}
              </select>
              {notice && <p className="mt-1 text-xs text-slate">{notice.when} · period: {notice.period}</p>}
            </div>
            <div>
              <label className={labelCls}>Property</label>
              <select className={inputCls} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                {properties.length === 0 && <option value="">No properties</option>}
                {properties.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Landlord / agent name</label>
              <input className={inputCls} value={landlordName} onChange={(e) => setLandlordName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Landlord contact (address / email)</label>
              <input className={inputCls} value={landlordContact} onChange={(e) => setLandlordContact(e.target.value)} placeholder="Where the tenant can reply" />
            </div>
            <div>
              <label className={labelCls}>Tenant name(s)</label>
              <input className={inputCls} value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Full name(s)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Date served</label>
                <input type="date" className={inputCls} value={dateServed} onChange={(e) => setDateServed(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Notice expires</label>
                <input type="date" className={inputCls} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Reason / grounds (optional)</label>
              <textarea className={`${inputCls} h-24 py-2`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. rent arrears of … / end of term / owner occupation" />
            </div>
            <Button onClick={() => window.print()}>Print / Save as PDF</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div id="notice-print" className="text-sm leading-relaxed text-ink">
            <p className="font-medium">{landlordName || "[Landlord / agent]"}</p>
            {landlordContact && <p className="text-slate">{landlordContact}</p>}
            <p className="mt-4 text-slate">{fmt(dateServed)}</p>
            <p className="mt-4">To: {tenantName || "[Tenant name(s)]"}</p>
            <p>Re: {property?.address || "[Property address]"}</p>

            <h3 className="mt-6 text-base font-semibold uppercase tracking-wide">{notice?.label ?? "Notice"}</h3>

            <p className="mt-4">Dear {tenantName || "Tenant"},</p>
            <p className="mt-2">
              This letter serves as a <strong>{notice?.label}</strong> in respect of the tenancy at{" "}
              <strong>{property?.address || "[property address]"}</strong>.
            </p>
            {reason && <p className="mt-2">{reason}</p>}
            <p className="mt-2">
              The applicable notice period is <strong>{notice?.period}</strong>. This notice takes effect from {fmt(dateServed)}
              {expiry ? <> and expires on <strong>{fmt(expiry)}</strong></> : null}.
            </p>
            <p className="mt-2 text-slate">Issued under {governingLaw} ({countryName}).</p>

            <p className="mt-8">Yours faithfully,</p>
            <p className="mt-6">_____________________________</p>
            <p>{landlordName || "[Landlord / agent]"}</p>

            <p className="mt-8 text-xs text-slate">
              Template guidance only, Lintel provides software, not legal advice. Check your local notice
              requirements and serving rules before relying on this document.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
