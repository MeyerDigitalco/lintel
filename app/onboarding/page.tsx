import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20">
        <Card>
          <CardBody>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Welcome to Lintel
            </h1>
            <p className="mt-2 text-sm text-slate">
              Your account is being set up. If you signed up as a landlord, head
              to your dashboard. If your landlord invited you, use the portal.
            </p>
            <div className="mt-6 flex gap-2">
              <Link href="/dashboard">
                <Button>Go to dashboard</Button>
              </Link>
              <Link href="/portal">
                <Button variant="outline">Tenant portal</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
