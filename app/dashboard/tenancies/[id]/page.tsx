import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWriter } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageThread } from "@/components/portal/MessageThread";
import { TenantLink } from "./TenantLink";
import { ReadinessScore } from "@/components/app/ReadinessScore";
import { tenancyReadiness } from "@/lib/court-readiness-server";
import { inviteTenant, shareDocument, sendLandlordMessage, generatePortalLink } from "./actions";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

const inputCls =
  "h-10 w-full rounded-lintel border border-hairline bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-evergreen/30";

export default async function TenancyManage({ params }: { params: { id: string } }) {
  const { orgId } = await requireWriter();
  const supabase = createClient();

  const { data: tenancy } = await supabase
    .from("tenancies")
    .select("id, property_id, rent_amount, portal_token, properties(label)")
    .eq("org_id", orgId)
    .eq("id", params.id)
    .maybeSingle();
  if (!tenancy) notFound();

  const portalOn = await hasEntitlement(orgId, "tenant_portal");
  const propertyLabel = (tenancy as any).properties?.label ?? "Tenancy";
  const readiness = await tenancyReadiness(orgId, params.id);

  const [{ data: members }, { data: docs }, { data: messages }] = await Promise.all([
    supabase.from("tenancy_members").select("user_id, role").eq("tenancy_id", params.id),
    supabase.from("shared_documents").select("id, label, kind, created_at").eq("tenancy_id", params.id).order("created_at", { ascending: false }),
    supabase.from("messages").select("id, sender_role, body, created_at").eq("tenancy_id", params.id).order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <Link href="/dashboard/rent" className="text-sm text-slate hover:text-ink">← Rent ledger</Link>
      <div className="mt-3">
        <PageHeader
          title={`Manage tenancy, ${propertyLabel}`}
          subtitle="Court-readiness, tenant access, documents and messages."
          action={portalOn ? <Badge tone="moss">Tenant portal on</Badge> : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {readiness && (
          <div className="lg:col-span-2">
            <ReadinessScore result={readiness} />
          </div>
        )}

        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Tenant link (no login)</h2>
            <p className="mt-1 text-sm text-slate">Share a private, read-only link so your tenant can see rent and documents without an account.</p>
            {(tenancy as any).portal_token ? (
              <TenantLink url={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/t/${(tenancy as any).portal_token}`} tenancyId={params.id} />
            ) : (
              <form action={generatePortalLink} className="mt-3">
                <input type="hidden" name="tenancy_id" value={params.id} />
                <Button size="sm" type="submit">Create tenant link</Button>
              </form>
            )}
          </CardBody>
        </Card>

        {!portalOn && (
          <Card className="lg:col-span-2 border-amber/40">
            <CardBody>
              <h2 className="font-heading text-base font-semibold tracking-tight">Tenant portal add-on required</h2>
              <p className="mt-1 text-sm text-slate">Enable the Tenant portal (£4.99/mo) to invite tenants, share documents and message them. You can still manage rent and court-readiness here.</p>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Tenant access</h2>
            {members && members.length > 0 ? (
              <ul className="my-3 space-y-1 text-sm">
                {members.map((m) => (
                  <li key={m.user_id} className="flex justify-between rounded-lintel bg-paper px-3 py-2"><span className="text-ink">Tenant linked</span><Badge tone="moss">{m.role}</Badge></li>
                ))}
              </ul>
            ) : (<p className="my-3 text-sm text-slate">No tenant linked yet.</p>)}
            <form action={inviteTenant} className="flex gap-2">
              <input type="hidden" name="tenancy_id" value={params.id} />
              <input name="email" type="email" required placeholder="tenant@email.com" className={inputCls} disabled={!portalOn} />
              <Button size="sm" type="submit" disabled={!portalOn}>Invite</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">Shared documents</h2>
            {docs && docs.length > 0 ? (
              <ul className="my-3 space-y-1 text-sm">
                {docs.map((d) => (<li key={d.id} className="flex justify-between rounded-lintel bg-paper px-3 py-2"><span className="text-ink">{d.label}</span><span className="text-xs text-slate">{fmtDate(d.created_at)}</span></li>))}
              </ul>
            ) : (<p className="my-3 text-sm text-slate">Nothing shared yet.</p>)}
            <form action={shareDocument} className="space-y-2">
              <input type="hidden" name="tenancy_id" value={params.id} />
              <input name="label" placeholder="Document label" className={inputCls} disabled={!portalOn} />
              <select name="kind" className={inputCls} disabled={!portalOn} defaultValue="">
                <option value="">Type…</option>
                <option value="tenancy_agreement">Tenancy agreement</option>
                <option value="gas_cert">Gas certificate</option>
                <option value="epc">EPC</option>
                <option value="notice">Notice</option>
                <option value="other">Other</option>
              </select>
              <input name="file" type="file" disabled={!portalOn} className="block w-full text-sm text-slate file:mr-3 file:rounded-lintel file:border file:border-hairline file:bg-paper file:px-3 file:py-2 file:text-sm" />
              <Button size="sm" type="submit" disabled={!portalOn}>Share</Button>
            </form>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardBody>
            <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">Messages</h2>
            <MessageThread messages={messages ?? []} viewerRole="landlord" />
            <form action={sendLandlordMessage} className="mt-3 flex gap-2">
              <input type="hidden" name="tenancy_id" value={params.id} />
              <input name="body" required placeholder="Reply to your tenant…" className={inputCls} disabled={!portalOn} />
              <Button size="sm" type="submit" disabled={!portalOn}>Send</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
