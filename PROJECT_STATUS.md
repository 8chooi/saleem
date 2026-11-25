# حالة مشروع سَلِيم | SALEEM

**آخر تحديث:** 2026-11-25
**المرحلة الحالية:** مراجعة الفجوات وتحسين تجربة الطفل (بانتظار موافقة المالك)

> تنبيه: المراحل المعلَّمة «مكتملة» أدناه تعني أن الأساس مبني، لا أن المنتج مكتمل. الحالة الفعلية لكل وظيفة في `docs/PRODUCT_GAP_AUDIT.md`.

### الحالة الفعلية المختصرة (2026-11-25)
- يعمل: التسجيل والدخول، ملف الطفل، صفحة الطفل حسب العمر، 16 قصة بمستويات وصوت الجهاز، 12 درسًا كلها بأسئلة، 5 ألعاب، لوحة رسم وصفحات تلوين، نقاط وشارات تلقائية، لوحة ولي الأمر مع آخر النشاطات وإسناد المهام، المكتبة المفتوحة (532 قصة كفهرس). عزل البيانات بين الأسر مختبَر.
- جزئي: الصوت (يعتمد على الجهاز)، العوالم (كلها فيها دروس، 4 منها بدرس واحد)، المكتبة المفتوحة (القراءة على موقع الناشر).
- غير موجود: لوحة المعلمين، إدارة المحتوى، الدفع، تسجيل صوت الطفل، رسومات أصلية احترافية.
- الاستضافة: Vercel Hobby (لا يسمح بالاستخدام التجاري عند بدء الدفع).

---

## ملخص المراحل

| المرحلة | الاسم | الحالة |
|---------|-------|--------|
| Phase 0 | Audit & Readiness | ✅ مكتملة |
| Phase 1 | Foundation & Design System | ✅ مكتملة |
| Phase 2 | Authentication & Profiles | ✅ مكتملة |
| Phase 2.5 | Mobile WebView App | ✅ مكتملة |
| Phase 3 | Learning Engine | ✅ مكتملة |
| Phase 4 | Stories & Library | ✅ مكتملة |
| Phase 5 | Games & Assessment | ✅ مكتملة |
| Phase 6 | Parent Experience | ✅ مكتملة |
| Phase 7 | Teachers & Schools | ⏳ لم تبدأ |
| Phase 8 | Admin CMS | ⏳ لم تبدأ |
| Phase 9 | Mobile (Native features) | ⏳ لم تبدأ |
| Phase 10 | QA & Release | ⏳ لم تبدأ |

---

## ما تم إنجازه

### البنية التقنية
- ✅ Monorepo بـ pnpm workspaces
- ✅ Next.js 14 + TypeScript strict
- ✅ Tailwind CSS v3 + design tokens
- ✅ RTL-first (dir="rtl", logical CSS)
- ✅ Supabase Free (DB + Auth + Storage)
- ✅ GitHub Actions CI/CD
- ✅ Cloudflare Pages deployment workflow
- ✅ PWA manifest

### الواجهة (Phase 1)
- ✅ Design tokens package (`@saleem/design-tokens`)
- ✅ UI components: Button, Card, Badge, Modal, Toast, Input, Progress, Avatar, Skeleton, EmptyState
- ✅ Layout: Navbar + Footer
- ✅ Landing page كاملة (Hero + 7 Worlds + Features + CTA)
- ✅ 404 و error pages
- ✅ Google Fonts: Cairo + Inter

### المصادقة (Phase 2)
- ✅ Supabase Auth integration (`@supabase/ssr`)
- ✅ تسجيل + تأكيد البريد
- ✅ تسجيل دخول + نسيت كلمة المرور
- ✅ Auth callback handler
- ✅ Middleware لحماية المسارات
- ✅ قاعدة بيانات: `parent_profiles` + `child_profiles`
- ✅ RLS policies
- ✅ لوحة تحكم الوالد
- ✅ إضافة ملفات الأطفال (اسم + سنة + إيموجي + PIN)

### التطبيق المحمول (Phase 2.5)
- ✅ Expo SDK 51 + expo-router
- ✅ WebView wrapper (react-native-webview)
- ✅ Android back button handling
- ✅ Offline detection (NetInfo)
- ✅ Loading overlay
- ✅ Google Play compliance settings
- ✅ EAS Build config (preview APK + production AAB)
- ✅ صفحات `/privacy` و `/terms` (مطلوبة لـ Google Play)
- ✅ دليل النشر `docs/GOOGLE_PLAY_SUBMISSION.md`

### النشر
- ✅ `vercel.json` للـ web app
- ✅ GitHub Actions: CI + Cloudflare deploy workflows
- ✅ `docs/SUPABASE_SETUP.md`

---

## الخطوات المطلوبة قبل النشر

### للموقع
1. أنشئ مشروع Supabase مجاني
2. انسخ env vars لـ `apps/web/.env.local`
3. شغّل migration `supabase/migrations/001_phase2_auth_profiles.sql`
4. ادفع للـ GitHub (CI يبني تلقائياً)
5. اربط بـ Cloudflare Pages

### للتطبيق
1. صمّم أيقونات (انظر `apps/mobile/assets/README.md`)
2. حدّث `SITE_URL` في `apps/mobile/app/index.tsx`
3. `eas build --profile preview --platform android` (APK للاختبار)
4. `eas build --profile production --platform android` (AAB للنشر)
5. ارفع على Google Play Console (انظر `docs/GOOGLE_PLAY_SUBMISSION.md`)

---

## البنية الحالية للملفات

```
saleem/
├── apps/
│   ├── web/                    # Next.js 14 app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/   # Landing, /privacy, /terms
│   │   │   │   ├── (auth)/        # Login, Register, Forgot
│   │   │   │   ├── (parent)/      # Parent dashboard
│   │   │   │   └── auth/callback/ # Supabase callback
│   │   │   ├── components/
│   │   │   │   ├── ui/            # Button, Card, Progress...
│   │   │   │   ├── layout/        # Navbar, Footer
│   │   │   │   └── parent/        # ParentNav
│   │   │   └── lib/supabase/      # client, server, middleware
│   │   └── public/manifest.json
│   └── mobile/                 # Expo WebView app
│       ├── app/
│       │   ├── _layout.tsx
│       │   └── index.tsx       # WebView main screen
│       ├── assets/             # icon, splash (ضعها هنا)
│       ├── app.json
│       └── eas.json
├── packages/
│   ├── design-tokens/          # CSS variables
│   └── types/                  # Shared TypeScript types
├── supabase/migrations/        # SQL migrations
└── docs/
    ├── SUPABASE_SETUP.md
    ├── GOOGLE_PLAY_SUBMISSION.md
    └── COST_GUARD.md
```
