# خطة التطوير المستقبلية — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26  
**الوضع الحالي:** نسبة اكتمال ~55% (Phases 0–6 مكتملة)

---

## مبادئ الخطة

1. **الميزانية صفر** — كل خطوة مجانية كاملاً
2. **الإطلاق أولاً** — إصلاح ما يوقف الإطلاق قبل الإضافات
3. **القيمة أولاً** — كل مرحلة تُضيف قيمة حقيقية للمستخدم
4. **لا تبدأ مرحلة قبل اختبار السابقة**

---

## المرحلة A — إصلاحات الإطلاق (الأسبوع 1–2)

**الهدف:** جعل المنصة جاهزة للإطلاق العام بدون مشاكل حرجة

### A1. إصلاح callback المكرّر
**الملفات:**
- `apps/web/src/app/(auth)/auth/callback/route.ts`
- `apps/web/src/app/auth/callback/route.ts`

**الخطوات:**
1. اختبر أيهما يستجيب فعلاً (فحص Supabase Auth Settings → Redirect URL)
2. احذف الملف غير المستخدم
3. تأكد من عمل تسجيل الدخول وتأكيد البريد

### A2. تشغيل script توليد الأصوات
**الملف:** `scripts/generate-story-audio.py`

**الخطوات:**
1. أضف `SUPABASE_SERVICE_KEY` في السكريبت
2. شغّل: `pip install edge-tts supabase && python scripts/generate-story-audio.py`
3. تحقق من ظهور الصوت في قارئ القصص

### A3. تحديث SITE_URL في Mobile
**الملف:** `apps/mobile/app/index.tsx` السطر 17
```tsx
const SITE_URL = 'https://your-actual-domain.vercel.app'  // ← حدّث هذا
```

### A4. إضافة Supabase Ping
**الوصف:** خدمة Uptime Robot مجانية (أو cron job) تُرسل طلباً لـ Supabase كل 5 أيام

---

## المرحلة B — تحسين الجودة (الأسبوع 3–4)

### B1. حل N+1 في لوحة الوالد
**الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx`

**التغيير:** استبدال loop بـ `IN` query:
```tsx
// بدلاً من:
for (const child of children) { await Promise.all([...4 queries]) }

// استخدم:
const childIds = children.map(c => c.id)
const [points, progress, reads, badges] = await Promise.all([
  supabase.from('child_points').select('*').in('child_id', childIds),
  supabase.from('learning_progress').select('*').in('child_id', childIds),
  supabase.from('story_reads').select('*').in('child_id', childIds),
  supabase.from('child_badges').select('*').in('child_id', childIds),
])
```

### B2. Security Headers في vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin" }
      ]
    }
  ]
}
```

### B3. إضافة skeleton loaders للصفحات الناقصة
**الصفحات المحتاجة:**
- `apps/web/src/app/(parent)/parent/dashboard/loading.tsx`
- `apps/web/src/app/(child)/kids/[childId]/loading.tsx`
- `apps/web/src/app/(child)/games/[type]/loading.tsx`

---

## Phase 7 — لوحة المعلمين والمدارس (الشهر 2–3)

**الهدف:** ميزة تنافسية غائبة عن عصافير وكل المنافسين الرئيسيين

### الصفحات المطلوبة:
```
apps/web/src/app/teacher/
├── layout.tsx          (حماية مسار المعلم)
├── page.tsx            (dashboard الصف)
├── students/
│   └── [studentId]/
│       └── page.tsx    (تفاصيل طالب)
└── assignments/
    └── new/
        └── page.tsx    (إسناد مهمة)
```

### جداول DB المطلوبة:
```sql
-- معلم
CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  school_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ربط طالب بمعلم
CREATE TABLE teacher_students (
  teacher_id UUID REFERENCES teacher_profiles(id),
  child_id UUID REFERENCES child_profiles(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (teacher_id, child_id)
);
```

---

## Phase 8 — نظام إدارة المحتوى الكامل (الشهر 3)

**الوضع الحالي:** admin CMS موجود (`/admin`) لكن لم يُختبر بالكامل

### المهام:
1. اختبار حفظ القصص الجديدة من `/admin`
2. اختبار حفظ الدروس والأسئلة
3. إضافة واجهة رفع الصوت (MP3) عبر لوحة الإدارة
4. إضافة رفع صور القصص (عند توفرها)

---

## Phase 9 — تطبيق الموبايل الحقيقي (الشهر 4–6)

**الوضع الحالي:** WebView wrapper — يعمل لكن محدود

### الميزات المطلوبة:
1. Push Notifications (Expo Push Notifications — مجاني)
2. Offline reading (حفظ 5 قصص محلياً)
3. أداء أفضل عند شبكة بطيئة
4. شاشة splash محلية

### التقنيات:
```
expo-notifications     — push notifications
@react-native-async-storage/async-storage — offline cache
expo-background-fetch  — background sync
```

---

## Phase 10 — QA والإطلاق (الشهر 6)

### قائمة ما قبل الإطلاق:

**الاختبارات الوظيفية:**
- [ ] تسجيل وتأكيد بريد إلكتروني جديد
- [ ] إضافة 3 أطفال ودخولهم بـ PIN
- [ ] إتمام قصة كاملة والتحقق من تسجيل القراءة
- [ ] إتمام درس والتحقق من تسجيل التقدم
- [ ] لعب كل الألعاب الستة
- [ ] رسم لوحة وحفظها
- [ ] تسجيل صوت في قصة

**الاختبارات الأمنية:**
- [ ] تأكيد RLS: مستخدم A لا يرى بيانات مستخدم B
- [ ] تأكيد عدم وصول غير admin لـ `/admin`
- [ ] تأكيد عمل تشفير PIN

**الاختبارات على الأجهزة:**
- [ ] Android Chrome (هاتف حقيقي)
- [ ] iOS Safari (جهاز حقيقي أو Simulator)
- [ ] Desktop Chrome/Firefox
- [ ] PWA تثبيت على Android

---

## الجدول الزمني المقترح

| المرحلة | المدة | الأولوية |
|---------|-------|---------|
| A — إصلاحات الإطلاق | أسبوع 1–2 | 🔴 حرج |
| B — تحسين الجودة | أسبوع 3–4 | 🔴 عالية |
| Phase 7 — المعلمون | شهر 2–3 | 🟡 مهمة |
| Phase 8 — Admin CMS كامل | شهر 3 | 🟡 مهمة |
| Phase 9 — Mobile Native | شهر 4–6 | 🟢 متوسطة |
| Phase 10 — QA | شهر 6 | 🔴 إلزامية |

---

## القرارات المعلّقة (تحتاج صاحب المشروع)

1. **متى يبدأ الدفع؟** — الموعد يحدد متى تتحول من Vercel Hobby لـ Cloudflare Pages
2. **هل نضيف Google Login؟** — يرفع معدل التسجيل لكن يتطلب قرار خصوصية
3. **هل نطلق iOS أم Android أولاً؟** — Android أسهل (APK مباشر)
4. **ما نموذج الدفع للمدارس؟** — اشتراك سنوي / لائحة بيضاء للصفوف
