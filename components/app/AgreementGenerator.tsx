"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import type { AgreementField, AgreementSpec } from "@/lib/tenancy-agreement/types";
import { checkConstraints } from "@/lib/tenancy-agreement/core";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";
const areaCls =
  "min-h-[76px] w-full rounded-lintel border border-hairline bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export interface PropertyOption {
  id: string;
  label: string;
  address: string;
  tenant_name?: string | null;
  tenant_email?: string | null;
  tenant_phone?: string | null;
  rent_amount?: number | null;
  deposit_amount?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

function Field({
  f,
  value,
  onChange,
}: {
  f: AgreementField;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = (
    <span className="mb-1 flex items-center gap-2 text-sm text-ink">
      {f.label}
      {f.required && <span className="text-xs text-red">Required</span>}
    </span>
  );
  return (
    <label className={f.type === "longtext" ? "block sm:col-span-2" : "block"}>
      {label}
      {f.type === "select" ? (
        <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Choose...</option>
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : f.type === "longtext" ? (
        <textarea className={areaCls} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : f.type === "checkbox" ? (
        <span className="flex h-11 items-center gap-2">
          <input
            type="checkbox"
            checked={value === "Yes"}
            onChange={(e) => onChange(e.target.checked ? "Yes" : "")}
            className="h-4 w-4 rounded border-hairline"
          />
          <span className="text-sm text-slate">Confirmed</span>
        </span>
      ) : (
        <input
          className={inputCls}
          type={f.type === "date" ? "date" : "text"}
          inputMode={f.type === "money" || f.type === "number" ? "decimal" : undefined}
          value={value}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {f.hint && <span className="mt-1 block text-xs text-slate">{f.hint}</span>}
    </label>
  );
}

export function AgreementGenerator({
  spec,
  coreFields,
  properties,
  orgName,
  defaultEmail,
}: {
  spec: AgreementSpec;
  coreFields: AgreementField[];
  properties: PropertyOption[];
  orgName: string;
  defaultEmail: string;
}) {
  const allFields = useMemo(() => [...coreFields, ...spec.fields], [coreFields, spec.fields]);

  const [values, setValues] = useState<Record<string, string>>(() => ({
    landlord_name: orgName,
    term_type: "Fixed term",
    rent_period: "per calendar month",
    furnished: "Unfurnished",
    smoking: "Not permitted",
    pets: "Not permitted without consent",
    rent_day: "the 1st day of each month",
    sharers: "None",
    bills_included: "None. The tenant pays all utilities and local taxes.",
  }));
  const [propertyId, setPropertyId] = useState("");
  const [saveToVault, setSaveToVault] = useState(true);
  const [emailTo, setEmailTo] = useState(defaultEmail);
  const [busy, setBusy] = useState<"" | "pdf" | "docx" | "email">("");
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const missing = allFields.filter((f) => f.required && !values[f.key]?.trim());
  const { errors: ruleErrors, warnings: ruleWarnings } = useMemo(
    () => checkConstraints(spec, values),
    [spec, values]
  );
  const blocked = missing.length > 0 || ruleErrors.length > 0;

  function applyProperty(id: string) {
    setPropertyId(id);
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    setValues((s) => ({
      ...s,
      property_address: p.address,
      tenant_name: p.tenant_name ?? s.tenant_name ?? "",
      tenant_email: p.tenant_email ?? s.tenant_email ?? "",
      tenant_phone: p.tenant_phone ?? s.tenant_phone ?? "",
      rent_amount: p.rent_amount != null ? String(p.rent_amount) : s.rent_amount ?? "",
      deposit_amount: p.deposit_amount != null ? String(p.deposit_amount) : s.deposit_amount ?? "",
      start_date: p.start_date ?? s.start_date ?? "",
      end_date: p.end_date ?? s.end_date ?? "",
    }));
  }

  async function generate(format: "pdf" | "docx") {
    setBusy(format);
    setMsg(null);
    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, format, action: "download", propertyId: propertyId || null, saveToVault }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Could not generate the agreement.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${spec.documentTitle.replace(/[^a-z0-9]+/gi, "-")}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg({ tone: "ok", text: `Downloaded as ${format.toUpperCase()}.${saveToVault && propertyId ? " A copy is saved to the property's documents." : ""}` });
    } catch (e: any) {
      setMsg({ tone: "err", text: e.message ?? "Something went wrong." });
    } finally {
      setBusy("");
    }
  }

  async function email(format: "pdf" | "docx") {
    setBusy("email");
    setMsg(null);
    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, format, action: "email", to: emailTo, propertyId: propertyId || null, saveToVault }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error ?? "Could not send the agreement.");
      setMsg({ tone: j.note ? "err" : "ok", text: j.note ?? `Sent to ${emailTo}.` });
    } catch (e: any) {
      setMsg({ tone: "err", text: e.message ?? "Something went wrong." });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="grid gap-6">
      {spec.prescribedForm && (
        <div className="rounded-lintel border border-red/40 bg-red/5 p-4">
          <p className="text-sm font-medium text-red">
            {spec.regionName ?? spec.countryName} requires a prescribed form: {spec.prescribedForm.name}
          </p>
          <p className="mt-1 text-sm text-slate">{spec.prescribedForm.note}</p>
          <a
            href={spec.prescribedForm.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-medium text-evergreen underline"
          >
            Open the official form
          </a>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="moss">{spec.documentTitle}</Badge>
            <Badge>{[spec.regionName, spec.countryName].filter(Boolean).join(", ")}</Badge>
            <Badge>Template {spec.version}</Badge>
          </div>
          <p className="mb-4 text-sm text-slate">
            Drafted against {spec.statutoryBasis}.{" "}
            <a href={spec.legislationUrl} target="_blank" rel="noreferrer" className="text-evergreen underline">
              Read the legislation
            </a>
          </p>

          <label className="mb-4 block">
            <span className="mb-1 block text-sm text-ink">Prefill from a property</span>
            <select className={inputCls} value={propertyId} onChange={(e) => applyProperty(e.target.value)}>
              <option value="">Start blank</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate">
              Pulls the address, tenant and rent from the tenancy so you are not retyping them.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            {coreFields.map((f) => (
              <Field key={f.key} f={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-1 text-lg font-medium text-evergreen">
            Required in {spec.regionName ?? spec.countryName}
          </h2>
          <p className="mb-4 text-sm text-slate">
            These details are specific to where the property is. Getting them wrong is what usually invalidates an
            agreement or a later possession claim.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {spec.fields.map((f) => (
              <Field key={f.key} f={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
            ))}
          </div>
        </CardBody>
      </Card>

      {spec.attachments.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="mb-1 text-lg font-medium text-evergreen">Serve these with the agreement</h2>
            <p className="mb-3 text-sm text-slate">
              The agreement is only part of the job. These documents usually have to be given to the tenant too.
            </p>
            <ul className="grid gap-2">
              {spec.attachments.map((a) => (
                <li key={a.label} className="rounded-lintel border border-hairline bg-paper p-3">
                  <span className="text-sm font-medium text-ink">{a.label}</span>
                  {a.note && <span className="mt-0.5 block text-xs text-slate">{a.note}</span>}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <h2 className="mb-3 text-lg font-medium text-evergreen">Generate</h2>

          {missing.length > 0 && (
            <div className="mb-4 rounded-lintel border border-red/40 bg-red/5 p-3">
              <p className="text-sm font-medium text-red">Still needed: {missing.map((f) => f.label).join(", ")}</p>
            </div>
          )}

          {ruleErrors.length > 0 && (
            <div className="mb-4 rounded-lintel border border-red/40 bg-red/5 p-3">
              <p className="mb-1 text-sm font-medium text-red">
                This would produce an agreement that is wrong for {spec.regionName ?? spec.countryName}
              </p>
              <ul className="grid gap-1">
                {ruleErrors.map((e) => (
                  <li key={e} className="text-sm text-slate">{e}</li>
                ))}
              </ul>
            </div>
          )}

          {ruleWarnings.length > 0 && (
            <div className="mb-4 rounded-lintel border border-hairline bg-paper p-3">
              <p className="mb-1 text-sm font-medium text-ink">Worth checking</p>
              <ul className="grid gap-1">
                {ruleWarnings.map((w) => (
                  <li key={w} className="text-sm text-slate">{w}</li>
                ))}
              </ul>
            </div>
          )}

          {propertyId && (
            <label className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveToVault}
                onChange={(e) => setSaveToVault(e.target.checked)}
                className="h-4 w-4 rounded border-hairline"
              />
              <span className="text-sm text-slate">
                Save a copy to this property&apos;s documents and share it with the tenant
              </span>
            </label>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            <Button onClick={() => generate("pdf")} disabled={!!busy || blocked}>
              {busy === "pdf" ? "Building..." : "Download PDF"}
            </Button>
            <Button variant="ghost" onClick={() => generate("docx")} disabled={!!busy || blocked}>
              {busy === "docx" ? "Building..." : "Download Word"}
            </Button>
          </div>

          <div className="rounded-lintel border border-hairline bg-paper p-3">
            <span className="mb-2 block text-sm font-medium text-ink">Or email it</span>
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-[240px] flex-1">
                <span className="mb-1 block text-xs text-slate">Send to</span>
                <input className={inputCls} value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="tenant@example.com" />
              </label>
              <Button variant="ghost" onClick={() => email("pdf")} disabled={!!busy || blocked}>
                {busy === "email" ? "Sending..." : "Email PDF"}
              </Button>
              <Button variant="ghost" onClick={() => email("docx")} disabled={!!busy || blocked}>
                Email Word
              </Button>
            </div>
          </div>

          {msg && (
            <p className={`mt-3 text-sm ${msg.tone === "ok" ? "text-evergreen" : "text-red"}`}>{msg.text}</p>
          )}

          <div className="mt-5 rounded-lintel border border-hairline bg-paper p-3">
            <p className="text-xs text-slate">
              This generator produces a draft. It is not legal advice and it is not a certified form. Read it in full and
              have it checked by a qualified lawyer in {spec.regionName ?? spec.countryName} before you use it. Every
              document carries a provenance block naming the statute it was drafted against, so your solicitor can see
              exactly what basis it was built on.
            </p>
          </div>
        </CardBody>
      </Card>

      {spec.warnings.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="mb-2 text-lg font-medium text-red">Watch out for</h2>
            <ul className="grid gap-2">
              {spec.warnings.map((w) => (
                <li key={w} className="text-sm text-slate">{w}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
