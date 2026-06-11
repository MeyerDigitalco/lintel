# Lintel

Modular, MTD-first property-management platform for UK landlords. Landlords pick
their **nation** per property, which loads the correct tenancy + compliance
ruleset, then start on a cheap core (digital tax record-keeping for Making Tax
Digital) and switch on paid add-ons only if they want them.

> **Positioning:** calm, precise, British, grown-up fintech. Trust and clarity
> over "autonomous AI". Honest, modular, low-cost, jurisdiction-correct.

## Status — Phases 1–3 complete

**Phase 1 — Foundation**

- **Next.js (App Router) + TypeScript + Tailwind** with the Lintel design system.
- **Jurisdiction rules engine** (`/lib/jurisdictions`) for England, Wales,
  Scotland and Northern Ireland.
- **Supabase** clients + SQL migrations with RLS on every table.
- **Stripe** pricing config, entitlements model and webhook handler (30-day trial,
  add-on items).
- **SendGrid** email wrapper + a Vercel Cron compliance-sweep route.
- **MTD layer** abstraction (`/lib/mtd`) — writes HMRC-shaped summaries locally;
  no "file to HMRC" until HMRC recognition is granted.
- **Landing page** + **public calculator suite** (SDLT/LTT/LBTT, yield, income
  tax, CGT, Section 24, MTD estimator, mortgage, rent increase, deposit cap, EPC).

**Phase 2 — Core MTD app**

- **Auth & onboarding** — Supabase email/password; a signup trigger
  (`0002_auth_bootstrap.sql`) creates the org, owner membership, a 30-day trialing
  subscription and the always-on `core` entitlement. Middleware refreshes the
  session and guards `/dashboard`.
- **Dashboard** — protected app shell (sidebar, entitlement provider) with a
  portfolio overview (income, expenses, arrears, MTD band, compliance due soon).
- **Properties & units** — jurisdiction-tagged, with units, registrations
  (Rent Smart Wales / Scottish / NI) driven by the active nation's rules, and the
  jurisdiction document checklist.
- **Income & expenses** — SA105-mapped ledger, receipt upload to private storage,
  **Tesseract OCR** (`/api/ocr`) that pre-fills amount/date/vendor, mileage and
  Section 24 finance-cost handling.
- **Log-only rent ledger** — tenancies, generated rent periods, mark-received,
  automatic arrears flagging. No bank links, no payment processing.
- **Compliance vault** — jurisdiction-aware, expiry status (60/30/7) with
  statutory basis shown.
- **Tax & MTD** — readiness band, quarterly summaries, Section 24 reducer,
  accountant **CSV export** (`/api/export/csv`) and a printable tax pack.

**Phase 3 — Jurisdiction toolkits**

- **Versioned, legislation-linked template library** (`/lib/toolkit`) with
  possession grounds (England Section 8, Scotland's 18 Notice to Leave grounds)
  and notice-period calculators (Scotland 28/84 days, NI 4/8/12 weeks).
- **Notices store** (`0004_notices.sql`) with draft/served tracking and RLS.
- **Jurisdiction-aware toolkit hub** — shows tools for the nations in your
  portfolio first, plus a saved-documents / served tracker.
- **England:** Section 8 grounds builder (Form 3A, correct notice period),
  Section 13 rent increase, pet-request decision.
- **Wales:** written-statement generator (14-day deadline), s.173 notice
  (6-month period), Fitness for Human Habitation checklist.
- **Scotland:** Notice to Leave (18 grounds, residence-based period), PRT
  agreement generator.
- **Northern Ireland:** Notice to Quit period calculator (by tenancy length).
- Every generator carries a prominent "not legal advice — verify or consult a
  solicitor" disclaimer and links the underlying legislation.

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

Then apply the database schema to your Supabase project:

```bash
# via the Supabase SQL editor or CLI
supabase db push   # or paste supabase/migrations/0001_init.sql
```

## Project layout

```
app/                     # routes (landing, calculators, api webhooks/cron, auth stubs)
components/              # UI primitives, site chrome, calculators
lib/
  calculators/           # tax/finance maths (2025/26 rates)
  jurisdictions/         # per-nation rules engine
  mtd/                   # MTD abstraction (local now, HMRC API later)
  stripe/                # pricing config + client
  supabase/              # browser/server/service clients
  email/                 # SendGrid wrapper
supabase/migrations/     # SQL schema + RLS
```

## Disclaimers

Lintel provides software tools, **not** legal, tax or financial advice. Tax rates
are indicative and must be verified each Budget. No HMRC filing feature is exposed
until HMRC recognition is granted.

## Roadmap

1. ✅ Foundation (this phase)
2. Core MTD: properties/units, income/expense ledger + OCR, log-only rent ledger,
   compliance vault, MTD readiness, accountant export
3. Jurisdiction toolkits (England → Wales → Scotland → NI)
4. Tenant portal add-on
5. Maintenance portal add-on
6. Voice AI add-on
7. HMRC MTD ITSA API integration → recognition
```
