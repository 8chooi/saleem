# تدقيق الأمان والحماية — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26  
⚠️ هذا التقرير لا يكشف مفاتيح API أو كلمات مرور أو بيانات سرية.

---

## ملخص التقييم: 7.5/10

البنية الأمنية الأساسية محكمة (RLS + PIN hashing + Admin protection). الثغرات الرئيسية: غياب rate limiting وعدم اكتمال اختبار الحماية على جميع المسارات.

---

## ✅ ما هو محمي (مؤكد بالكود)

### 1. Row Level Security (RLS) على كل الجداول
**المصدر:** migrations 001–021  
كل عملية SELECT/INSERT/UPDATE/DELETE على بيانات الأسر محمية بـ RLS.  
**مثال (من migration 001):**
- `parent_profiles`: المستخدم يرى ملفه فقط
- `child_profiles`: الوالد يرى أطفاله فقط
- `learning_progress`, `story_reads`, `game_sessions`: مرتبطة بـ `child_id` المملوك للوالد

**اختبار موثّق:** 13 خطوة اختبار عزل البيانات نجحت (من `PROJECT_STATUS.md`).

### 2. PIN الطفل مُشفَّر
**المصدر:** `migration 008_hash_child_pin.sql`  
PIN الطفل مخزَّن كـ hash (pgcrypto)، وليس نصاً صريحاً.  
**التحقق:** RPC `verify_child_pin` (migration 021) يقارن الـ hash.

### 3. Admin Protection بطبقتين
**المصدر:** `apps/web/src/app/admin/layout.tsx`
```tsx
if (!user) redirect('/auth/login?redirect=/admin')
const { data: isAdmin } = await supabase.rpc('is_admin')
if (!isAdmin) notFound()
```
✅ المسار لا يكشف حتى أنه موجود (يُرجع 404 بدلاً من 403).

### 4. لا مفاتيح سرية في كود الواجهة
**المصدر:** `apps/web/src/lib/supabase/middleware.ts`
```
NEXT_PUBLIC_SUPABASE_URL   — public (مقصود)
NEXT_PUBLIC_SUPABASE_ANON_KEY — public (مقصود، محمي بـ RLS)
```
✅ مفتاح `service_role` غير موجود في كود الواجهة.

### 5. إزالة سياسات القراءة العامة
**المصدر:** `migration 016_drop_public_read_policies.sql`  
تم حذف السياسات التي تسمح بقراءة عامة. كل القراءة الآن تتطلب مصادقة.

### 6. حماية المسارات في Middleware
**المصدر:** `apps/web/src/middleware.ts`  
قائمة المسارات المحمية: `/parent, /child, /admin, /teacher, /worlds, /stories, /badges, /games, /kids, /draw, /library`

### 7. تسجيلات الصوت في مجلد خاص
**المصدر:** `apps/web/src/components/stories/ReadAloudRecorder.tsx`
```tsx
const path = `${user.id}/${childId}/${storyId}-${Date.now()}.${ext}`
```
✅ المسار يتضمن `user.id` — الملفات مفصولة بين المستخدمين.

### 8. `robots: { index: false }` للصفحات الإدارية
**المصدر:** `apps/web/src/app/admin/layout.tsx`
```tsx
export const metadata = { robots: { index: false } }
```
✅ محركات البحث لا تُفهرس صفحات الإدارة.

---

## ⚠️ ثغرات ونقاط ضعف

### 1. لا يوجد Rate Limiting على نماذج المصادقة
**التصنيف:** احتمال (غير مؤكد — لم نتحقق من إعدادات Supabase Auth)  
**المشكلة:** نموذجا تسجيل الدخول والتسجيل قد يكونان عرضة لـ brute force.  
**التخفيف الحالي:** Supabase Auth يطبّق rate limiting داخلياً، لكن غير محدد الإعدادات.  
**التوصية:** تفعيل CAPTCHA على Supabase Dashboard (hCaptcha مجاني).

### 2. لا يوجد CSRF Protection صريح
**التصنيف:** احتمال  
**الملاحظة:** Next.js App Router مع Server Actions يوفر حماية ضمنية، لكن المشروع لا يستخدم Server Actions — يستخدم Client Components مع Supabase Client مباشرة.  
**التخفيف:** Supabase Auth cookies محمية بـ SameSite=Lax.

### 3. SITE_URL غير محدَّث في تطبيق الموبايل
**الملف:** `apps/mobile/app/index.tsx` السطر 17
```tsx
const SITE_URL = 'https://saleem.8ch.app'
```
**المشكلة (مؤكدة):** الرابط يشير لدومين غير مفعَّل. مذكور في `TASKS.md` كـ pending.  
**الخطر:** إذا نُشر التطبيق بهذا الرابط سيظل في حالة loading.

### 4. تحقق العمر يعتمد على إدخال المستخدم فقط
**الملف:** `child_profiles` — age validation  
**الملاحظة:** التحقق من عمر الطفل (3–12) موجود في الواجهة، لكن لم يُتحقق من وجوده في DB constraints.  
**المصدر:** مذكور في `TASKS.md`: "منع إدخال عمر خارج 3–12 سنة عند إضافة طفل (كان الحفظ يفشل)" — ✅ مُصلَح.

### 5. تسجيلات صوت الأطفال في Supabase Storage
**التصنيف:** ملاحظة تصميمية  
**الملف:** `ReadAloudRecorder.tsx`  
تسجيلات صوت الأطفال مخزَّنة في Supabase Storage. الحد المجاني: 1 جيجا.  
**التوصية:** يجب وضع سياسة واضحة للحذف التلقائي (TTL) قبل الإطلاق التجاري.

### 6. لا توجد سياسة CORS صريحة
**التصنيف:** احتمال  
Next.js يُدير CORS تلقائياً، لكن لم يُتحقق من إعدادات Supabase CORS المسموح بها.

---

## 🔐 بيانات المستخدمين الحساسة

| البيانات | مكان التخزين | مستوى الحماية |
|---------|-------------|--------------|
| كلمة مرور الوالد | Supabase Auth (bcrypt) | عالٍ |
| PIN الطفل | PostgreSQL (pgcrypto hash) | عالٍ |
| بريد إلكتروني | Supabase Auth | متوسط (يمكن رؤيته في admin) |
| تسجيلات صوت الطفل | Supabase Storage (private bucket) | متوسط |
| نشاط الطفل (نقاط، شارات، تقدم) | PostgreSQL + RLS | متوسط |

---

## 📋 قائمة التحقق الأمني

| التحقق | الحالة |
|--------|--------|
| RLS على كل الجداول | ✅ |
| PIN مشفَّر | ✅ |
| لا مفاتيح سرية في الكود | ✅ |
| حماية مسارات الـ admin | ✅ |
| تأكيد البريد الإلكتروني | ✅ |
| إزالة سياسات القراءة العامة | ✅ |
| Rate limiting | ⚠️ تعتمد على Supabase defaults |
| CAPTCHA | ❌ غير مفعَّل |
| Security headers (CSP, HSTS) | ❌ غير محدد |
| اختبار اختراق | ❌ لم يُجرَ |

---

## التوصيات الأمنية الفورية

1. **تفعيل hCaptcha** في Supabase Dashboard → Authentication → Protection
2. **إضافة Security Headers** في `vercel.json`:
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin`
3. **وضع سياسة حذف** لتسجيلات صوت الأطفال (Supabase Storage TTL)
4. **حذف ملف `/auth/callback` المكرّر** بعد تحديد الصحيح منهما
