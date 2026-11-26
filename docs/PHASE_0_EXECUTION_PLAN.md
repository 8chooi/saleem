# PHASE 0 — خطة التنفيذ التفصيلية
# SALEEM — المرحلة صفر: التثبيت والاستعداد

**تاريخ الإعداد:** 2026-11-26  
**مبني على:** فحص مباشر للكود — لا افتراضات  
**الفرع:** `master` — محدّث مع `origin/master`

---

## 1. حالة Git والمشروع

### 1.1 الفرع الحالي والـ commits الأخيرة

```
7540208  feat: add StoryPage audio field + generate-story-audio script
2be0b29  feat: add real audio support in StoryReader + generate-story-audio script
e393d92  fix(library): hide TTS section when Arabic voice unavailable
cd6eee0  feat(library): audio controls - TTS play/pause + auto-advance
9791ea4  perf(stories): parallel queries + loading skeletons
219fefa  fix(library): strip embedded JS from page text + preload next image
```

الفروع المتاحة:
- `master` ← الفرع الحالي، متزامن مع `origin/master`
- `origin/cloudflare-migration` ← branch للمعمارية البديلة
- `origin/open-library` ← branch للمكتبة المفتوحة
- `origin/stories-v2` ← branch للقصص

### 1.2 الملفات خارج Git (Untracked)

| الملف | الوضع | ملاحظة |
|-------|-------|--------|
| `PROJECT_AUDIT/` | Untracked | مجلد التقارير — لا يحتاج commit |
| `scripts/browser-import-sw.js` | Untracked | سكريبت مساعد — مراجعة ضرورية قبل إضافته |
| `apps/web/tsconfig.tsbuildinfo` | Modified | ملف auto-generated — لا داعي لـ commit |

### 1.3 آلية الرجوع (Rollback)

```bash
# الرجوع لـ commit محدد (بدون تغيير قاعدة البيانات)
git revert HEAD                          # عكس آخر commit
git checkout <commit-hash> -- <file>    # استعادة ملف واحد فقط

# النقاط الآمنة للرجوع إليها:
# 9791ea4 — قبل تعديلات الصوت (مستقر)
# 99f214c — قبل لوحة التحكم الجديدة
```

**ملاحظة:** لا توجد migrations لا رجعة فيها في آخر 10 commits — الرجوع آمن.

---

## 2. المشكلات المؤكدة (Confirmed Issues)

### M1: N+1 Query في لوحة ولي الأمر

- **الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx:30-53`
- **الكود الفعلي:**
```typescript
for (const child of children || []) {       // ← حلقة تكرارية متسلسلة
  const [points, lessons, stories, badges] = await Promise.all([
    supabase.from('child_points')...,
    supabase.from('learning_progress')...,
    supabase.from('story_reads')...,
    supabase.from('child_badges')...,
  ])
}
```
- **المشكلة:** الـ `for` حلقة متسلسلة (sequential). لكل طفل: 4 استعلامات متوازية، لكن الأطفال أنفسهم يُعالَجون واحداً تلو الآخر. للعائلة بـ 3 أطفال: 1 + (3×4) = **13 استعلام متسلسل**.
- **التأثير:** بطء واضح في تحميل اللوحة (كل استعلام ~50-100ms في Supabase free = 650ms+ للعائلة المتوسطة).
- **الحل المقترح:** استبدال `for` بـ `Promise.all` على مستوى الأطفال:
```typescript
const childrenData = await Promise.all(
  (children || []).map(async (child) => { ... })
)
```
- **الملفات المتأثرة:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx` فقط
- **معيار القبول:** تحميل لوحة عائلة بـ 3 أطفال في < 500ms (مقابل 1500ms+ حالياً)
- **وقت التنفيذ:** 10 دقائق
- **المخاطرة:** منخفضة جداً — تغيير `for` إلى `Promise.all` فقط

---

### M2: SITE_URL في Android قد لا يتطابق مع النشر الفعلي

