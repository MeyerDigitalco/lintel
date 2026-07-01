import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportShell } from "@/components/app/ReportShell";
import { humanStatus } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

function ts(d: string) {
  const date = new Date(d);
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

export default async function FaultTranscriptReport() {
  const { orgId } = await requireSession();
  const supabase = createClient();

  const [{ data: org }, { data: requests }] = await Promise.all([
    supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
    supabase
      .from("maintenance_requests")
      .select("id, title, category, is_hazard, priority, status, created_at, sla_due_at, properties(label)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
  ]);

  const ids = (requests ?? []).map((r) => r.id);
  const { data: events } = ids.length
    ? await supabase
        .from("maintenance_events")
        .select("request_id, actor_role, kind, body, new_status, created_at")
        .in("request_id", ids)
        .order("created_at", { ascending: true })
    : { data: [] as any[] };

  const byReq = new Map<string, any[]>();
  for (const e of events ?? []) {
    const arr = byReq.get(e.request_id) ?? [];
    arr.push(e);
    byReq.set(e.request_id, arr);
  }

  return (
    <ReportShell title="Fault transcript" subtitle="Court-ready chronology" orgName={org?.name}>
      {(requests ?? []).length === 0 ? (
        <p className="text-sm text-slate">No maintenance faults recorded.</p>
      ) : (
        (requests ?? []).map((r: any) => {
          const evs = byReq.get(r.id) ?? [];
          return (
            <section key={r.id} className="mb-8 break-inside-avoid">
              <h2 className="font-heading text-base font-semibold">
                {r.title}
                {r.is_hazard && <span className="ml-2 text-xs text-red">hazard</span>}
              </h2>
              <p className="mb-3 text-xs text-slate">
                {r.properties?.label ?? "-"} · {r.category ?? "general"} · {r.priority} ·
                reported {ts(r.created_at)} · status {humanStatus(r.status)}
              </p>
              <ol className="space-y-2 border-l border-hairline pl-4 text-sm">
                {evs.length === 0 ? (
                  <li className="text-slate">No timeline entries.</li>
                ) : (
                  evs.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[19px] top-1.5 h-1.5 w-1.5 rounded-full bg-evergreen" />
                      <span className="text-xs text-slate">{ts(e.created_at)}</span>{" "}
                      <span className="font-medium capitalize text-ink">{e.actor_role}</span>
                      {e.new_status && <span className="text-slate"> · {humanStatus(e.new_status)}</span>}
                      {e.body && <div className="text-ink">{e.body}</div>}
                    </li>
                  ))
                )}
              </ol>
            </section>
          );
        })
      )}
    </ReportShell>
  );
}
