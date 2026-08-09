import Link from "next/link";
import { SiteHeader } from "@/components/site/Header";
import { Panel, PanelBody } from "@/components/site/Panel";
import { AuthForm } from "@/components/auth/AuthForm";
import { TRIAL_PERIOD_DAYS } from "@/lib/stripe/config";

import type { Metadata } from "next";
export const metadata: Metadata = {
 title: "Start your free trial, Lintel",
 description: "Create your Lintel account. Every feature free until 31 August 2026, no card needed.",
};
export const dynamic = "force-dynamic";

export default function SignupPage() {
 return (
  <div className="min-h-screen bg-bone">
   <SiteHeader />
   <main className="mx-auto max-w-md px-5 py-20">
    <Panel>
     <PanelBody>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
       Start free, no card needed
      </h1>
      <p className="mt-1 mb-6 text-sm text-umber">
       Free to use until 31 August 2026, no card needed.
      </p>
      <AuthForm mode="signup" />
      <p className="mt-5 text-sm text-umber">
       Already have an account?{" "}
       <Link href="/login" className="text-char hover:underline">
        Sign in
       </Link>
      </p>
      <p className="mt-4 text-xs text-umber">
       By continuing you agree to our{" "}
       <Link href="/terms" className="text-char hover:underline">Terms of Use</Link>{" "}
       and{" "}
       <Link href="/privacy" className="text-char hover:underline">Privacy Policy</Link>.
       Lintel provides software tools, not legal, tax or financial advice.
      </p>
     </PanelBody>
    </Panel>
   </main>
  </div>
 );
}
