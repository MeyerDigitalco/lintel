import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/site/Footer";

export const metadata = {
  title: "Privacy Policy — Lintel",
  description: "How Lintel collects, uses and protects your information.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "27 June 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-sm text-slate hover:text-ink">← Home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate">Last updated: {UPDATED}</p>

        <div className="prose-lintel mt-8 space-y-6 text-sm leading-6 text-ink [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-slate [&_li]:text-slate [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p>This Privacy Policy explains how Lintel (&quot;Lintel&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses, shares and protects personal information when you use our website at lintelsquared.com, our web dashboard and our mobile apps (together, the &quot;Service&quot;). We act as a data controller for your account information and as a data processor for the property and tenant information you enter.</p>

          <h2>Information we collect</h2>
          <ul>
            <li><strong>Account details</strong> — your name, email, password (hashed), organisation name and role.</li>
            <li><strong>Information you enter</strong> — properties, tenancies, tenant and contractor contact details, rent, transactions, compliance items and notes.</li>
            <li><strong>Documents and images</strong> — tenancy agreements, receipts, certificates and photos you upload, and photos of business cards or vehicles you capture.</li>
            <li><strong>Payment information</strong> — handled by our payment processor (Stripe). We never see or store full card numbers.</li>
            <li><strong>Usage and device data</strong> — log data, approximate location for address search, and push-notification tokens if you enable notifications.</li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>To provide and operate the Service and your account.</li>
            <li>To process documents you upload (e.g. reading a tenancy agreement or receipt) using AI, to save you time.</li>
            <li>To send service messages, reminders and notifications you have enabled.</li>
            <li>To take payment for paid plans and add-ons.</li>
            <li>To secure the Service, prevent abuse and meet legal obligations.</li>
          </ul>

          <h2>Legal bases</h2>
          <p>Where the UK/EU GDPR or South Africa&apos;s POPIA applies, we rely on: performance of our contract with you; your consent (e.g. for notifications); our legitimate interests in operating and securing the Service; and compliance with legal obligations.</p>

          <h2>AI processing</h2>
          <p>When you upload a document or photo for automatic reading, its contents are sent to our AI provider (Anthropic) solely to extract the requested details and return them to you. This content is not used to train AI models.</p>

          <h2>Sub-processors</h2>
          <p>We use trusted providers to run the Service, including: Supabase (database, file storage and authentication), Vercel (hosting), Stripe (payments), Anthropic (AI document reading), Google (address search and maps imagery) and Expo (push notifications). Each processes data only as needed to provide their service.</p>

          <h2>Sharing</h2>
          <p>We do not sell your personal information. Information is shared only: with the sub-processors above; when you choose to share it (for example, a tenant or contractor link you create exposes only the single tenancy or job you select); or where required by law.</p>

          <h2>Storage, security and retention</h2>
          <p>Data is encrypted in transit (HTTPS/TLS) and stored in access-controlled, encrypted infrastructure with row-level isolation per organisation. We keep your information for as long as your account is active and as needed to comply with legal and tax obligations, after which it is deleted.</p>

          <h2>Your rights</h2>
          <p>Subject to applicable law, you may access, correct, export or delete your information. You can delete your account and its data at any time from Settings. To exercise other rights, contact us at the address below. You may also complain to your data-protection regulator (e.g. the UK ICO or the South African Information Regulator).</p>

          <h2>International transfers</h2>
          <p>Your information may be processed in countries other than your own. Where it is, we rely on appropriate safeguards such as standard contractual clauses.</p>

          <h2>Cookies</h2>
          <p>We use only essential cookies needed to keep you signed in and remember preferences such as language. We do not use advertising cookies.</p>

          <h2>Children</h2>
          <p>The Service is for business use by adults and is not directed at children under 18.</p>

          <h2>Changes</h2>
          <p>We may update this policy from time to time. Material changes will be notified in-app or by email, and the &quot;last updated&quot; date above will change.</p>

          <h2>Contact</h2>
          <p>Questions or requests: <a className="text-evergreen hover:underline" href="mailto:support@lintelsquared.com">support@lintelsquared.com</a>.</p>

          <p className="text-xs text-slate">This policy is a starting template and should be reviewed by a qualified lawyer for your jurisdiction and business structure before launch.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
