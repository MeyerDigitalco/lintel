import { Badge } from "@/components/app/ui";
import { humanStatus, slaState, humanAge, type RequestStatus } from "@/lib/maintenance";
import { fmtDate } from "@/lib/dates";

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "completed" || status === "closed"
      ? "mint"
      : status === "raised"
        ? "amber"
        : "default";
  return <Badge tone={tone as any}>{humanStatus(status)}</Badge>;
}

export function SlaBadge({
  dueAt,
  status,
}: {
  dueAt: string | null;
  status: string;
}) {
  const state = slaState(dueAt, status as RequestStatus);
  if (state === "done") return <Badge tone="mint">Resolved</Badge>;
  if (state === "breached") return <Badge tone="red">SLA breached</Badge>;
  if (state === "due_soon") return <Badge tone="amber">Due soon</Badge>;
  return <Badge>On track</Badge>;
}

export interface TimelineEvent {
  id: string;
  actor_role: string;
  kind: string;
  body: string | null;
  new_status: string | null;
  created_at: string;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate">No activity yet.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-hairline pl-4">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-evergreen" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink capitalize">{e.actor_role}</span>
            {e.kind === "status_change" && e.new_status && (
              <Badge>{humanStatus(e.new_status)}</Badge>
            )}
            {e.kind === "photo" && <Badge tone="mint">Photo</Badge>}
            <span className="text-xs text-slate">{fmtDate(e.created_at)}</span>
          </div>
          {e.body && <p className="mt-1 text-sm text-ink">{e.body}</p>}
        </li>
      ))}
    </ol>
  );
}

export { humanAge };
