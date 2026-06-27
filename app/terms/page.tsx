import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/site/Footer";

export const metadata = {
  title: "Terms of Use — Lintel",
  description: "The terms governing your use of Lintel.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "27 June 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-sm text-slate hover:text-ink">← Home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate">Last updated: {UPDATED}</p>

        <div className="mt-8 space-y-6 text-sm leading-6 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_p]:text-slate [&_li]:text-slate [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          <p>These Terms of Use (&quot;Terms&quot;) govern your access to and use of Lintel (the &quot;Service&quot;). By creating an account or using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>

          <h2>The Service</h2>
          <p>Lintel is software that helps landlords manage properties, tenancies, rent, compliance, documents and records, with region-specific guidance. It is a tool only and does not provide legal, tax, financial or other professional advice.</p>

          <h2>Eligibility and accounts</h2>
          <p>You must be at least 18 and able to form a binding contract. You are responsible for your account credentials and for all activity under your account. Keep your password secure and notify us of any unauthorised use.</p>

          <h2>Plans, trial and billing</h2>
          <ul>
            <li>Paid plans and add-ons are billed through our payment processor, Stripe.</li>
            <li>Any free trial converts to a paid plan unless cancelled before it ends.</li>
            <li>Fees are charged in advance and are non-refundable except where required by law.</li>
            <li>You can cancel at any time; cancellation takes effect at the end of the current billing period.</li>
          </ul>

          <h2>Your content and responsibilities</h2>
          <p>You retain ownership of the information you enter (&quot;Your Content&quot;). You grant us a licence to host and process it to provide the Service. You are responsible for the accuracy and lawfulness of Your Content, including that you have a lawful basis to store tenant and contractor personal data, and for meeting your own legal, tax and regulatory obligations as a landlord.</p>

          <h2>Tenant and contractor access</h2>
          <p>When you generate a tenant or contractor link, you are responsible for sharing it appropriately. Each link grants access only to the specific tenancy or job you select, and you can revoke it at any time.</p>

          <h2>AI features</h2>
          <p>Some features use AI to read documents, suggest details or answer questions. AI output may be incomplete or inaccurate and is provided on a best-effort basis. Always review AI-generated content before relying on it.</p>

          <h2>No professional advice</h2>
          <p>Guidance, calculators, templates, court-readiness scores and tax framing are for general information only and are not legal, tax or financial advice. Always verify with a qualified professional. No tax-authority filing is offered unless and until the relevant recognition is obtained.</p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Do not use the Service unlawfully, or to store or transmit unlawful content.</li>
            <li>Do not attempt to breach security, reverse engineer, or disrupt the Service.</li>
            <li>Do not use the Service to infringe others&apos; rights.</li>
          </ul>

          <h2>Intellectual property</h2>
          <p>The Service, including its software, design and content (excluding Your Content), is owned by Lintel and protected by law. We grant you a limited, non-exclusive, non-transferable licence to use it per these Terms.</p>

          <h2>Availability and changes</h2>
          <p>We aim for high availability but do not guarantee the Service will be uninterrupted or error-free. We may update, suspend or discontinue features, and may change these Terms; continued use after changes means you accept them.</p>

          <h2>Limitation of liability</h2>
          <p>To the maximum extent permitted by law, Lintel is not liable for indirect, incidental or consequential losses, or for lost profits, data or goodwill. Our total liability for any claim is limited to the amount you paid us for the Service in the 12 months before the claim.</p>

          <h2>Indemnity</h2>
          <p>You agree to indemnify Lintel against claims arising from Your Content or your breach of these Terms or applicable law.</p>

          <h2>Termination</h2>
          <p>You may stop using the Service and delete your account at any time. We may suspend or terminate access for breach of these Terms. On termination, your right to use the Service ends; you may export your data beforehand.</p>

          <h2>Governing law</h2>
          <p>These Terms are governed by the laws of the jurisdiction in which Lintel is established, without regard to conflict-of-laws rules. The competent courts of that jurisdiction have exclusive jurisdiction.</p>

          <h2>Contact</h2>
          <p>Questions: <a className="text-evergreen hover:underline" href="mailto:support@lintelsquared.com">support@lintelsquared.com</a>.</p>

          <p className="text-xs text-slate">These Terms are a starting template and should be reviewed by a qualified lawyer for your jurisdiction and business structure before launch.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
