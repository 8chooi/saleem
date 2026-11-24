# ملف التسليم — سَلِيم | SALEEM
## تاريخ: نوفمبر 2026

---

## ما تم بناؤه

### الموقع (Next.js 14 + TypeScript + Tailwind)

**صفحات التسويق:**
- `/` — الصفحة الرئيسية (RTL عربي كامل)
- `/privacy` — سياسة الخصوصية
- `/terms` — شروط الاستخدام

**المصادقة:**
- `/auth/login` — تسجيل الدخول
- `/auth/register` — إنشاء حساب
- `/auth/forgot-password` — نسيت كلمة المرور

**لوحة الوالدين:**
- `/parent` — الصفحة الرئيسية (أطفالي + عوالم)
- `/parent/dashboard` — لوحة المتابعة الكاملة
- `/parent/children/add` — إضافة طفل
- `/parent/children/:id/progress` — تقدم الطفل بالتفصيل

**التعلم (للأطفال):**
- `/worlds/:slug` — عالم التعلم (مثل `/worlds/letters`)
- `/worlds/:slug/lessons/:lessonSlug` — درس تفاعلي مع اختبار
- `/stories` — مكتبة القصص
- `/stories/:slug` — قارئ القصة
- `/games/matching` — لعبة المطابقة
- `/badges` — شارات الإنجاز

---

## قاعدة البيانات (Supabase Free)

### الجداول:
1. `users` (Supabase Auth)
2. `child_profiles` — ملفات الأطفال
3. `subjects` — المواد/العوالم (7 عوالم)
4. `lessons` — الدروس
5. `quiz_questions` — أسئلة الاختبار
6. `learning_progress` — تقدم التعلم
7. `child_points` — نقاط الأطفال
8. `stories` — القصص
9. `story_reads` — سجل القراءة
10. `badges` — الشارات
11. `child_badges` — شارات الأطفال
12. `game_sessions` — جلسات الألعاب

### الـ Seed Data:
- 7 مواد/عوالم
- 8 دروس (حروف + أرقام + علوم)
- 5 أسئلة اختبار
- 4 قصص عربية
- 8 شارات إنجاز

---

## الخطوات التالية للنشر

### 1. رفع GitHub (مجاني)
```bash
cd C:\Users\etcho\Documents\saleem
git init
git add .
git commit -m "feat: SALEEM v1.0 - Arabic educational platform"
git remote add origin https://github.com/YOUR_USERNAME/saleem.git
git push -u origin main
```

### 2. تطبيق migrations في Supabase SQL Editor
شغّل هذه الملفات بالترتيب في SQL Editor:
- `supabase/migrations/002_phase3_learning_engine.sql`
- `supabase/migrations/003_increment_points_fn.sql`
- `supabase/migrations/004_phase4_stories.sql`
- `supabase/migrations/005_phase5_games.sql`
- `supabase/seed/003_learning_seed.sql`
- `supabase/seed/004_stories_seed.sql`
- `supabase/seed/005_badges_seed.sql`

### 3. نشر Cloudflare Pages (مجاني + تجاري)
- Build command: `pnpm --filter @saleem/web build`
- Output directory: `apps/web/.next`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. تطبيق الموبايل (Expo)
في `apps/mobile/` — تطبيق WebView جاهز:
```bash
cd apps/mobile
npx eas build --platform android --profile preview
```

---

## إعداد Supabase Auth
في Supabase → Authentication → URL Configuration:
- Site URL: `https://your-project.pages.dev`
- Redirect URLs: `https://your-project.pages.dev/auth/callback`

---

## الميزانية = صفر 💰
- Supabase Free ✅
- Cloudflare Pages Free ✅
- GitHub Free ✅
- Google Play (رسوم لمرة واحدة $25) — ⚠️ مطلوبة فقط لنشر الـ APK
