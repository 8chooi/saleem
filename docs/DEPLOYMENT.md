# DEPLOYMENT.md — خطة النشر
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24

## الخطوات الفورية (بعد الانتهاء من الكود)

### 1. رفع على GitHub
```bash
cd C:\Users\etcho\Documents\saleem
git init
git add .
git commit -m "feat: SALEEM educational platform - initial release"
git remote add origin https://github.com/YOUR_USERNAME/saleem.git
git push -u origin main
```

### 2. تطبيق migrations في Supabase SQL Editor (بالترتيب):
1. `supabase/migrations/002_phase3_learning_engine.sql`
2. `supabase/migrations/003_increment_points_fn.sql`
3. `supabase/migrations/004_phase4_stories.sql`
4. `supabase/migrations/005_phase5_games.sql`
5. `supabase/seed/003_learning_seed.sql`
6. `supabase/seed/004_stories_seed.sql`
7. `supabase/seed/005_badges_seed.sql`

### 3. نشر Cloudflare Pages
- Framework: Next.js
- Build: `pnpm --filter @saleem/web build`
- Output: `apps/web/.next`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. GitHub Actions Secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## استراتيجية النشر المجاني

### المرحلة الأولى (التطوير)
| الخدمة | الاستخدام | الملاحظة |
|--------|----------|----------|
| Vercel Hobby | Web (dev/staging) | للتطوير فقط — غير تجاري |
| Supabase Free | Database + API | انتبه لحد الخمول (7 أيام) |
| GitHub | Monorepo + CI | مجاني بالكامل |

### المرحلة الثانية (الإنتاج)
| الخدمة | الاستخدام | الملاحظة |
|--------|----------|----------|
| Cloudflare Pages | Web hosting | **مجاني تجاري، bandwidth غير محدود** |
| Cloudflare Workers | Edge functions | 100k طلب/يوم مجاناً |
| Supabase Free | Database | راقب الحدود |
| Cloudflare R2 | ملفات ثابتة | 10GB/شهر مجاناً |

---

## لماذا Cloudflare Pages للإنتاج؟

| المقارنة | Vercel Hobby | Cloudflare Pages |
|---------|-------------|-----------------|
| تجاري | ❌ ممنوع | ✅ مسموح |
| Bandwidth | 100 GB/شهر | غير محدود |
| Builds | 100/شهر | 500/شهر |
| الدومين المجاني | .vercel.app | .pages.dev |

---

## التوزيع على المتاجر (مستقبلي)

### Android (Google Play)
- رسوم لمرة واحدة: **25 USD**
- غير مطلوب الآن — APK مباشر عبر PWA

### iOS (App Store)
- رسوم سنوية: **99 USD/سنة**
- غير مطلوب الآن — PWA يعمل على iOS

### التوزيع المجاني الحالي
- PWA من المتصفح (iOS + Android)
- APK مباشر لـ Android (بدون متجر)
- Expo Go للتطوير والاختبار

---

## متغيرات البيئة

```env
# .env.example (لا قيم حقيقية هنا أبداً)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# ⚠️ هذا المفتاح يبقى على الخادم فقط — لا يُضاف لـ NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App
NEXT_PUBLIC_APP_URL=https://saleem.example.com
NODE_ENV=production
```

---

## CI/CD Pipeline (GitHub Actions — مجاني)

```yaml
# .github/workflows/deploy.yml (مستقبلي)
on: push
jobs:
  build:
    - checkout
    - pnpm install
    - pnpm type-check
    - pnpm lint
    - pnpm test
    - pnpm build
  deploy:
    needs: build
    - Deploy to Cloudflare Pages
```

---

## قائمة ما يجب فعله قبل أي نشر
- [ ] `pnpm build` ينجح بدون أخطاء
- [ ] `pnpm lint` نظيف
- [ ] لا TypeScript errors
- [ ] لا secrets في الكود
- [ ] env variables مُعدّة في المنصة
- [ ] RLS مُفعّل في Supabase
- [ ] اختبار RTL
- [ ] اختبار على موبايل
