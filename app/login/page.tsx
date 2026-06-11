import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Placeholder — Supabase auth lands in a later phase.
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20">
        <Card>
          <CardBody>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-slate">
              Supabase authentication is wired up in a later build phase.
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
