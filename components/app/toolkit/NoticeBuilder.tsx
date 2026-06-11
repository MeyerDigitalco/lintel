"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { LegalDisclaimer } from "./Disclaimer";
import { fillTemplate, addDays, type NoticeKind, type PossessionGround } from "@/lib/toolkit";
import type { JurisdictionKey } from "@/lib/jurisdictions";
import { saveNotice } from "@/app/dashboard/toolkit/actions";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "date" | "number";
  placeholder?: string;
}

export type NoticeMode =
  | { kind: "max_ground_days" } // England S8: notice = max over selected grounds
  | { kind: "scotland_residence" } // 28 if <6m, else 84; reads field "residence_months"
  | { kind: "ni_tenancy_length" } // 4/8/12 weeks; reads field "tenancy_months"
  | { kind: "fixed_days"; days: number } // Wales s.173 = 182
  | { kind: "none" };

export function NoticeBuilder({
  jurisdiction,
  noticeKind,
  title,
  templateVersion,
  templateBody,
  legislationUrl,
  prescribedForm,
  fields,
  grounds,
  noticeMode = { kind: "none" },
  dateField,
  properties,
}: {
  jurisdiction: JurisdictionKey;
  noticeKind: NoticeKind;
  title: string;
  templateVersion: string;
  templateBody: string;
  legislationUrl?: string;
  prescribedForm?: string;
  fields: Field[];
  grounds?: PossessionGround[];
  noticeMode?: NoticeMode;
  /** which placeholder receives the computed end/serve date */
  dateField?: string;
  properties: { id: string; label: string }[];
}) {
  const [values, setValues] = useState<Record<string, string>>({
    served_date: new Date().toISOString().slice(0, 10),
  });
  const [selectedGrounds, setSelectedGrounds] = useState<string[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [saved, setSaved] = useState<"idle" | "draft" | "served">("idle");

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const toggleGround = (ref: string) =>
    setSelectedGrounds((s) =>
      s.includes(ref) ? s.filter((r) => r !== ref) : [...s, ref]
    );

  const computed = useMemo(() => {
    const out: Record<string, string> = {};
    let days = 0;
    let weeks = 0;

    if (grounds && selectedGrounds.length) {
      const chosen = grounds.filter((g) => selectedGrounds.includes(g.ref));
      out.grounds = chosen
        .map((g) => `Ground ${g.ref} — ${g.label} (${g.type})`)
        .join("\n");
    }

    switch (noticeMode.kind) {
      case "max_ground_days": {
        const chosen = (grounds ?? []).filter((g) => selectedGrounds.includes(g.ref));
        days = chosen.length ? Math.max(...chosen.map((g) => g.noticeDays)) : 0;
        break;
      }
      case "scotland_residence": {
        const months = Number(values.residence_months ?? "0");
        days = months < 6 ? 28 : 84;
        break;
      }
      case "ni_tenancy_length": {
        const months = Number(values.tenancy_months ?? "0");
        weeks = months <= 12 ? 4 : months <= 120 ? 8 : 12;
        days = weeks * 7;
        break;
      }
      case "fixed_days":
        days = noticeMode.days;
        break;
    }

    if (noticeMode.kind !== "none") {
      out.notice_days = String(days);
      if (weeks) out.notice_weeks = String(weeks);
      const target = addDays(new Date(), days);
      if (dateField) out[dateField] = target;
    }
    return out;
  }, [grounds, selectedGrounds, noticeMode, values, dateField]);

  const merged = { ...values, ...computed };
  const preview = fillTemplate(templateBody, merged);

  async function handleSave(markServed: boolean) {
    await saveNotice({
      kind: noticeKind,
      jurisdiction,
      propertyId: propertyId || null,
      title,
      templateVersion,
      body: preview,
      inputs: { ...merged, grounds: selectedGrounds.join(",") },
      markServed,
    });
    setSaved(markServed ? "served" : "draft");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <LegalDisclaimer legislationUrl={legislationUrl} />
        {prescribedForm && (
          <p className="text-xs text-slate">
            Prescribed form: <span className="text-ink">{prescribedForm}</span>
          </p>
        )}

        {properties.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-sm text-ink">Property</span>
            <select
              className={inputCls}
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">— Select —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
        )}

        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1 block text-sm text-ink">{f.label}</span>
            <input
              className={inputCls}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            />
          </label>
        ))}

        {grounds && (
          <div>
            <p className="mb-2 text-sm text-ink">Grounds</p>
            <div className="space-y-1.5">
              {grounds.map((g) => (
                <label
                  key={g.ref}
                  className="flex cursor-pointer items-start gap-2 rounded-lintel border border-hairline p-2 text-sm hover:bg-ink/5"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4"
                    checked={selectedGrounds.includes(g.ref)}
                    onChange={() => toggleGround(g.ref)}
                  />
                  <span>
                    <span className="font-medium text-ink">
                      Ground {g.ref} — {g.label}
                    </span>{" "}
                    <Badge tone={g.type === "mandatory" ? "evergreen" : "default"}>
                      {g.type}
                    </Badge>
                    <span className="mt-0.5 block text-xs text-slate">{g.summary}</span>
                    {g.conditions && (
                      <span className="mt-0.5 block text-xs text-amber">{g.conditions}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold tracking-tight">Preview</h3>
              {merged.notice_days && (
                <Badge tone="amber">
                  {merged.notice_weeks
                    ? `${merged.notice_weeks} weeks' notice`
                    : `${merged.notice_days} days' notice`}
                </Badge>
              )}
            </div>
            <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lintel bg-paper p-4 text-xs leading-relaxed text-ink">
              {preview}
            </pre>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={() => handleSave(false)} variant="outline">Save draft</Button>
              <Button onClick={() => handleSave(true)}>Save & mark served</Button>
              {saved !== "idle" && (
                <Badge tone="mint">{saved === "served" ? "Saved as served" : "Draft saved"}</Badge>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
