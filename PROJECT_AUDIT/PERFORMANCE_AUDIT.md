# تدقيق الأداء والقابلية للتوسع — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26

---

## ملخص التقييم: 6.5/10

الأداء مقبول في الظروف العادية لكن يوجد عدد من نقاط الضعف الموثّقة: N+1 queries في dashboard، cold starts طويلة بسبب Vercel Hobby، ومخاطرة إيقاف Supabase بعد 7 أيام خمول.

---

## 1. أداء قاعدة البيانات

### مشكلة N+1 مؤكدة في لوحة الوالد
**الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx` السطر 29–53

```
الوضع الحالي (مع 4 أطفال):
child 1 → 4 استعلامات
child 2 → 4 استعلامات
child 3 → 4 استعلامات
child 4 → 4 استعلامات
= 16 استعلاماً تسلسلياً
```

**التأثير:** زمن استجابة 2–4 ثوانٍ لعائلة بـ 4 أطفال  
**الحل المقترح:** استعلام واحد مع `IN (child_ids)` + GROUP BY

### استعلامات جيدة (Promise.all موجود)
**الملفات:** `stories/page.tsx`, `admin/page.tsx`, `badges/page.tsx`

```tsx
const [{ data: children }, { data: allStories }] = await Promise.all([...])
```
✅ استعلامات متوازية — أداء جيد

---

## 2. أداء التحميل الأولي (Cold Start)

### Vercel Hobby — Cold Starts
**المشكلة:** Vercel Hobby لا يوفر serverless functions دائمة. الطلب الأول بعد فترة سكون قد يستغرق 2–5 ثوانٍ.

**التخفيف الحالي:**
- `loading.tsx` موجود لصفحات القصص → يعرض skeleton UI أثناء التحميل ✅
- Server Components (default في Next.js 14) تُحسَّن عند التخزين المؤقت

**التخفيف المفقود:**
- لا يوجد edge caching
- لا يوجد ISR (Incremental Static Regeneration) للصفحات الثابتة
- المحتوى يُجلَب من Supabase عند كل طلب

### تقييم Skeleton Loaders
| الصفحة | Skeleton موجود؟ |
|--------|---------------|
| `/stories` | ✅ نعم |
| `/stories/[slug]` | ✅ نعم |
| `/parent/dashboard` | ❓ غير مؤكد |
| `/kids/[id]` | ❓ غير مؤكد |
| `/games/*` | ❓ غير مؤكد |

---

## 3. مخاطرة توقف Supabase

**الحد المجاني:** Supabase تُوقف المشاريع الخاملة بعد **7 أيام** بدون طلبات.

**التأثير:** إذا لم يستخدم أحد المنصة 7 أيام، فعند العودة:
- أول طلب يستغرق 10–30 ثانية (استئناف قاعدة البيانات)
- ظهور خطأ 503 للمستخدمين

**الحل:** ping دوري كل 5 أيام (cron job بسيط أو Uptime Robot مجاني).

---

## 4. أداء الوسائط والصور

### صور المكتبة المفتوحة
**المصدر:** `migration 010` — الصور من `storage.googleapis.com`

**المشكلة (محتملة):** الصور تُحمَّل من Google Storage مباشرة:
- قد تكون بطيئة في بعض المناطق
- قد تُرفض بـ CORS في بعض الحالات
- لا يوجد Next.js Image Optimization عليها (لم يُتحقق من استخدام `<Image>`)

### أصوات القصص (TTS)
**الوضع الحالي:** Web Speech API (browser-side) — لا يستهلك network
**الوضع القادم:** MP3 من Supabase Storage — يُضيف 200–500ms للتحميل لكن جودة أعلى

---

## 5. Bundle Size وموارد JavaScript

**غير محقَّق مباشرة** — لم نشغّل `next build` أو `next analyze`.

**ما هو مؤكد:**
- framer-motion 11 مُستخدم → ~100KB gzipped (ثقيل نسبياً)
- Supabase JS ~170KB gzipped
- لا يوجد dynamic imports واضح للمكونات الثقيلة

**التوصية:** `ANALYZE=true next build` لفحص bundle size.

---

## 6. تحميل الخطوط

**المصدر:** `apps/web/src/app/layout.tsx`

Cairo + Inter من Google Fonts. إذا كانت مُحمَّلة بشكل صحيح مع `next/font`:
```tsx
import { Cairo } from 'next/font/google'
```
✅ يُحمَّل بشكل محسَّن (self-hosted بدون Google request)

إذا كانت بـ `<link>` في `<head>` → 🔴 مشكلة أداء

**لم يُتحقق** من أسلوب التحميل الفعلي.

---

## 7. تخزين مؤقت وCache

| الطبقة | الوضع |
|--------|-------|
| CDN / Edge Cache | ❌ لا يوجد |
| Redis / KV | ❌ لا يوجد |
| Browser Cache | ✅ Next.js يدير Cache-Control تلقائياً |
| Supabase Query Cache | ❌ لا يوجد |
| ISR | ❌ لا يوجد |

---

## 8. أداء PWA

**الملف:** `apps/web/public/manifest.json` موجود

**ما يوفره:**
- إمكانية التثبيت كـ PWA
- لكن لا توجد Service Worker للعمل Offline

**التوصية:** إضافة `next-pwa` أو Workbox لتخزين الموارد الثابتة offline.

---

## 9. قابلية التوسع

| السيناريو | التقييم | ملاحظة |
|-----------|---------|--------|
| 100 مستخدم متزامن | ✅ مقبول | Vercel + Supabase يتحملان |
| 1,000 مستخدم متزامن | ⚠️ محتمل | قد يصل لحدود Supabase Free |
| 10,000 مستخدم | ❌ يتجاوز الحد | يحتاج Supabase Pro ($25/شهر) |

**حدود Supabase Free:**
- 500MB database
- 50,000 monthly active users
- 2GB bandwidth
- 1GB storage

---

## التوصيات الفورية (الأداء)

1. **حل N+1 في parent/dashboard** (أعلى أولوية — يؤثر مباشرة على التجربة)
2. **إضافة cron ping لـ Supabase** (كل 5 أيام) لمنع إيقافه
3. **تفعيل ISR** للصفحات الثابتة كقائمة القصص (`revalidate: 3600`)
4. **إضافة skeleton loaders** للصفحات الناقصة
5. **فحص استخدام `next/font`** للتأكد من تحميل الخطوط بشكل محسَّن
