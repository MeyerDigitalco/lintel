import Link from "next/link";
import { requireTenant } from "@/lib/tenant-auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/app/ui";
import { gbp } from "@/lib/format";
import { fmtDate, daysUntil } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const { active, email } = await requireTenant();
  const supabase = createClient();

  const { data: nextRent } = await supabase
    .from("rent_ledger")
    .select("id, period, due_on, amount_due, status")
    .eq("tenancy_id", active.tenancyId)
    .neq("status", "confirmed")
    .order("due_on", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { count: docCount } = await supabase
    .from("shared_documents")
    .select("id", { count: "exact", head: true })
    .eq("tenancy_id", active.tenancyId);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate">Signed in as {email}</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {active.propertyLabel}
        </h1>
      </div>

      <Card>
        <CardBody>
          <p className="text-xs uppercase tracking-wide text-slate">Next rent</p>
          {nextRent ? (
            <>
              <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                {gbp(Number(nextRent.amount_due), { decimals: true })}
              </p>
              <p className="mt-1 text-sm text-slate">
                Due {fmtDate(nextRent.due_on)}
                {(daysUntil(nextRent.due_on) ?? 0) < 0 && (
                  <Badge tone="red"> Overdue</Badge>
                )}
              </p>
              <Link
                href="/portal/rent"
                className="mt-3 inline-block text-sm text-evergreen hover:underline"
              >
                View rent & mark as paid →
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate">Nothing outstanding.</p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/documents">
          <Card className="h-full">
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-slate">Documents</p>
              <p className="mt-1 font-heading text-xl font-semibold">{docCount ?? 0}</p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/portal/messages">
          <Card className="h-full">
            <CardBody>
              <p className="text-xs uppercase tracking-wide text-slate">Messages</p>
              <p className="mt-1 text-sm text-evergreen">Open thread →</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
