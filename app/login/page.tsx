import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20">
        <Card>
          <CardBody>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Sign in
            </h1>
            <p className="mt-1 mb-6 text-sm text-slate">Welcome back to Lintel.</p>
            <AuthForm mode="signin" next={searchParams.next} />
            <p className="mt-5 text-sm text-slate">
              New here?{" "}
              <Link href="/signup" className="text-evergreen hover:underline">
                Start a free trial
              </Link>
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