- **الملف:** `apps/mobile/app/index.tsx:17`
- **الكود الفعلي:**
```typescript
// ← غيّر هذا للرابط الحقيقي بعد النشر على Cloudflare Pages
const SITE_URL = 'https://saleem.8ch.app'
```
- **المشكلة:** التعليق يقول "بعد النشر على Cloudflare Pages" لكن المشروع الآن على Vercel. إذا كان `saleem.8ch.app` يشير لـ Vercel فالأمر صحيح؛ إذا لا يوجد DNS لهذا الـ domain فالتطبيق لن يعمل.
- **التأثير:** تطبيق Android يفتح صفحة بيضاء أو خطأ اتصال.
- **الحل:** التحقق من DNS لـ `saleem.8ch.app` وتحديث URL إذا لزم.
- **معيار القبول:** تطبيق Android يفتح الموقع بنجاح.
- **وقت التنفيذ:** 5 دقائق (تحقق + تعديل سطر واحد)

---

### M3: غياب تام لاختبارات Frontend

- **الكود الفعلي:** لا يوجد أي ملف `.test.ts` أو `.spec.ts` في `apps/web/src/`
- **ما هو موجود:** 3 ملفات SQL لاختبار RLS في `supabase/tests/`
- **المشكلة:** لا توجد طريقة آلية للتحقق من عدم كسر الميزات الحالية عند التطوير.
- **التأثير:** كل إصلاح يتطلب اختباراً يدوياً كاملاً.
- **الحل:** إضافة Playwright لاختبارات E2E للمسارات الحرجة (تسجيل دخول، قراءة قصة، لوحة التحكم).
- **معيار القبول:** اختبار E2E واحد على الأقل يغطي: login → child select → open story.
- **وقت التنفيذ:** 2-3 ساعات

---

## 3. المشكلات التي تحتاج تحققاً (Needs Investigation)

| المشكلة | المصدر | التحقق المطلوب |
|---------|--------|---------------|
| "callback مكرّر" | تقارير سابقة | **غير مؤكد من الكود** — يوجد ملف callback واحد فقط (`auth/callback/route.ts`). قد يكون تم حل هذا بالفعل |
| `edge-tts` ترخيص تجاري | تقارير سابقة | مراجعة شروط استخدام Microsoft TTS API |
| `story_recordings` bucket RLS | migration 014 | التحقق من سياسات Storage في Supabase Dashboard |
| `browser-import-sw.js` | ملف untracked | مراجعة محتواه قبل إضافته للـ repo |

---

## 4. فحص نظام المصادقة

### 4.1 ملف auth/callback — نتيجة الفحص

**مؤكد من الكود:** يوجد ملف callback **واحد فقط**:
- `apps/web/src/app/auth/callback/route.ts`

```typescript
// الكود الكامل (18 سطر)
export async function GET(request: Request) {
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/parent'
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
```

**التقييم:** التنفيذ صحيح وبسيط. لا يوجد callback مكرّر حالياً.

**ملاحظة واحدة:** لا يوجد تحقق من `origin` — قد يكون مشكلة أمنية في بعض البيئات (انظر القسم 10).

### 4.2 Middleware — ما يحميه وما لا يحميه

**المسارات المحمية** (مؤكدة من `lib/supabase/middleware.ts:31`):
```
/parent  /child  /admin  /teacher  /worlds  /stories  /badges  /games  /kids  /draw  /library
```

**المسارات المفتوحة (غير محمية):**
- `/` — الصفحة الرئيسية ✓
- `/auth/login` و `/auth/register` ✓
- `/auth/callback` ✓ (ضروري للـ OAuth flow)
- الملفات الثابتة (`_next/static`, صور, icons) ✓

**ملاحظة مهمة:** مسار `/auth/callback` غير موجود في `protectedPaths` — هذا صحيح.

### 4.3 إعادة توجيه المستخدمين المسجّلين

```typescript
// middleware.ts:44-53 — مؤكد من الكود
const authPaths = ['/auth/login', '/auth/register']
if (isAuthPage && user) redirect('/parent')   // ← يمنع وصول المسجّل لصفحة الدخول
```

---

## 5. فحص SITE_URL في Android

### 5.1 القيمة الحالية

**مؤكد من الكود:** `apps/mobile/app/index.tsx:17`
```typescript
const SITE_URL = 'https://saleem.8ch.app'
```

### 5.2 التحقق المطلوب

| السؤال | الإجابة |
|--------|---------|
| هل `saleem.8ch.app` domain حقيقي؟ | يحتاج تحقق |
| هل يشير لـ Vercel؟ | يحتاج تحقق |
| هل يعمل HTTPS؟ | يحتاج تحقق |

### 5.3 خطوات الإصلاح (إذا كان URL خاطئاً)

