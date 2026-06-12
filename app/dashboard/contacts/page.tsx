import Link from "next/link";
import { requireWriter } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Badge, EmptyState } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { AddContactForm } from "@/components/app/AddContactForm";
import { archiveContact } from "./actions";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "All" },
  { key: "contractor", label: "Contractors" },
  { key: "supplier", label: "Suppliers" },
  { key: "agent", label: "Agents" },
  { key: "tenant", label: "Tenants" },
  { key: "other", label: "Other" },
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { kind?: string };
}) {
  const { orgId } = await requireWriter();
  const supabase = createClient();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, kind, name, company, email, phone")
    .eq("org_id", orgId)
    .eq("archived", false)
    .order("name", { ascending: true });

  const kind = searchParams.kind ?? "all";
  const filtered = (contacts ?? []).filter((c) => kind === "all" || c.kind === kind);

  return (
    <div>
      <PageHeader title="Contacts" subtitle="Contractors, suppliers, agents and other partners in one place." />
      <AddContactForm />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/contacts?kind=${t.key}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              kind === t.key ? "border-evergreen bg-evergreen/8 text-evergreen" : "border-hairline text-slate hover:text-ink"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No contacts" body="Add your contractors, suppliers and agents to keep everyone in one place." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    {c.company && <p className="text-xs text-slate">{c.company}</p>}
                  </div>
                  <Badge>{c.kind}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {c.email && <p className="text-slate">{c.email}</p>}
                  {c.phone && <p className="text-slate">{c.phone}</p>}
                </div>
                <form action={archiveContact} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs text-slate hover:text-red">Archive</button>
                </form>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
