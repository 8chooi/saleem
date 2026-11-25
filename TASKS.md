# مهام سَلِيم | SALEEM

## ⏳ بانتظار موافقة المالك (2026-11-25)
- [ ] رسومات أصلية للقصص والشخصيات (تحتاج رسامًا أو أداة مدفوعة)
- [ ] مكان تخزين صور صفحات المكتبة المفتوحة (Supabase 1 جيجا أو مستودع GitHub منفصل)
- [ ] قرار الاستضافة عند بدء الدفع (Vercel Pro أو Cloudflare)

## 🔜 التالي حسب تقرير الفجوات
- [x] لعبتان إضافيتان: «حساب سريع» و«الأضداد» (5 ألعاب)
- [x] أول درس بأسئلة لكل من العوالم الأربعة الفارغة
- [x] صفحات تلوين أصلية (3 رسومات)
- [x] درسان إضافيان لكل عالم جديد (20 درسًا، 59 سؤالًا)
- [x] 4 قصص أصلية جديدة (20 قصة)
- [x] الإنجاز بالإتقان: دروس 60%+، نقاط الألعاب مرة يوميًا بـ 60%+
- [x] تحدّي الأسبوع
- [x] أسئلة فهم لكل قصة، والتصحيح في قاعدة البيانات
- [ ] قرار المالك: قصة «الثعلب الذكي» تعلّم أن الكذب على الدب ذكاء؛ إعادة كتابتها أو إخفاؤها
- [ ] دروس أكثر (عبر `/admin`)
- [x] إسناد قصة أو درس للطفل من لوحة ولي الأمر (تكتمل تلقائيًا)
- [x] اختبار عزل البيانات بين حسابَي وليّ أمر (13 خطوة نجحت)
- [x] تسجيل صوت الطفل وهو يقرأ (مخزن خاص، صلاحيات مختبَرة)
- [ ] تجربة التسجيل بالميكروفون فعليًا على هاتف وكمبيوتر
- [x] لوحة إدارة المحتوى `/admin` (قصص ودروس وأسئلة)
- [x] حذف سياسات القراءة العامة (migration 016) وإعادة الاختبار 11/11
- [x] إضافة حساب المالك مشرفًا
- [ ] تجربة الحفظ من `/admin` بحساب المالك
- [ ] اختبار الواجهات على هاتف حقيقي
- [ ] إزالة أحد ملفَّي `/auth/callback` المكرّرين (بموافقة)
- [x] منع إدخال عمر خارج 3–12 سنة عند إضافة طفل (كان الحفظ يفشل)

## ✅ 2026-11-25
- [x] تقرير الفجوات `docs/PRODUCT_GAP_AUDIT.md`
- [x] تصحيح الادعاءات التسويقية
- [x] صفحة الطفل حسب العمر + متابعة آخر نشاط + تحدّي اليوم + إنجازاتي
- [x] أسئلة لكل الدروس الثمانية
- [x] لعبتا «أين الحرف؟» و«عُدّ معي» وصفحة الألعاب

## ✅ منتهية

### Phase 0 — Audit & Readiness
- [x] هيكل المشروع (monorepo pnpm)
- [x] إعداد TypeScript strict
- [x] CLAUDE.md + قواعد العمل
- [x] COST_GUARD.md

### Phase 1 — Foundation & Design System
- [x] design-tokens package
- [x] UI components (Button, Card, Badge, Modal, Toast, Input, Progress, Avatar, Skeleton, EmptyState)
- [x] Layout (Navbar, Footer)
- [x] Landing page كاملة
- [x] 404 + error pages
- [x] PWA manifest
- [x] Google Fonts (Cairo + Inter)

### Phase 2 — Authentication & Profiles
- [x] Supabase client/server/middleware setup
- [x] Auth pages (login, register, forgot-password, callback)
- [x] Database migration (parent_profiles + child_profiles + RLS)
- [x] Parent dashboard
- [x] إضافة ملف طفل
- [x] Route protection middleware

### Phase 2.5 — Mobile WebView App
- [x] Expo project setup
- [x] WebView main screen (back button, offline, loading)
- [x] Google Play compliance
- [x] EAS Build config
- [x] /privacy + /terms pages
- [x] GOOGLE_PLAY_SUBMISSION.md

### النشر
- [x] vercel.json
- [x] GitHub Actions CI
- [x] Cloudflare Pages workflow
- [x] SUPABASE_SETUP.md

---

## 🔲 قادمة

### قبل النشر الأول (يدوي — أنت)
- [ ] أنشئ مشروع Supabase وانسخ env vars
- [ ] شغّل migration في Supabase SQL Editor
- [ ] صمّم أيقونات التطبيق (1024×1024)
- [ ] ادفع الكود لـ GitHub
- [ ] اربط بـ Cloudflare Pages
- [ ] حدّث SITE_URL في apps/mobile/app/index.tsx
- [ ] `eas build --profile preview` للاختبار
- [ ] `eas build --profile production` للنشر

### Phase 3 — Learning Engine
- [ ] جداول: subjects, lessons, learning_progress, quiz_questions
- [ ] RLS policies للتعلم
- [ ] صفحات العوالم السبعة (/worlds/[slug])
- [ ] صفحة الدرس (/worlds/[slug]/lessons/[id])
- [ ] نظام التقدم (rule-based، لا AI)
- [ ] API: إنهاء الدرس + تسجيل النقاط

### Phase 4 — Stories & Library
- [ ] جدول stories
- [ ] صفحة المكتبة
- [ ] عارض القصص (نصوص + صور)

### Phase 5 — Games & Assessment
- [ ] محرك الألعاب البسيطة
- [ ] نظام النقاط والشارات
- [ ] تقييم قصير بعد كل درس

### Phase 6 — Parent Experience
- [ ] تقارير تقدم الطفل
- [ ] إعدادات وقت الاستخدام
- [ ] إشعارات (Supabase Edge Functions)

### Phase 7 — Teachers & Schools
- [ ] حسابات المعلمين
- [ ] إدارة الفصل
- [ ] تقارير جماعية

### Phase 8 — Admin CMS
- [ ] لوحة إدارة المحتوى
- [ ] رفع دروس وقصص

### Phase 9 — Mobile (Native features)
- [ ] Push notifications (Expo)
- [ ] Offline content caching
- [ ] Deep links

### Phase 10 — QA & Release
- [ ] اختبارات شاملة (webapp-testing)
- [ ] أداء وسرعة (web-performance-rules)
- [ ] SEO (seo-optimizer)
- [ ] Google Play final submission