1. اكتشف URL الحقيقي من Vercel Dashboard
2. عدّل السطر 17 في `apps/mobile/app/index.tsx`
3. أعد بناء APK

---

## 6. فحص N+1 في لوحة ولي الأمر

### 6.1 الاستعلامات الحالية

**مؤكد من الكود:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx`

```
الاستعلام 1:  child_profiles (1 query)
              ↓ لكل طفل في حلقة for:
الاستعلام 2:  child_points (1 query/طفل)
الاستعلام 3:  learning_progress count (1 query/طفل)
الاستعلام 4:  story_reads count (1 query/طفل)
الاستعلام 5:  child_badges count (1 query/طفل)
```

### 6.2 عدد الـ queries حسب حجم العائلة

| عدد الأطفال | queries حالياً | queries بعد الإصلاح |
|------------|---------------|---------------------|
| 1 | 5 | 5 (لا فرق) |
| 2 | 9 | 5 (متوازية) |
| 3 | 13 | 5 (متوازية) |
| 5 | 21 | 5 (متوازية) |

### 6.3 الحل الأمثل

**الخيار المقترح: Promise.all على مستوى الأطفال**

```typescript
// قبل الإصلاح
for (const child of children || []) {
  const [...] = await Promise.all([4 queries])
  childrenData.push(...)
}

// بعد الإصلاح
const childrenData = await Promise.all(
  (children || []).map(async (child) => {
    const [...] = await Promise.all([4 queries])
    return { ... }
  })
)
```

**لماذا لا RPC؟** الحل بـ Promise.all أبسط وأأمن — لا يلمس قاعدة البيانات ولا يحتاج migration.

### 6.4 تأثير الإصلاح

- الوقت الحالي: `N × (4 × avg_query_time)` = متسلسل
- الوقت بعد الإصلاح: `max(4 × avg_query_time)` = متوازٍ
- تحسّن متوقع: **50-70%** للعائلة بـ 3 أطفال+

---

## 7. فحص نظام تسجيل الصوت

### 7.1 المكتبة المستخدمة

**مؤكد من الكود:** `apps/web/src/components/stories/ReadAloudRecorder.tsx`
- يستخدم **Web API مباشرة**: `MediaRecorder` + `navigator.mediaDevices.getUserMedia`
- لا توجد مكتبة خارجية — المكتبة البرمجية هي المتصفح نفسه

الـ MIME types المحاولة بالترتيب:
```
audio/webm;codecs=opus → audio/webm → audio/mp4 → audio/ogg
```

### 7.2 التوافق مع Android WebView

| الميزة | الحالة |
|--------|--------|
| `MediaRecorder` | ✅ مدعوم (Chrome engine) |
| `audio/webm` | ✅ مدعوم |
| `getUserMedia` | ✅ مدعوم (يحتاج إذن المستخدم) |
| `allowsInlineMediaPlayback` | ✅ موجود في `index.tsx` |
| `mediaPlaybackRequiresUserAction={false}` | ✅ موجود |

**تقييم:** تسجيل الصوت يجب أن يعمل على Android WebView بدون مشكلة.

### 7.3 التوافق مع iOS Safari

| الميزة | الحالة |
|--------|--------|
| `MediaRecorder` | ❌ **غير مدعوم** في iOS Safari < 14.3 |
| `MediaRecorder` | ✅ مدعوم في iOS Safari 14.3+ |
| `audio/webm` | ❌ **غير مدعوم** — iOS Safari يدعم `audio/mp4` فقط |

**الوضع الحالي:** الكود يتعامل مع هذا بـ:
```typescript
setSupported(
  typeof window !== 'undefined' &&
  'MediaRecorder' in window &&
  !!navigator.mediaDevices?.getUserMedia
)
```
إذا لم يكن مدعوماً، الزر لا يظهر — **هذا السلوك صحيح**.

### 7.4 ملاحظة مهمة

iOS Native مؤجل في خطة المشروع → هذه المشكلة لا تؤثر على النطاق الحالي (Android فقط).

---

## 8. إعدادات TypeScript وLint وBuild

### 8.1 TypeScript strictMode

**مؤكد من `apps/web/tsconfig.json`:**
```json
"strict": true   // ← مفعّل — ممتاز
```
هذا يعني: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` كلها مفعّلة.

### 8.2 أخطاء TypeScript الحالية

غير قابل للتحقق بدون تشغيل `tsc --noEmit`. للتحقق:
```powershell
cd apps/web && pnpm type-check
```

