# CHANGELOG

## v0.10.0 — تسجيل صوت الطفل
**التاريخ:** 2026-11-25

### أُضيف
- مخزن خاص `recordings` (غير عام، 3 ميجا للملف) وجدول `story_recordings` (migration 014). كل ولي أمر له مجلد باسمه، ولا يرفع إلا في مجلدات أطفاله.
- زر «🎙️ سجّل قراءتك» داخل القصة: أقصى مدة 3 دقائق، جودة صوت منخفضة الحجم (~24 كيلوبت/ث، قرابة نصف ميجا للتسجيل).
- قسم «تسجيلات الطفل» في صفحة التقدم: تشغيل عبر رابط موقّع صالح ساعة، وحذف نهائي.
- `supabase/tests/recordings_storage_policies.sql`: 8 خطوات تُلغى بعد التشغيل.

### اختُبر
- صلاحيات المخزن والجدول: ولي الأمر يرفع في مجلد طفله فقط، ولا يرى تسجيلات غيره، ولا يربط سجلًا بملف غيره. لم يُختبر التسجيل نفسه بالميكروفون.

## v0.9.0 — مهام ولي الأمر واختبار العزل
**التاريخ:** 2026-11-25

### أُضيف
- جدول `child_assignments` (migration 013): ولي الأمر يسند قصة أو درسًا مع رسالة قصيرة، وتُعلَّم المهمة منجزة تلقائيًا عند قراءة القصة أو إكمال الدرس.
- صفحة تقدّم الطفل: قسم «أسند مهمة» وقائمة المهام، وقسم «آخر النشاطات» (دروس، قصص، ألعاب بالتاريخ).
- صفحة الطفل: بطاقة «مهمة من أهلك» في الأعلى.
- `supabase/tests/rls_isolation_and_assignments.sql`: اختبار 13 خطوة بحسابَي وليّ أمر مؤقتين.

### اختُبر
- العزل: وليّ الأمر لا يرى طفل غيره ولا سجله، ولا يكتب تقدمًا أو مهمة له، ولا يغيّر اسمه، ولا يضيف له نقاطًا. المهام تكتمل تلقائيًا. الحسابات المؤقتة حُذفت.

## v0.8.0 — ألعاب ودروس وتلوين
**التاريخ:** 2026-11-25

### أُضيف
- لعبتا «حساب سريع» (جمع وطرح حتى ٢٠) و«الأضداد» (12 زوجًا مشكّلًا). صار في `/games` خمس ألعاب.
- `supabase/seed/012_new_world_lessons.sql`: أول درس لكل عالم كان فارغًا (الألوان بالإنجليزية، أكمل النمط، خلط الألوان، كواكب المجموعة الشمسية) مع 3 أسئلة لكل درس.
- صفحات تلوين أصلية (البيت، السمكة، الوردة) في `/draw?mode=color`: اختيار لون والضغط على جزء لتلوينه، مسح، وحفظ صورة.

### تغيّر
- الصفحة الرئيسية: إزالة «قريبًا» عن العوالم بعد أن صار في كل عالم درس.

## v0.7.0 — مراجعة الفجوات وتجربة الطفل
**التاريخ:** 2026-11-25

### أُضيف
- `docs/PRODUCT_GAP_AUDIT.md`: جدول فجوات مقابل عصافير بحالة كل وظيفة بعد فحص فعلي.
- لعبتان جديدتان: «أين الحرف؟» و«عُدّ معي» (8 أسئلة، نتيجة، حفظ الجلسة والنقاط)، وصفحة `/games` للألعاب الثلاث.
- مكوّن ألعاب مشترك `ChoiceGame` وأداة حفظ الجلسات `lib/games/save.ts`.
- `supabase/seed/011_lessons_content.sql`: محتوى أوسع لستة دروس و18 سؤالًا (3 لكل درس كان بلا اختبار).

### تغيّر
- صفحة الطفل `/kids/[id]`: ترتيب مختلف لكل فئة عمرية (3–5، 6–8، 9–12)، بطاقة «أكمل من حيث توقفت / درسك التالي»، «تحدّي اليوم» لـ 9–12، «إنجازاتي»، تقدّم كل عالم، وإخفاء العوالم التي بلا دروس.
- إزالة المكتبة المفتوحة من صفحة الطفل لأنها تفتح موقعًا خارجيًا؛ بقيت في لوحة ولي الأمر.
- زر «العب» يفتح صفحة الألعاب بدل لعبة واحدة.

### أُصلح
- الادعاءات التسويقية غير المدعومة في الصفحة الرئيسية والتسجيل والدخول: «آلاف الأسر»، «مئات القصص المسموعة»، «لا حدود»، «مجانية بالكامل»، «مراقبة وقت الشاشة»، «بوابة المعلمين». العوالم بلا محتوى صارت «قريبًا».
- خطأ اختلاف الخادم عن المتصفح في الألعاب العشوائية (الأسئلة تُولَّد في المتصفح فقط).
- إضافة طفل بعمر خارج 3–12 سنة كانت تفشل بخطأ غامض؛ صار الإدخال محصورًا في 3–12 برسالة واضحة.

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
