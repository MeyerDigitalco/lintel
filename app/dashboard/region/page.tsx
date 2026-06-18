import { requireSession } from "@/lib/auth";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { resolveRegion } from "@/lib/i18n/rulesets";
import { CURRENCIES } from "@/lib/i18n/currency";

export const dynamic = "force-dynamic";

export default async function RegionRulesPage() {
  const { country, region, currency, regionCode } = await requireSession();
  const r = resolveRegion(country, region, regionCode);
  const cur = CURRENCIES[currency];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Region rules"
        subtitle={`${r.subregionName ? `${r.subregionName}, ` : ""}${r.countryName} — how Lintel tailors your account.`}
        action={<Badge tone="mint">{cur?.symbol} {currency}</Badge>}
      />

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Legal framework</h2>
          <p className="mt-1 text-sm text-slate">{r.governingLaw}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{r.tenancyTerm}</Badge>
            <Badge>{r.depositTerm}</Badge>
            <Badge tone="mint">{r.taxLabel}</Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">{r.tenancyTerm[0].toUpperCase() + r.tenancyTerm.slice(1)} types</h2>
          <ul className="mt-3 space-y-3">
            {r.tenancyTypes.map((t) => (
              <li key={t.label}>
                <p className="text-sm font-medium text-ink">{t.label}</p>
                <p className="text-xs text-slate">{t.description}</p>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Compliance</h2>
          <ul className="mt-3 space-y-3">
            {r.compliance.map((c) => (
              <li key={c.label}>
                <p className="text-sm font-medium text-ink">{c.label}</p>
                <p className="text-xs text-slate">{c.note}</p>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">{r.depositTerm[0].toUpperCase() + r.depositTerm.slice(1)}</h2>
            <p className="mt-2 text-sm text-ink">{r.deposit.cap}</p>
            <p className="mt-1 text-xs text-slate">{r.deposit.protection}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Start-of-tenancy checklist</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-ink">
              {r.checklist.map((c) => (
                <li key={c} className="flex items-center gap-2"><span className="text-evergreen">✓</span> {c}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h2 className="font-heading text-base font-semibold tracking-tight">Good to know</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate">
            {r.notes.map((n, i) => (<li key={i}>{n}</li>))}
          </ul>
          <p className="mt-4 text-xs text-slate">Guidance only — Lintel provides software, not legal or tax advice.</p>
        </CardBody>
      </Card>
    </div>
  );
}