### 8.3 ESLint

**من `apps/web/package.json`:** يستخدم `eslint-config-next` — الإعداد الافتراضي لـ Next.js.  
**ملف eslintrc:** لم يُعثر على `.eslintrc.json` — قد يكون في `eslint.config.mjs` أو مدمج في `package.json`.

### 8.4 Build Scripts المتاحة

```json
"dev":        "next dev"
"build":      "next build"
"start":      "next start"
"lint":       "next lint"
"type-check": "tsc --noEmit"
```

---

## 9. الاختبارات

### 9.1 الاختبارات الموجودة

**في المشروع (مؤكد):**

| الملف | النوع | ما يختبره |
|-------|-------|----------|
| `supabase/tests/content_admin_policies.sql` | SQL/RLS | سياسات المحتوى للمشرف |
| `supabase/tests/recordings_storage_policies.sql` | SQL/RLS | سياسات مساحة التخزين |
| `supabase/tests/rls_isolation_and_assignments.sql` | SQL/RLS | عزل البيانات بين الوالدين + المهام |

**لا توجد اختبارات Frontend/Unit/E2E.**

### 9.2 نسبة التغطية

- Frontend: **0%** — لا يوجد test framework
- Database RLS: **تغطية جيدة** — 3 ملفات SQL تغطي سيناريوهات العزل الحرجة

### 9.3 الاختبارات الناقصة الحرجة

| الاختبار | الأولوية | السبب |
|---------|---------|-------|
| Login → Dashboard (E2E) | عالية | المسار الأكثر استخداماً |
| Child PIN → Stories (E2E) | عالية | نقطة دخول الطفل |
| Story reading → progress saved | عالية | المنطق الأساسي |
| Parent cannot see other's data | متوسطة | موجود كـ SQL لكن لا E2E |

### 9.4 أدوات الاختبار المقترحة

**Playwright** — الخيار الأمثل:
- مجاني ومفتوح المصدر
- يدعم Next.js بشكل أصلي
- يمكن اختبار المصادقة
- لا تكلفة إضافية

---

## 10. حماية البيانات وRLS

### 10.1 جداول قاعدة البيانات (من migration files)

| الجدول | مصدر | سياسة RLS |
|--------|------|----------|
| `parent_profiles` | 001 | ✅ لكل مستخدم بياناته فقط |
| `child_profiles` | 001 | ✅ parent_id = auth.uid() |
| `story_reads` | 004 | ✅ child_id يتبع للوالد |
| `learning_progress` | 002 | ✅ عبر child_profiles |
| `child_badges` | 007 | ✅ عبر child_profiles |
| `story_recordings` | 014 | ✅ لكل مستخدم بياناته |
| `child_assignments` | 013 | ✅ parent يعيّن لأطفاله فقط |
| `stories` | 004/016 | ✅ قراءة عامة للـ is_active=true |

**Migration 016 مهمة:** حذفت `USING true` policies التي كانت تُظهر المحتوى غير النشط للجميع.

### 10.2 بيانات الأطفال — ما المحمي

**محمي (مؤكد):**
- `child_profiles`: parent_id = auth.uid() (مؤكد من migration 001)
- `story_reads`, `learning_progress`: عبر التحقق من الوالد
- `child_assignments`: الوالد يعيّن لأطفاله فقط
- PIN مُخزَّن كـ `pin_hash` (migration 008) — ليس نصاً صريحاً

**اختبار RLS موجود:** `supabase/tests/rls_isolation_and_assignments.sql` يثبت أن:
- الوالد A لا يرى أطفال الوالد B ✓
- الوالد A لا يكتب تقدماً لطفل B ✓

### 10.3 ملاحظة أمنية في auth/callback

```typescript
// apps/web/src/app/auth/callback/route.ts:13
return NextResponse.redirect(`${origin}${next}`)
```

`next` parameter يأتي من URL ولا يُتحقق منه — محتمل Open Redirect.  
**التأثير:** منخفض في البيئة الحالية (يعيد توجيه لنفس origin)، لكن يستحق الإصلاح.

---

## 11. ترتيب الإصلاحات المقترح

