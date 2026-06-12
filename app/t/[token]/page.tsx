import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { Button } from "@/components/ui/Button";
import { humanStatus } from "@/lib/maintenance";
import { gbp } from "@/lib/format";
import { fmtDate, daysUntil } from "@/lib/dates";
import { raiseFaultByToken } from "./actions";
import { tenancyReadiness } from "@/lib/court-readiness-server";

export const dynamic = "force-dynamic";

const inputCls =
  "h-11 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export default async function TokenTenantPage({ params }: { params: { token: string } }) {
  const service = createServiceClient();

  const { data: tenancy } = await service
    .from("tenancies")
    .select("id, org_id, rent_amount, properties(label, city, postcode)")
    .eq("portal_token", params.token)
    .maybeSingle();
  if (!tenancy) notFound();

  const prop = (tenancy as any).properties;

  const [{ data: rent }, { data: docs }, { data: faults }] = await Promise.all([
    service.from("rent_ledger").select("period, due_on, amount_due, status").eq("tenancy_id", tenancy.id).order("due_on", { ascending: false }),
    service.from("shared_documents").select("id, label, kind, storage_path, created_at").eq("tenancy_id", tenancy.id).order("created_at", { ascending: false }),
    service.from("maintenance_requests").select("id, title, status, created_at, is_hazard").eq("tenancy_id", tenancy.id).order("created_at", { ascending: false }),
  ]);

  const docsWithUrls = await Promise.all(
    (docs ?? []).map(async (d) => {
      const { data } = await service.storage.from("tenancy-docs").createSignedUrl(d.storage_path, 600);
      return { ...d, url: data?.signedUrl ?? null };
    })
  );

  const activeFaults = (faults ?? []).filter((f) => f.status !== "completed" && f.status !== "closed");

  const { data: org } = await service.from("orgs").select("region").eq("id", (tenancy as any).org_id).maybeSingle();
  const region = ((org as any)?.region as string) ?? "england";
  const readiness = await tenancyReadiness((tenancy as any).org_id, tenancy.id, service);
  const tenantChecks = (readiness?.checks ?? []).filter((c) => c.key !== "registration");

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header
        className="px-5 py-10 text-paper"
        style={{
          backgroundImage: `linear-gradient(rgba(14,20,31,0.68), rgba(14,20,31,0.88)), url(/regions/${region}.jpg), url(/regions/${region}.svg)`,
          backgroundSize: "cover, cover, cover",
          backgroundPosition: "center, center, center",
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        }}
      >
        <div className="mx-auto max-w-md">
          <p className="text-xs uppercase tracking-widest text-paper/70">Lintel</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">Welcome home 👋</h1>
          <p className="mt-1 text-sm text-paper/80">{[prop?.label, prop?.city, prop?.postcode].filter(Boolean).join(", ")}</p>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-6">
        {/* Active repairs banner */}
        {activeFaults.length > 0 && (
          <Card className="border-amber/40">
            <CardBody>
              <p className="text-xs font-medium uppercase tracking-wide text-amber">Active repair{activeFaults.length > 1 ? "s" : ""}</p>
              {activeFaults.slice(0, 3).map((f) => (
                <p key={f.id} className="mt-1 text-sm text-ink">
                  {f.title} <Badge tone="amber">{humanStatus(f.status)}</Badge>
                </p>
              ))}
            </CardBody>
          </Card>
        )}

        {/* Safety & compliance (tenant-friendly) */}
        {readiness && (
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold tracking-tight">Your home — safety &amp; compliance</h2>
                <Badge tone={readiness.rag === "green" ? "mint" : readiness.rag === "amber" ? "amber" : "red"}>
                  {readiness.rag === "green" ? "All in order" : "Being sorted"}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {tenantChecks.map((c) => {
                  const ok = c.status === "ok" || c.status === "na";
                  return (
                    <li key={c.key} className="flex items-center gap-2">
                      <span className={ok ? "text-evergreen" : "text-amber"}>{ok ? "✓" : "•"}</span>
                      <span className="text-ink">{c.label}</span>
                      {!ok && <span className="text-xs text-slate">— your landlord has been notified</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-slate">
                Compliance score {readiness.score}/100. This reflects safety
                certificates, your deposit protection and required documents.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Rent */}
        <Card>
          <CardBody>
            <h2 className="font-heading text-sm font-semibold tracking-tight">Rent</h2>
            <p className="mt-1 text-sm text-slate">{gbp(Number(tenancy.rent_amount ?? 0), { decimals: true })}/mo</p>
            {rent && rent.length > 0 ? (
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {rent.slice(0, 6).map((r, i) => {
                    const overdue = r.status !== "confirmed" && (daysUntil(r.due_on) ?? 0) < 0;
                    return (
                      <tr key={i} className="border-b border-hairline last:border-0">
                        <td className="py-1.5">{r.period}</td>
                        <td className="py-1.5 tabular-nums">{gbp(Number(r.amount_due), { decimals: true })}</td>
                        <td className="py-1.5 text-right">{r.status === "confirmed" ? <Badge tone="mint">Paid</Badge> : overdue ? <Badge tone="red">Overdue</Badge> : <Badge tone="amber">Due</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="mt-2 text-sm text-slate">No rent records yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Documents */}
        <Card>
          <CardBody>
            <h2 className="font-heading text-sm font-semibold tracking-tight">My documents</h2>
            {docsWithUrls.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm">
                {docsWithUrls.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lintel bg-paper px-3 py-2">
                    <span>
                      <span className="text-ink">{d.label}</span>
                      <span className="block text-xs text-slate">Added {fmtDate(d.created_at)}</span>
                    </span>
                    {d.url ? <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm text-evergreen hover:underline">View</a> : <span className="text-xs text-slate">—</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate">No documents shared yet.</p>
            )}
          </CardBody>
        </Card>

        {/* Report a fault */}
        <Card>
          <CardBody>
            <h2 className="font-heading text-sm font-semibold tracking-tight">Report a fault</h2>
            <form action={raiseFaultByToken} className="mt-3 space-y-3">
              <input type="hidden" name="token" value={params.token} />
              <input name="title" required placeholder="e.g. No hot water" className={inputCls} />
              <textarea name="description" rows={3} placeholder="Tell your landlord what's wrong" className="w-full rounded-lintel border border-hairline bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-evergreen/30" />
              <div className="grid grid-cols-2 gap-3">
                <select name="category" className={inputCls} defaultValue="other">
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="heating">Heating</option>
                  <option value="structural">Structural</option>
                  <option value="damp">Damp / mould</option>
                  <option value="appliance">Appliance</option>
                  <option value="security">Security</option>
                  <option value="other">Other</option>
                </select>
                <select name="priority" className={inputCls} defaultValue="routine">
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="is_hazard" className="h-4 w-4" />
                This is a health or safety hazard (damp, mould, no heating)
              </label>
              <Button type="submit" className="w-full">Submit fault</Button>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-slate">
          Your private tenant page from Lintel. No login needed — bookmark it. All
          repairs you report are recorded with a timestamp.
        </p>
      </main>
    </div>
  );
}
