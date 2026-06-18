# Lintel Mobile (iOS + Android)

React Native (Expo SDK 51, Expo Router) landlord app that talks to the **same Supabase backend** as the web app — same tables, same Row-Level Security. Sign in with your existing Lintel email and password.

## Features (v1)
- **Auth** — email/password against Supabase, session persisted on device.
- **Dashboard** — properties, income/expenses this tax year, arrears, compliance-due, court-readiness shortcuts.
- **Properties** — list + detail (tenancies, compliance).
- **Rent ledger** — charges/payments, overdue summary.
- **Repairs** — list, and report a repair with a **camera photo** (uploads to the `maintenance` storage bucket).
- **Compliance** — certificate list with expiry countdowns.
- **Documents** — per-property vault with signed-URL open.
- **Court-readiness** — per-tenancy evidence score (lightweight mobile estimate).
- **Scan a receipt** — photograph a receipt → OCR via the web app's `/api/ocr` → pre-filled expense → saved to `transactions` with the image in the `receipts` bucket.
- **Assistant** — type a quick expense in plain English, confirm, save.

## Setup
```bash
cd mobile
npm install            # or: npx expo install  (reconciles native module versions)
cp .env.example .env   # then fill in the values
```

`.env` (same project as the web app):
```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
EXPO_PUBLIC_API_URL=https://lintel-green.vercel.app
```

## Run
```bash
npx expo start         # press i (iOS sim), a (Android), or scan the QR with Expo Go
npm run typecheck      # tsc --noEmit
```

To ship to the App Store / Play Store later, use EAS: `npx eas build -p ios` / `-p android`.

## Notes
- Add real `assets/` (icon, splash, adaptive icon) before a store build; `app.json` references brand colours but no images yet.
- The court-readiness screen is a quick on-device estimate; the web app runs the full jurisdiction-specific scorer.
- All writes obey the same Supabase RLS as the web app, so a user only ever sees their own org's data.
