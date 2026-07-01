import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Card, CardBody } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";
import { TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";
import { detectCountry } from "@/lib/i18n/geo";

import type { Metadata } from "next";
export const metadata: Metadata = {
 title: "Start your free trial, Lintel",
 description: "Create your Lintel account. Every feature free for 30 days, no charge until day 31.",
};
export const dynamic = "force-dynamic";

export default function SignupPage() {
 const country = detectCountry();
 return (
  <div className="min-h-screen bg-paper">
   <SiteHeader />
   <main className="mx-auto max-w-md px-5 py-20">
    <Card>
     <CardBody>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
       Start free, no card needed
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate">
       Free to use until 31 August 2026, no card needed.
      </p>
      <AuthForm mode="signup" defaultCountry={country} />
      <p className="mt-5 text-sm text-slate">
       Already have an account?{" "}
       <Link href="/login" className="text-evergreen hover:underline">
        Sign in
       </Link>
      </p>
      <p className="mt-4 text-xs text-slate">
       By continuing you agree to our{" "}
       <Link href="/terms" className="text-evergreen hover:underline">Terms of Use</Link>{" "}
       and{" "}
       <Link href="/privacy" className="text-evergreen hover:underline">Privacy Policy</Link>.
       Lintel provides software tools, not legal, tax or financial advice.
      </p>
     </CardBody>
    </Card>
   </main>
  </div>
 );
}
