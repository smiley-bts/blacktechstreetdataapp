# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Black Tech Street data app: a CRM, event management, and reporting dashboard for the ASPIRE program. It is a Lovable-generated Vite + React 18 + TypeScript SPA backed by Supabase (project `woqjbwotxaaczkptnjfd`). Changes made through Lovable are committed to this repo automatically, so expect generated code patterns and one-off pages.

## Commands

```sh
npm i              # install (bun.lockb also present, but npm is the documented path)
npm run dev        # dev server on port 8080
npm run build      # production build
npm run build:dev  # development-mode build
npm run lint       # eslint
npm run preview    # preview built app
```

There are **no tests** and **no typecheck script**. The build uses `@vitejs/plugin-react-swc`, which strips types without checking them — run `npx tsc --noEmit -p tsconfig.app.json` if you want type errors surfaced. TypeScript is intentionally loose (`strictNullChecks: false`, `noImplicitAny: false`), and `@typescript-eslint/no-unused-vars` is off.

## Architecture

### Frontend

- Routing lives entirely in `src/App.tsx` — flat `<Routes>` list, mostly one-off event/report pages (e.g. `/microsoftvisit`, `/dec6aspire`, `/gacereport`). New routes must be added **above** the catch-all `*` route. Staff-facing routes are grouped under `/staff/*`.
- `@/` aliases `src/`.
- UI is shadcn/ui (`src/components/ui/`, config in `components.json`) + Tailwind + Radix. Dark theme is the default (`next-themes`).
- Server state uses TanStack Query; `src/hooks/` holds ~45 domain hooks that are the de facto data layer. Feature components are grouped by area: `src/components/crm/` (dashboards, contact list, dedup, exports), `src/components/admin/`, plus per-event folders (`microsoft-visit/`, `aspire-enterprise/`, etc.).

### Two coexisting data models (important)

1. **Legacy CSV-driven analytics**: static CSV exports in `public/` (e.g. `aspire-june2025-registration.csv`, `contacts.csv`) are fetched at runtime and parsed with papaparse. Per-event hooks (`useJune2025Event`, `useSep2025Event`, `useHappyHourEvent`, `useCSVDashboardMetrics`, …) each hardcode their CSV paths. Most existing dashboards/report pages read from these.
2. **Unified Supabase event model** (newer, see `supabase/migrations/20260224_unified_event_model.sql`): `events` + `event_registrations` tables, consumed via `useEvents`. Registrations come in through the `tally-webhook` edge function (Tally form submissions routed by form ID to registrations or pre/post `survey_responses`). QR check-in goes through the `checkin_by_qr_token` Postgres function. A DB trigger upserts registrations into `participants`/`participant_emails` (matched by lowercased email) and mirrors check-ins into the legacy `event_attendance` table.

New event work should use the unified model, not new hardcoded CSV hooks.

### CRM data integrity

`src/lib/contactSync.ts` documents the strict contact-matching rules: match by email first (case-insensitive), then normalized phone, then name only as a high-similarity fallback. Attendance imports must update existing contacts, never create duplicates. Dedup/merge tooling lives in `useAutoDeduplication`, `useDuplicateDetection`, `useMergeHistory`, and `src/components/crm/DeduplicationModal.tsx`.

### Auth and roles

`src/hooks/useAuth.ts` is the single auth source:

- Login is **username-based**: the `lookup_email_by_username` RPC resolves the email, then `signInWithPassword` is called. Client-side rate limiting (5 attempts / 15-min lockout) is kept in localStorage.
- Roles come from the `user_roles` table: `owner`, `admin`, `staff`. `isAdmin` includes owners; staff get redirected to `/staff` after login and see a reduced UI.
- **Demo mode**: a `demo-mode` localStorage flag makes `useAuth` return a synthetic admin profile with no real session (see `.lovable/plan.md`). DB writes behind RLS and authed edge-function calls will fail in demo mode.
- `src/components/ProtectedRoute.tsx` gates routes on `useAuth`.

### Supabase

- Client: `src/integrations/supabase/client.ts` (auto-generated — do not edit). Credentials come from `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in the committed `.env`.
- **`src/integrations/supabase/types.ts` is stale**: it predates the unified event model and lacks `events`, `event_registrations`, `survey_responses`, and the laptop tables. Newer hooks (`useEvents`, `useLaptops`) declare their own interfaces instead of using `Tables<>`. Regenerate the file or follow the local-interface pattern when touching those tables.
- Migrations live in `supabase/migrations/` — the older ones are Lovable-generated UUIDs, newer hand-written ones are descriptively named (`20260224_unified_event_model.sql`, `20260225_laptop_inventory.sql`).
- Edge functions in `supabase/functions/` (all `verify_jwt = false` per `config.toml`): `tally-webhook` (form intake), `chat` (BTS GPT assistant — injects live event/survey/project data as context, uses Lovable's AI gateway), `import-csv-contacts`, `sync-attendance`, `manage-admin`, `setup-admins`, `wipe-crm-data`, `get-mapbox-token`.
- RLS convention: public/anon read (or insert for webhook intake), writes gated by `public.is_admin(auth.uid())`.

### Staff kiosk features

`/staff` (StaffHome) → `/staff/events` (EventSelect) → `/staff/checkin/:eventId` (EventKiosk, QR + manual check-in/check-out) and `/staff/laptops` (LaptopInventory, checkout/return backed by `useLaptops`).
