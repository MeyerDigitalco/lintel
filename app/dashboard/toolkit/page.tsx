import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { markNoticeServed } from "./actions";
import { resolveJurisdiction } from "@/lib/jurisdictions";
import { toolsForJurisdiction } from "@/lib/toolkit";
import { fmtDate } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ToolkitPage() {
  const { orgId, region } = await requireSession();
  const supabase = createClient();

  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, kind, status, served_at, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  const rules = resolveJurisdiction(region);
  const tools = toolsForJurisdiction(region);

  return (
    <div>
      <PageHeader
        title="Tenancy toolkit"
        subtitle="Jurisdiction-correct notices and agreements. Template-assisted — not legal advice."
        action={<Badge tone="mint">{rules.name}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.key} href={`/dashboard/toolkit/${t.slug}`}>
            <Card className="h-full transition-colors hover:border-evergreen/40">
              <CardBody>
                <h3 className="font-heading text-sm font-semibold tracking-tight">{t.title}</h3>
                <p className="mt-1 text-xs text-slate">{t.blurb}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-heading text-base font-semibold tracking-tight">Saved documents</h2>
        {!notices || notices.length === 0 ? (
          <EmptyState
            title="No documents yet"
            body="Generated notices and agreements are tracked here, with served dates for your records."
          />
        ) : (
          <Card>
            <CardBody className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {notices.map((n) => (
                    <tr key={n.id} className="border-b border-hairline last:border-0">
                      <td className="px-4 py-3 text-ink">{n.title}</td>
                      <td className="px-4 py-3">
                        {n.status === "served" ? (
                          <Badge tone="evergreen">Served {fmtDate(n.served_at)}</Badge>
                        ) : (
                          <Badge tone="amber">Draft</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {n.status !== "served" && (
                          <form action={markNoticeServed}>
                            <input type="hidden" name="id" value={n.id} />
                            <button type="submit" className="text-sm text-evergreen hover:underline">
                              Mark served
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
