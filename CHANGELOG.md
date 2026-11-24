# CHANGELOG

## v0.3.0 — Phase 2: Authentication & Profiles
**التاريخ:** 2026-11-24

### أُضيف
- **Supabase Integration:**
  - `@supabase/supabase-js` + `@supabase/ssr`
  - Browser client، Server Component client، Middleware client
  - `src/middleware.ts` — route protection + session refresh

- **Auth Pages:**
  - `/auth/register` — تسجيل جديد مع تأكيد البريد
  - `/auth/login` — تسجيل الدخول + redirect param (Suspense boundary)
  - `/auth/forgot-password` — استرداد كلمة السر
  - `/auth/callback` — Route handler لتبادل الكود بالجلسة

- **Parent Dashboard:**
  - `/parent` layout — Server auth check، ParentNav
  - `/parent` page — Welcome، أطفالي، عوالم quick access
  - `ParentNav` — sticky، mobile menu، sign out

- **Child Profile:**
  - `/parent/children/add` — emoji picker، name، birth_year، age_group، PIN

- **Database:**
  - `supabase/migrations/001_phase2_auth_profiles.sql`
  - `parent_profiles` + `child_profiles` + RLS policies + triggers
  - `docs/SUPABASE_SETUP.md`

- **Build:**
  - `tsc --noEmit` ✅ — 0 errors
  - `next build` ✅ — 8 routes، Middleware 88kB

---

## v0.2.0 — Phase 1: Foundation & Design System
**التاريخ:** 2026-11-24

### أُضيف
- **Design System UI Components:**
  - `Button` (5 variants: primary/secondary/ghost/danger/outline، 4 sizes، loading state)
  - `Card` + CardHeader/CardTitle/CardBody/CardFooter (5 variants)
  - `Input` (label، error، hint، start/end icons، password toggle، RTL-aware)
  - `Badge` (7 variants: default/primary/success/warning/error/info/world)
  - `Avatar` (6 sizes، initials fallback، deterministic color-from-name)
  - `ProgressBar` (4 colors، 3 sizes، label، percent display، aria-compliant)
  - `Skeleton` / `SkeletonCard` / `SkeletonText`
  - `EmptyState`
  - Barrel export at `@/components/ui`

- **Layout Components:**
  - `Navbar` — sticky، glass-effect، responsive hamburger menu، RTL
  - `Footer` — 3-column links، brand tagline، dynamic year
  - Barrel export at `@/components/layout`

- **App Pages:**
  - Landing page — Hero section، 7 SALEEM WORLDS grid، Features، CTA
  - `not-found.tsx` — 404 page (عربية، themed)
  - `error.tsx` — Error boundary (client component)

- **PWA:**
  - `public/manifest.json` — RTL، Arabic، theme color، icons config

- **Packages:**
  - `@saleem/types` — full TypeScript types
  - `@saleem/design-tokens` — colors، world colors، fonts، spacing
  - Monorepo root with pnpm workspaces

- **Build:**
  - `pnpm install` ✅ — 381 packages
  - `tsc --noEmit` ✅ — 0 errors
  - `next build` ✅ — 4 static pages، First Load JS ~88kB

---

## v0.1.0 — Phase 0: Audit & Project Readiness
**التاريخ:** 2026-11-24

### أُضيف
- جميع ملفات التوثيق (17 ملف في `docs/`)
- `CLAUDE.md`، `COST_GUARD.md`، `PROJECT_STATUS.md`، `TASKS.md`
- `DECISIONS.md`، `CHANGELOG.md`، `README.md`
- هيكل المشروع الأساسي (monorepo، config files)
- تحليل المنافسين (3asafeer.com)
- رؤية المنتج + SALEEM WORLDS
