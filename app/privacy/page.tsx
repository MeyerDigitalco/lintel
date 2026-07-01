import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/site/Footer";

export const metadata = {
 title: "Privacy Statement, Lintel Squared²",
 description: "How Lintel Squared² (Blake Residential Limited) collects and uses your information during the trial period.",
 alternates: { canonical: "/privacy" },
};

const UPDATED = "30 June 2026 · Trial Period Edition";

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
    <h1 className="font-heading text-3xl font-semibold tracking-tight text-ink">Privacy Statement</h1>
    <p className="mt-2 text-sm text-slate">Last updated: {UPDATED}</p>

    <div className="mt-6 rounded-lintel border border-evergreen/20 bg-evergreen/5 p-4 text-sm text-ink">
     Lintel Squared² is currently in a free trial period. This statement reflects what we collect and how we use it during
     the trial. We will update it before any payment processing begins, and will notify trial users by email of any material change.
    </div>

    <div className="mt-8 space-y-6 text-sm leading-6 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-ink [&_p]:text-slate [&_li]:text-slate [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">

     <section>
      <h2>1. Who We Are</h2>
      <div className="mt-3 overflow-hidden rounded-lintel border border-hairline">
       <table className="w-full text-sm">
        <tbody className="[&_td]:border-b [&_td]:border-hairline [&_td]:px-3 [&_td]:py-2 [&_tr:last-child_td]:border-0">
         <tr><td className="font-medium text-ink">Data controller</td><td className="text-slate">Blake Residential Limited</td></tr>
         <tr><td className="font-medium text-ink">Registered address</td><td className="text-slate">20-22 Wenlock Road, London, N1 7GU</td></tr>
         <tr><td className="font-medium text-ink">Trading as</td><td className="text-slate">Lintel Squared²</td></tr>
         <tr><td className="font-medium text-ink">ICO registration reference</td><td className="text-slate">ZC043378</td></tr>
         <tr><td className="font-medium text-ink">Website</td><td className="text-slate">lintelsquared.com / lintelsquared.co.uk</td></tr>
         <tr><td className="font-medium text-ink">Contact</td><td className="text-slate"><a className="text-evergreen hover:underline" href="mailto:privacy@lintelsquared.com">privacy@lintelsquared.com</a></td></tr>
        </tbody>
       </table>
      </div>
      <p className="mt-3">Blake Residential Limited is registered with the Information Commissioner&apos;s Office (ICO) as a data controller under reference <strong>ZC043378</strong>. We are responsible for deciding how and why your personal data is processed through the Lintel Squared² platform.</p>
     </section>

     <section>
      <h2>2. What This Statement Covers</h2>
      <p>Lintel Squared² is a property management platform for UK landlords, built around four connected views: the landlord, the accountant, the tenant, and an invited fourth party chosen by the landlord. This statement explains what personal data we collect across these views, why we collect it, and what your rights are.</p>
      <p>We are currently in a trial period. The platform does not yet process payments, and not every feature described in our marketing materials is necessarily live. We will issue an updated statement when payment processing (via Stripe) and full ICO scope are confirmed for general release.</p>
      <p><strong>Important:</strong> Lintel Squared² does not submit data to HMRC on your behalf and does not connect directly to HMRC. We organise and present your income and expense data in an MTD-ready format. Your accountant reviews this data and carries out the actual submission to HMRC through their own systems and software.</p>
     </section>

     <section>
      <h2>3. Information We Collect</h2>
      <h3>Account Information</h3>
      <ul>
       <li>Name, email address, and password (stored securely, never in plain text)</li>
       <li>Account type, landlord, accountant, tenant, or invited party</li>
       <li>Company or practice name, where applicable</li>
      </ul>
      <h3>Property Information</h3>
      <ul>
       <li>Property addresses and basic details (type, bedrooms, etc.)</li>
       <li>Rental income and expense records you choose to log</li>
       <li>Tenancy details, start dates, rent amounts, and related records</li>
      </ul>
      <h3>Documents You Choose to Store</h3>
      <p>Lintel Squared² provides a structured library for the documents landlords typically need to keep. You choose what to upload, we do not generate or verify these documents ourselves. Document types supported include:</p>
      <ul>
       <li>Compliance certificates, Gas Safety Certificate, EICR (Electrical), EPC (Energy Performance), Legionella Risk Assessment, Fire Alarm Certificate</li>
       <li>Insurance documents, Landlord Insurance, Buildings Insurance, Contents Insurance, Leasehold Flat Insurance, Legal Expenses Insurance</li>
       <li>Tenancy documents, Tenancy Agreement, Occupation Contract, How to Rent guide, Tenant Welcome Pack, Tenant Reference</li>
       <li>Deposit documents, Deposit Certificate, Deposit Protection Certificate, Deposit Prescribed Information</li>
       <li>Property and financial documents, Title Deed, Mortgage Agreement, Move-in Inventory, Move-out Inventory, Photos</li>
       <li>Financial and tax records, Invoices (MTD-tagged), records relating to a Tax Investigation, where you choose to keep these</li>
       <li>Your own compliance evidence, you may also store a copy of your own ICO registration certificate, where relevant</li>
       <li>Any other document type you choose to add</li>
      </ul>
      <p>Some of these document types, particularly Mortgage Agreement, Title Deed, and Tenant Reference, may contain sensitive financial or personal information. We apply the same security standards to all stored documents regardless of type, described in Section 9.</p>
      <h3>Compliance Checklist</h3>
      <p>Lintel Squared² includes a compliance checklist for each tenancy. This checks, mechanically, whether the document types relevant to that tenancy have been uploaded and are within date, for example, whether a current Gas Safety Certificate is on file, or whether deposit protection documents have been added.</p>
      <p>This checklist is a record-keeping tool, not a legal assessment. It tells you what is present and what is missing from your own document library. It does not assess the strength of your legal position, does not predict the outcome of any dispute, and is not a substitute for advice from a solicitor or your local Citizens Advice.</p>
      <h3>Accountant-Facing Data</h3>
      <ul>
       <li>MTD-relevant income and expense summaries, organised and structured for accountant review</li>
       <li>Status records as you and your accountant work through quarterly reporting together</li>
       <li>We do not transmit any of this data to HMRC. Your accountant submits using their own systems.</li>
      </ul>
      <h3>Tenant-Facing Data</h3>
      <ul>
       <li>Tenancy information relevant to the tenant, payment records, compliance documents they are entitled to see, and communication history</li>
      </ul>
      <h3>Technical Information</h3>
      <ul>
       <li>IP address and browser type, collected automatically for security and service functionality</li>
       <li>Basic usage data, pages visited, features used, to help us improve the platform during the trial</li>
      </ul>
     </section>

     <section>
      <h2>4. How We Use Your Information</h2>
      <ul>
       <li>To provide the core platform, storing and organising your property, tenancy, and compliance data</li>
       <li>To structure data for your accountant&apos;s review ahead of MTD submission</li>
       <li>To give your tenant visibility into the records relevant to their tenancy</li>
       <li>To help you keep tenancy documents organised in one place, so that if you ever need them for a court or tribunal matter, the relevant paperwork is easy to find rather than scattered across emails and folders</li>
       <li>To improve the platform based on how it is used during the trial period</li>
       <li>To contact you about your trial, including reminders as the trial period ends and information about moving to a paid subscription</li>
       <li>To maintain the security and integrity of the platform</li>
      </ul>
      <p>We do not sell your data. We do not use your data for advertising. We do not share your data with marketing or advertising third parties under any circumstances.</p>
      <p>Lintel Squared² helps you keep documents organised. We do not provide legal advice and do not make any judgment about a tenancy or dispute.</p>
     </section>

     <section>
      <h2>5. Who Can See What</h2>
      <p>Lintel Squared² is built around the principle that each party only sees what is relevant to them:</p>
      <ul>
       <li><strong>Landlord</strong>: full visibility of their own portfolio: properties, tenants, documents, and finances</li>
       <li><strong>Accountant</strong>: MTD-relevant data organised for the landlord clients who have connected them, for review and submission via their own systems</li>
       <li><strong>Tenant</strong>: their own tenancy information and relevant compliance documents only</li>
       <li><strong>Invited party</strong>: whatever access the landlord has explicitly chosen to grant them</li>
      </ul>
      <p>No party can see another party&apos;s data beyond what is described above. A tenant cannot see another tenant&apos;s records. An accountant cannot see a landlord&apos;s full portfolio unless granted MTD-relevant access by that landlord.</p>
     </section>

     <section>
      <h2>6. Where Your Data Is Stored</h2>
      <p>Your data is stored using reputable cloud infrastructure providers. As we are in active development during the trial period, our specific sub-processors may change. We will publish a full list of sub-processors before general release and payment processing begins. Where any data is processed outside the UK, we ensure appropriate safeguards are in place in line with UK GDPR requirements.</p>
     </section>

     <section>
      <h2>7. Data Retention</h2>
      <ul>
       <li><strong>During the trial</strong>: your data is retained for the duration of the trial period and your active use of the platform.</li>
       <li><strong>If you do not convert to a paid plan</strong>: trial data will be retained for a reasonable period after the trial ends to allow you to export or reactivate, after which it will be deleted unless we agree otherwise with you.</li>
       <li><strong>If you delete your account</strong>: your data will be deleted within 30 days of your request, save for anything we are legally required to retain.</li>
      </ul>
     </section>

     <section>
      <h2>8. Your Rights</h2>
      <p>Under UK GDPR, you have the right to:</p>
      <ul>
       <li><strong>Access</strong>: request a copy of the personal data we hold about you</li>
       <li><strong>Rectification</strong>: ask us to correct inaccurate data</li>
       <li><strong>Erasure</strong>: ask us to delete your data</li>
       <li><strong>Restriction</strong>: ask us to limit how we use your data in certain circumstances</li>
       <li><strong>Portability</strong>: request your data in a structured, commonly used format</li>
       <li><strong>Objection</strong>: object to processing based on legitimate interests</li>
      </ul>
      <p>To exercise any of these rights, contact us at <a className="text-evergreen hover:underline" href="mailto:privacy@lintelsquared.com">privacy@lintelsquared.com</a>. We will respond within one calendar month.</p>
      <p>If you are unhappy with how we have handled your data, you have the right to complain to the Information Commissioner&apos;s Office (ICO) at ico.org.uk or by calling 0303 123 1113.</p>
     </section>

     <section>
      <h2>9. Security</h2>
      <ul>
       <li>Data in transit is encrypted</li>
       <li>Passwords are stored securely and never in plain text</li>
       <li>Access to your data is restricted to what is necessary to provide the service</li>
       <li>Uploaded documents, including sensitive ones such as mortgage agreements and title deeds, are stored with the same access controls as the rest of your account and are never shared beyond the views described in Section 5</li>
       <li>We are actively building out our security and compliance practices ahead of general release</li>
      </ul>
     </section>

     <section>
      <h2>10. Children&apos;s Privacy</h2>
      <p>Lintel Squared² is not directed at individuals under 18 and we do not knowingly collect data from children.</p>
     </section>

     <section>
      <h2>11. Changes to This Statement</h2>
      <p>As Lintel Squared² moves from trial to general release, including the introduction of paid subscriptions via Stripe, this statement will be updated to reflect the full scope of our data processing. We will notify trial users by email of any material change before it takes effect.</p>
      <p>This is a trial-stage statement, written to be honest about where Lintel Squared² is today rather than describing features or processes that are not yet live. If anything here is unclear, or you would like more detail on any point, please contact us directly.</p>
     </section>

     <p className="border-t border-hairline pt-4 text-xs text-slate">Lintel Squared² · lintelsquared.com · Blake Residential Limited · ICO ZC043378 · June 2026</p>
    </div>
   </main>
   <SiteFooter />
  </div>
 );
}