| # | المهمة | الملفات | الوقت | المخاطرة | يعتمد على |
|---|--------|---------|-------|----------|-----------|
| 1 | إصلاح N+1 في Dashboard | `(parent)/parent/dashboard/page.tsx` | 10 دق | منخفضة | — |
| 2 | التحقق من SITE_URL وإصلاحه | `apps/mobile/app/index.tsx` | 5 دق | منخفضة | — |
| 3 | إصلاح Open Redirect في callback | `apps/web/src/app/auth/callback/route.ts` | 15 دق | منخفضة | — |
| 4 | مراجعة `browser-import-sw.js` | `scripts/browser-import-sw.js` | 10 دق | — | — |
| 5 | إضافة Playwright + اختبار login E2E | ملف جديد | 2 ساعة | منخفضة | 1,2,3 |
| 6 | تشغيل `generate-story-audio.py` | قاعدة البيانات | 30 دق | منخفضة (idempotent) | SUPABASE_SERVICE_KEY |
| 7 | مراجعة ترخيص edge-tts | — | 1 ساعة | — | — |
| 8 | Uptime Robot لـ Supabase ping | إعداد خارجي | 10 دق | — | — |

---

## 12. خطة الاختبار الشاملة

### 12.1 قبل كل إصلاح (Smoke Test)

```
□ الموقع يعمل على https://[production-url]
□ تسجيل الدخول يعمل
□ قصة واحدة تفتح وتعمل
□ لوحة ولي الأمر تعرض البيانات
```

### 12.2 بعد كل إصلاح (Regression Test)

```
□ تسجيل الدخول — الدخول والخروج
□ إنشاء حساب جديد
□ إضافة طفل
□ فتح قصة والتنقل بين صفحاتها
□ لوحة ولي الأمر تعرض الأطفال
□ نظام النقاط يظهر
```

### 12.3 اختبار يدوي لكل سيناريو حرج

| السيناريو | الخطوات | النتيجة المتوقعة |
|-----------|---------|----------------|
| تسجيل دخول بـ magic link | أدخل email → افتح الرابط | redirect لـ /parent |
| PIN الطفل | اختر طفلاً → أدخل PIN → تأكيد | دخول لشاشة الطفل |
| قراءة قصة كاملة | افتح قصة → اقرأ كل الصفحات → أنهِ | +نقاط + badge |
| عزل البيانات | سجّل دخول بحساب آخر | لا يرى أطفال الحساب الأول |

---

## 13. مخاطر التنفيذ

| المخاطرة | الاحتمالية | التأثير | الحل الاحتياطي |
|---------|-----------|---------|---------------|
| Vercel cold start يبطئ الاستعلامات | عالية | متوسط | Uptime Robot ping (مجاني) |
| iOS Safari لا يدعم MediaRecorder | مؤكد | منخفض | الكود يخفي الزر تلقائياً ✓ |
| edge-tts ترخيص تجاري | محتمل | عالٍ | مراجعة قبل الإطلاق التجاري |
| Supabase free tier 2 projects limit | محتمل | متوسط | المشروع يستخدم project واحد ✓ |
| Promise.all يفشل إذا فشل استعلام | منخفضة | متوسط | إضافة try/catch |

---

## 14. الخلاصة وطلب الموافقة

### ملخص ما وجدناه

| المحور | الوضع |
|--------|-------|
| Git | ✅ نظيف، متزامن مع origin |
| Auth callback | ✅ ملف واحد، يعمل بشكل صحيح |
| N+1 Query | ⚠️ مؤكد — يحتاج إصلاح |
| SITE_URL | ❓ يحتاج تحقق |
| تسجيل الصوت | ✅ يعمل على Android، لا يظهر على iOS |
| TypeScript strict | ✅ مفعّل |
| اختبارات Frontend | ❌ لا يوجد |
| اختبارات RLS | ✅ موجودة وشاملة |
| حماية بيانات الأطفال | ✅ جيدة مع ملاحظة callback |

### أول 3 إصلاحات مقترحة للبدء فور الموافقة

1. **N+1 → Promise.all** (10 دقائق، لا مخاطر، تأثير فوري على الأداء)
2. **التحقق من SITE_URL** (5 دقائق، تأكيد + تعديل إذا لزم)
3. **إصلاح Open Redirect في callback** (15 دقائق، تحسين أمني)

### ما لن نلمسه في هذه المرحلة

- أي تصميم جديد
- قاعدة البيانات (migrations)
- إعدادات الإنتاج والـ environment variables
- الميزات الجديدة (Phase 1+)
- نظام iOS Native

---

**في انتظار موافقتك على بدء الإصلاحات.**
