import { requireWriter } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";
import { PageHeader, Badge } from "@/components/app/ui";
import { Card, CardBody } from "@/components/ui/Card";
import { VoiceConsole } from "@/components/app/assistant/VoiceConsole";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const { orgId } = await requireWriter();
  const voiceOn = await hasEntitlement(orgId, "voice");

  return (
    <div>
      <PageHeader
        title="Voice assistant"
        subtitle="Ask anything, log rent and expenses, check your portfolio, and draft messages, by voice or text."
        action={voiceOn ? <Badge tone="mint">Voice add-on on</Badge> : undefined}
      />

      {!voiceOn ? (
        <Card className="border-amber/40">
          <CardBody>
            <h2 className="font-heading text-base font-semibold tracking-tight">
              Voice assistant add-on required
            </h2>
            <p className="mt-1 text-sm text-slate">
              Enable the Voice assistant (£2/mo) to log income and expenses, query
              your rent roll, arrears and certificate expiries, and draft tenant
              messages, always with a confirm step, never autonomous.
            </p>
          </CardBody>
        </Card>
      ) : (
        <>
          <VoiceConsole />
          <p className="mt-6 text-xs text-slate">
            Scoped by design: the assistant never moves money, sends messages or
            serves notices on its own. Every save needs your confirmation and is
            recorded in your audit log.
          </p>
        </>
      )}
    </div>
  );
}
