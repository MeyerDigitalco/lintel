# Lintel

Modular, MTD-first property-management platform for UK landlords. Landlords pick
their **nation** per property, which loads the correct tenancy + compliance
ruleset, then start on a cheap core (digital tax record-keeping for Making Tax
Digital) and switch on paid add-ons only if they want them.

> **Positioning:** calm, precise, British, grown-up fintech. Trust and clarity
> over "autonomous AI". Honest, modular, low-cost, jurisdiction-correct.

## Status — Phases 1–5 complete

**Phase 1 — Foundation:** Next.js (App Router) + TypeScript + Tailwind design
system; jurisdiction rules engine (England/Wales/Scotland/NI); Supabase with RLS
on every table; Stripe pricing/entitlements + webhook (30-day trial); SendGrid +
Vercel Cron; MTD abstraction (no "file to HMRC" until recognised); landing page +
public calculator suite.

**Phase 2 — Core MTD app:** Supabase auth + onboarding trigger; protected
dashboard; properties/units/registrations (jurisdiction-tagged); SA105 income &
expense ledger with Tesseract receipt OCR; log-only rent ledger; jurisdiction-
aware compliance vault; Tax & MTD readiness with CSV export + printable tax pack.

**Phase 3 — Jurisdiction toolkits:** versioned, legislation-linked template
library (`/lib/toolkit`) with possession grounds (England Section 8, Scotland's
18 Notice to Leave grounds) and notice-period calculators (Scotland 28/84 days,
NI 4/8/12 weeks); notices store with draft/served tracking; jurisdiction-aware
toolkit hub; interactive builders — England Section 8 (Form 3A) / Section 13 /
pet request; Wales written statement (14-day) / s.173 / fitness checklist;
Scotland Notice to Leave / PRT agreement; NI Notice to Quit. Every generator
carries a "not legal advice" disclaimer and links the legislation.

**Phase 4 — Tenant portal (add-on):** mobile-first `/portal` for the `tenant`
role with strict RLS; rent history with mark-as-paid (log only); landlord-shared
documents with signed-URL downloads; two-way audit-logged messaging; email
notification prefs. Landlord side manages tenancies at
`/dashboard/tenancies/[id]` (invite, share, reply).

**Phase 5 — Maintenance portal (add-on):** tenant raises issues with photos and
a hazard flag; landlord triages, assigns and tracks SLAs; contractors work via a
tokenised link with **no account** (`/maintenance/[token]`, service-role
validated). Status timeline, hazard-response timers (Awaab's-Law-style, tightest
in England), and completion costs auto-posted to the expense ledger
(repairs & maintenance). Added via migration `0006`.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend / hosting | Next.js (App Router) on Vercel |
| DB / Auth / Storage | Supabase (London/EU region, RLS on every table) |
| Email | SendGrid (transactional + scheduled reminders) |
| Billing | Stripe (Billing + Customer Portal) |
| Jobs / cron | Vercel Cron |

**Not used:** bank linking / Open Banking, payment processing, PayFast. Rent is
logged only.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Stripe / SendGrid keys
npm run dev
```

Apply the SQL migrations in `supabase/migrations/` (0001–0006), in order, via the
Supabase SQL editor or CLI. They create the schema, RLS, auth bootstrap trigger,
storage buckets (`receipts`, `tenancy-docs`, `maintenance`) and the notices/messages tables.

## Project layout

```
app/                       # routes: marketing, calculators, dashboard, portal, api
  dashboard/               # landlord app (properties, ledger, rent, compliance, toolkit, tax)
  portal/                  # mobile-first tenant portal
  api/                     # ocr, export/csv, stripe webhook, cron
components/                # ui primitives, site chrome, app, portal, toolkit
lib/
  calculators/             # tax/finance maths (2025/26 rates)
  jurisdictions/           # per-nation rules engine
  toolkit/                 # notices/grounds/templates + notice-period calculators
  mtd/                     # MTD abstraction (local now, HMRC API later)
  stripe/ supabase/ email/ # integrations
  auth.ts tenant-auth.ts   # landlord & tenant session resolvers
supabase/migrations/       # 0001–0006 SQL (schema, RLS, auth, storage, notices, portal, maintenance)
```

## Disclaimers

Lintel provides software tools, **not** legal, tax or financial advice. Tax rates
and statutory notice periods are indicative and must be verified each Budget /
against the current prescribed forms. No HMRC filing feature is exposed until
HMRC recognition is granted.

## Roadmap

1. ✅ Foundation
2. ✅ Core MTD
3. ✅ Jurisdiction toolkits
4. ✅ Tenant portal
5. ✅ Maintenance portal
6. Voice AI add-on
7. HMRC MTD ITSA API integration → recognition
