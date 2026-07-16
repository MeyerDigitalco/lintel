"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { LegalDisclaimer } from "./Disclaimer";
import { FFHH_CHECKLIST } from "@/lib/toolkit";

export function FitnessChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = Object.values(checked).filter(Boolean).length;
  const total = FFHH_CHECKLIST.length;

  return (
    <div className="max-w-2xl space-y-4">
      <LegalDisclaimer legislationUrl="https://www.legislation.gov.uk/wsi/2022/6/contents/made" />
      <Card>
        <CardBody>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold tracking-tight">
              Fitness for Human Habitation
            </h3>
            <Badge tone={done === total ? "moss" : "amber"}>
              {done}/{total} complete
            </Badge>
          </div>
          <ul className="space-y-2">
            {FFHH_CHECKLIST.map((item) => (
              <li key={item.key}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lintel border border-hairline p-3 text-sm hover:bg-ink/5">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={!!checked[item.key]}
                    onChange={(e) =>
                      setChecked((s) => ({ ...s, [item.key]: e.target.checked }))
                    }
                  />
                  <span className="text-ink">{item.label}</span>
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate">
            Required under the Renting Homes (Fitness for Human Habitation)
            (Wales) Regulations 2022. This checklist is a prompt, not a formal
            assessment.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
