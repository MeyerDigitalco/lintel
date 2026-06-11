import { cn } from "@/lib/cn";
import { fmtDate } from "@/lib/dates";

export interface ThreadMessage {
  id: string;
  sender_role: string;
  body: string;
  created_at: string;
}

/**
 * Shared message thread. `viewerRole` decides which side messages sit on.
 */
export function MessageThread({
  messages,
  viewerRole,
}: {
  messages: ThreadMessage[];
  viewerRole: "tenant" | "landlord";
}) {
  if (messages.length === 0) {
    return (
      <p className="rounded-lintel border border-dashed border-hairline p-6 text-center text-sm text-slate">
        No messages yet. Start the conversation below.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {messages.map((m) => {
        const mine = m.sender_role === viewerRole;
        return (
          <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-lintel px-3 py-2 text-sm",
                mine ? "bg-evergreen text-paper" : "border border-hairline bg-surface text-ink"
              )}
            >
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={cn("mt-1 text-[10px]", mine ? "text-paper/70" : "text-slate")}>
                {m.sender_role} · {fmtDate(m.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
