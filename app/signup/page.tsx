import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";
import { TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";

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
            <p className="mt-1 mb-6 text-sm text-slate">
              No charge until day {TRIAL_PERIOD_DAYS + 1}. Cancel anytime.
            </p>
            <AuthForm mode="signup" />
            <p className="mt-5 text-sm text-slate">
              Already have an account?{" "}
              <Link href="/login" className="text-evergreen hover:underline">
                Sign in
              </Link>
            </p>
            <p className="mt-4 text-xs text-slate">
              By continuing you agree to our terms. Lintel provides software
              tools, not legal, tax or financial advice.
            </p>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
