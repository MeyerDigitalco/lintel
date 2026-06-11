# Lintel

Modular, MTD-first property-management platform for UK landlords. Landlords pick
their **nation** per property, which loads the correct tenancy + compliance
ruleset, then start on a cheap core (digital tax record-keeping for Making Tax
Digital) and switch on paid add-ons only if they want them.

> **Positioning:** calm, precise, British, grown-up fintech. Trust and clarity
> over "autonomous AI". Honest, modular, low-cost, jurisdiction-correct.

## Status — Phase 1 (Foundation)

This repo currently contains the Phase 1 foundation:

- **Next.js (App Router) + TypeScript + Tailwind** with the Lintel design system.
- **Jurisdiction rules engine** (`/lib/jurisdictions`) for England, Wales,
  Scotland and Northern Ireland.
- **Supabase** clients + a full SQL migration with RLS on every table
  (`/supabase/migrations/0001_init.sql`).
- **Stripe** pricing config, entitlements model and webhook handler (30-day trial,
  add-on items).
- **SendGrid** email wrapper + a Vercel Cron compliance-sweep route.
- **MTD layer** abstraction (`/lib/mtd`) — writes HMRC-shaped summaries locally;
  no "file to HMRC" until HMRC recognition is granted.
- **Landing page** + **public calculator suite** (SDLT/LTT/LBTT, yield, income
  tax, CGT, Section 24, MTD estimator, mortgage, rent increase, deposit cap, EPC).

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
