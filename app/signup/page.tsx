import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";

// Placeholder — auth + Stripe checkout wiring lands in a later phase.
export default function SignupPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20">
        <Card>
          <CardBody>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Start your {TRIAL_PERIOD_DAYS}-day free trial
            </h1>
            <p className="mt-2 text-sm text-slate">
              Account creation and Stripe checkout are wired up in a later build
              phase. This is the Phase 1 foundation.
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="outline">Back to home</Button>
            </Link>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
