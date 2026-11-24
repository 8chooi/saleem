# ROADMAP.md — خارطة الطريق
## سَلِيم | SALEEM

> التاريخ: 2026-11-24

---

## الوضع الحالي: Phase 0 ✅ (قيد الإكمال)

---

## المراحل

| Phase | الاسم | الحالة | المتطلب السابق |
|-------|-------|--------|----------------|
| 0 | Audit & Project Readiness | 🔄 جارٍ | — |
| 1 | Foundation & Design System | ⏳ التالية | Phase 0 |
| 2 | Authentication & Profiles | ⏳ | Phase 1 |
| 3 | Learning Engine | ⏳ | Phase 2 |
| 4 | Stories & Library | ⏳ | Phase 2 |
| 5 | Games & Assessment | ⏳ | Phase 3 |
| 6 | Parent Experience | ⏳ | Phase 2 |
| 7 | Teachers & Schools | ⏳ | Phase 2 |
| 8 | Admin CMS | ⏳ | Phase 3 + 4 |
| 9 | Mobile Applications | ⏳ | Phase 3 |
| 10 | QA & Release Readiness | ⏳ | Phase 1-9 |

---

## Phase 0 — Audit & Project Readiness
**الهدف:** وثائق كاملة وقرارات تقنية محددة

### المخرجات
- [x] CLAUDE.md
- [x] COST_GUARD.md
- [x] docs/FREE_SERVICES.md
- [x] docs/PRD.md
- [x] docs/ARCHITECTURE.md
- [x] docs/DATABASE.md
- [x] docs/DESIGN_SYSTEM.md
- [x] docs/SECURITY.md
- [x] docs/ROADMAP.md
- [x] docs/API.md
- [x] docs/DEPLOYMENT.md
- [x] docs/CONTENT_STRATEGY.md
- [x] docs/TESTING.md
- [x] PROJECT_STATUS.md
- [x] TASKS.md
- [x] CHANGELOG.md
- [x] DECISIONS.md
- [x] README.md

---

## Phase 1 — Foundation & Design System
**الهدف:** Monorepo يعمل + Design System كامل + PWA

### المخرجات المتوقعة
- Monorepo بـ pnpm workspaces
- packages/design-tokens
- packages/types
- apps/web — Next.js 14 يعمل
- Design System: Button, Card, Input, Avatar, Badge, Progress
- RTL/LTR يعمل
- PWA manifest
- صفحة رئيسية (landing)
- صفحات 404 / 500
- Loading / Error states
- Build ✅ | Lint ✅ | TypeScript ✅

---

## Phase 2 — Authentication & Profiles
**الهدف:** تسجيل دخول حقيقي + ملفات الأطفال

### المخرجات المتوقعة
- Supabase project مُعدّ
- تسجيل + دخول + خروج
- حساب ولي الأمر
- إنشاء وتعديل ملفات الأطفال
- حماية المسارات (middleware)
- RLS مُفعّل
- استعادة كلمة السر

---

## Phase 3 — Learning Engine
**الهدف:** هيكل المحتوى التعليمي + تسجيل التقدم

### المخرجات المتوقعة
- جداول: subjects, stages, units, lessons, progress
- صفحات: المواد، الوحدات، الدروس
- تسجيل إتمام الدرس
- مسار تعلم بسيط

---

## Phase 4 — Stories & Library
**الهدف:** مكتبة قصص تعمل فعلياً

### المخرجات المتوقعة
- جداول القصص
- عرض قائمة القصص
- قارئ القصة
- سجل القراءة
- التصفية حسب العمر والمادة

---

## Phase 5 — Games & Assessment
**الهدف:** ألعاب بسيطة + اختبارات + نقاط

### المخرجات المتوقعة
- لعبة واحدة على الأقل تعمل فعلياً
- نظام أسئلة + اختبار
- نقاط + شارة واحدة
- تسجيل النتائج

---

## Phase 6 — Parent Experience
**الهدف:** لوحة ولي الأمر الكاملة

### المخرجات المتوقعة
- لوحة تقدم الأطفال
- سجل النشاط
- إعدادات وقت الاستخدام
- تقرير مبسط

---

## Phase 7 — Teachers & Schools
**الهدف:** تجربة المعلم والمدرسة

### المخرجات المتوقعة
- إنشاء مدرسة وفصل
- إضافة طلاب
- توزيع درس/واجب
- تقرير الفصل

---

## Phase 8 — Admin CMS
**الهدف:** لوحة إدارة وسير اعتماد المحتوى

---

## Phase 9 — Mobile Applications
**الهدف:** تطبيق Expo يشارك منطق الويب

---

## Phase 10 — QA & Release Readiness
**الهدف:** جاهز للإطلاق
