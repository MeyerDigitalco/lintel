import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { fmtDate } from "@/lib/dates";
import { formatMoney } from "@/lib/i18n/currency";

export const dynamic = "force-dynamic";

interface JourneyEvent {
  date: string;
  label: string;
}

export default async function TenancyJourneyReport() {
  const { orgId, currency} = await requireSession();
  const gbp = (n: number, opts?: { decimals?: boolean }) => formatMoney(n, currency, opts);
  const supabase = createClient();

  const [{ data: org }, { data: tenancies }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase
      .from("tenancies")
      .select("id, start_date, rent_amount, deposit_amount, deposit_protected_at, property_id, properties(label)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
  ]);

  const ids = (tenancies ?? []).map((t) => t.id);
  const [{ data: notices }, { data: maint }, { data: rent }] = await Promise.all([
    ids.length ? supabase.from("notices").select("tenancy_id, title, served_at, created_at, status").in("tenancy_id", ids) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("maintenance_requests").select("tenancy_id, title, created_at, status").in("tenancy_id", ids) : Promise.resolve({ data: [] as any[] }),
    ids.length ? supabase.from("rent_ledger").select("tenancy_id, period, status").in("tenancy_id", ids) : Promise.resolve({ data: [] as any[] }),
  ]);

  return (
    <ReportShell title="Tenancy journey" orgName={org?.name}>
      {(tenancies ?? []).length === 0 ? (
        <p className="text-sm text-slate">No tenancies recorded.</p>
      ) : (
        (tenancies ?? []).map((t: any) => {
          const events: JourneyEvent[] = [];
          if (t.start_date) events.push({ date: t.start_date, label: `Tenancy started · ${gbp(Number(t.rent_amount ?? 0), { decimals: true })}/mo` });
          if (t.deposit_amount) events.push({ date: t.deposit_protected_at ?? t.start_date ?? "", label: `Deposit ${gbp(Number(t.deposit_amount), { decimals: true })}${t.deposit_protected_at ? ` protected ${fmtDate(t.deposit_protected_at)}` : " (protection not recorded)"}` });
          for (const n of (notices ?? []).filter((x) => x.tenancy_id === t.id))
            events.push({ date: n.served_at ?? n.created_at, label: `${n.title} (${n.status})` });
          for (const m of (maint ?? []).filter((x) => x.tenancy_id === t.id))
            events.push({ date: m.created_at, label: `Maintenance: ${m.title} (${m.status})` });
          const rentRows = (rent ?? []).filter((x) => x.tenancy_id === t.id);
          if (rentRows.length) events.push({ date: t.start_date ?? "", label: `${rentRows.length} rent periods logged (${rentRows.filter((r) => r.status === "confirmed").length} received)` });

          events.sort((a, b) => (a.date < b.date ? -1 : 1));

          return (
            <section key={t.id} className="mb-6 break-inside-avoid">
              <h2 className="font-heading text-base font-semibold">{t.properties?.label ?? "Property"}</h2>
              <ol className="mt-2 space-y-1.5 border-l border-hairline pl-4 text-sm">
                {events.map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[19px] top-1.5 h-1.5 w-1.5 rounded-full bg-evergreen" />
                    <span className="text-xs text-slate">{e.date ? fmtDate(e.date) : "-"}</span>{" "}
                    <span className="text-ink">{e.label}</span>
                  </li>
                ))}
              </ol>
            </section>
          );
        })
      )}
    </ReportShell>
  );
}
