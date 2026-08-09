import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { isLintelAdmin } from "@/lib/admin";
import { createServiceClient } from "@/lib/supabase/server";
import { PageHeader, Stat, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { setLeadStatus } from "./actions";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  properties: string | null;
  note: string | null;
  source: string | null;
  status: string;
  contacted_at: string | null;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function StatusButton({ id, to, label }: { id: string; to: string; label: string }) {
  return (
    <form action={setLeadStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={to} />
      <button type="submit" className="text-xs font-medium text-evergreen hover:underline">
        {label}
      </button>
    </form>
  );
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: { source?: string; status?: string };
}) {
  const { email } = await requireSession();
  // Business-wide sales data: owner only. Everyone else goes to the dashboard.
  if (!isLintelAdmin(email)) redirect("/dashboard");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("leads")
    .select("id, created_at, name, email, phone, country, properties, note, source, status, contacted_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const all = (data ?? []) as Lead[];
  const sourceFilter = searchParams?.source ?? "all";
  const statusFilter = searchParams?.status ?? "open";

  const rows = all.filter((l) => {
    const okSource = sourceFilter === "all" || (l.source ?? "home") === sourceFilter;
    const okStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "open"
        ? l.status !== "closed"
        : l.status === statusFilter;
    return okSource && okStatus;
  });

  const newCount = all.filter((l) => l.status === "new").length;
  const accountantCount = all.filter((l) => l.source === "accountant").length;

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-evergreen text-paper" : "bg-ink/5 text-slate hover:bg-ink/10"}`;
  const link = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ source: sourceFilter, status: statusFilter, ...patch });
    return `/dashboard/leads?${p.toString()}`;
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Callback requests from the website. Visible to you only." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="New, awaiting contact" value={String(newCount)} tone={newCount > 0 ? "amber" : "evergreen"} />
        <Stat label="Total enquiries" value={String(all.length)} />
        <Stat label="Accountant enquiries" value={String(accountantCount)} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-slate">Source</span>
        <a href={link({ source: "all" })} className={chip(sourceFilter === "all")}>All</a>
        <a href={link({ source: "home" })} className={chip(sourceFilter === "home")}>Landlord</a>
        <a href={link({ source: "accountant" })} className={chip(sourceFilter === "accountant")}>Accountant</a>
        <span className="ml-4 text-xs uppercase tracking-wide text-slate">Status</span>
        <a href={link({ status: "open" })} className={chip(statusFilter === "open")}>Open</a>
        <a href={link({ status: "new" })} className={chip(statusFilter === "new")}>New</a>
        <a href={link({ status: "contacted" })} className={chip(statusFilter === "contacted")}>Contacted</a>
        <a href={link({ status: "closed" })} className={chip(statusFilter === "closed")}>Closed</a>
        <a href={link({ status: "all" })} className={chip(statusFilter === "all")}>All</a>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No leads here" body="Callback requests from the website will appear here as they come in." />
      ) : (
        <div className="grid gap-3">
          {rows.map((l) => (
            <Card key={l.id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-base font-semibold tracking-tight text-ink">{l.name}</span>
                      {l.status === "new" && <Badge tone="amber">New</Badge>}
                      {l.status === "contacted" && <Badge tone="moss">Contacted</Badge>}
                      {l.status === "closed" && <Badge>Closed</Badge>}
                      {l.source === "accountant" && <Badge tone="evergreen">Accountant</Badge>}
                    </div>
                    <div className="mt-1 text-sm text-slate">
                      <a href={`mailto:${l.email}`} className="text-evergreen hover:underline">{l.email}</a>
                      {" · "}
                      <a href={`tel:${l.phone}`} className="text-evergreen hover:underline">{l.phone}</a>
                    </div>
                    <div className="mt-1 text-xs text-slate">
                      {[l.country, l.properties && `${l.properties} ${l.source === "accountant" ? "clients" : "properties"}`, `enquired ${fmtDate(l.created_at)}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                    {l.note && <p className="mt-2 max-w-prose text-sm text-ink">{l.note}</p>}
                  </div>
                  <div className="flex shrink-0 gap-3">
                    {l.status === "new" && <StatusButton id={l.id} to="contacted" label="Mark contacted" />}
                    {l.status === "contacted" && (
                      <>
                        <StatusButton id={l.id} to="closed" label="Close" />
                        <StatusButton id={l.id} to="new" label="Reopen" />
                      </>
                    )}
                    {l.status === "closed" && <StatusButton id={l.id} to="contacted" label="Reopen" />}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
