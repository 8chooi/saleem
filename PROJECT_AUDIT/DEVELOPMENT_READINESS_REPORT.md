# تقرير جاهزية التطوير — سَلِيم | DEVELOPMENT READINESS REPORT
**تاريخ:** 2026-11-26  
**الإصدار:** 1.0  
**المصدر:** فحص الكود الفعلي + ملفات التدقيق السابقة  

> ⚠️ هذا التقرير قرائي بالكامل — لا تعديلات، لا حذف، لا نشر.  
> التصنيفات: **مؤكد** = رأيناه في الكود | **محتمل** = مستنتج منطقياً | **غير قابل للتحقق** = يتطلب تشغيل فعلي.

---

## ملخص تنفيذي

مشروع سَلِيم في حالة MVP مستقر (~55% اكتمال) مبني على معمارية صلبة (Next.js 14 App Router + Supabase + TypeScript strict). يمكن البدء في التطوير التدريجي **فوراً** مع مراعاة 3 blockers حرجة يجب حلها أولاً قبل أي إطلاق تجاري. أكبر مخاطر التطوير هي الـ N+1 query في لوحة الوالد، والـ callback المكرّر في المصادقة، وغياب الاختبارات الآلية. البنية الحالية تدعم الإضافة المتدرجة دون إعادة بناء إذا التُزم بأنماط الكود الموجودة.

---

## 1. المكونات الآمنة للتطوير الفوري

### 1.1 مكونات يمكن تطويرها دون أي مخاطر

| المكوّن | المسار | سبب الأمان |
|--------|--------|-----------|
| الألعاب التعليمية | `apps/web/src/app/(child)/worlds/` | مستقلة تماماً، تحفظ بـ `lib/games/save.ts` المعزول |
| لوحة الرسم | `apps/web/src/app/(child)/draw/` | Client-only، لا تعتمد على DB |
| صفحات القصص (العرض) | `apps/web/src/app/(child)/stories/[slug]/` | Server Component يقرأ فقط، لا يكتب |
| مكتبة القصص (العرض) | `apps/web/src/app/(child)/library/` | قراءة فقط من `open_library` |
| صفحة الشارات | `apps/web/src/app/(child)/badges/` | قراءة فقط |
| مكونات UI مشتركة | `apps/web/src/components/` | لا تعتمد على state عام |
| `lib/stories/pages.ts` | `apps/web/src/lib/stories/pages.ts` | دوال pure بلا side effects |
| `lib/games/save.ts` | `apps/web/src/lib/games/save.ts` | معزول، واضح، قابل للاختبار |
| Supabase migrations (جديدة) | `supabase/migrations/` | إضافية، لا تعدّل الموجود |
| `packages/design-tokens/` | `packages/design-tokens/` | CSS variables، لا تأثير على المنطق |

### 1.2 مكونات تحتاج احتياطات بسيطة

| المكوّن | المسار | الاحتياط المطلوب |
|--------|--------|-----------------|
| لوحة الوالد | `apps/web/src/app/(parent)/` | اختبر بعائلة بـ 3+ أطفال (N+1 issue KI-003) |
| StoryReader | `apps/web/src/app/(child)/stories/[slug]/StoryReader.tsx` | تحقق من audioRef cleanup لو عدّلت الأوتوماتيك |
| LibraryReader | `apps/web/src/app/(child)/library/[slug]/LibraryReader.tsx` | `cleanPageText` حساس — اختبر بمحتوى StoryWeaver |
| لوحة الإدارة | `apps/web/src/app/admin/` | type casting بـ `unknown` (KI-008) — غير آمن من TypeScript |
| Middleware | `apps/web/src/middleware.ts` | أي مسار جديد يجب إضافته لـ `protectedPaths` يدوياً |
| `lib/supabase/server.ts` | `apps/web/src/lib/supabase/server.ts` | لا تغيّر طريقة إنشاء الـ client — مرتبط بـ Supabase SSR cookies |

---

## 2. المكونات التي يجب إصلاحها أولاً (Blockers)

### 2.1 Blocker حرج — يمنع أو يكسر وظائف أساسية

#### B-001: ملف `/auth/callback` مكرّر [مؤكد]
**الملفات:**
- `apps/web/src/app/(auth)/auth/callback/route.ts` — يستخدم `createServerClient` مباشرة
- `apps/web/src/app/auth/callback/route.ts` — يستخدم `createClient()` من lib

**التحليل الفعلي:**
- كلاهما يتعامل مع `GET ?code=...` ويستدعي `exchangeCodeForSession`
- Next.js App Router سيستجيب لأحدهما بناءً على أسبقية مسار الـ route group
- الـ `(auth)` group له layout خاص (`(auth)/layout.tsx`) — قد يُحدث تعارضاً إضافياً
- **الأثر المؤكد:** تسجيل الدخول بعد تأكيد البريد قد يوجّه للملف الخاطئ

**الحل:** تحديد أيهما Supabase يُرسل إليه (Dashboard → Auth → URL Configuration)، ثم حذف الآخر. الأرجح أن `(auth)/auth/callback/route.ts` هو الصحيح لأنه أحدث وأكثر توافقاً مع `@supabase/ssr`.

#### B-002: SITE_URL خاطئ في تطبيق الموبايل [مؤكد]
**الملف:** `apps/mobile/app/index.tsx` السطر 17
```tsx
const SITE_URL = 'https://saleem.8ch.app'
```
**الأثر:** التطبيق يعرض شاشة بيضاء أو loading لا نهاية له — لا يعمل أي نشر للتطبيق بهذا الكود.

---

### 2.2 Blocker متوسط — يؤثر على التجربة بشكل واضح

#### B-003: N+1 Query في لوحة الوالد [مؤكد]
**الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx` السطر 30-52

الكود الفعلي:
```tsx
for (const child of children || []) {
  const [points, lessons, stories, badges] = await Promise.all([...4 queries])
}
```
**الحساب:** عائلة بـ 4 أطفال = 1 (children) + 4×4 (loop) = **17 استعلاماً** في كل تحميل.
**الأثر:** بطء 2-4 ثوانٍ لكل تحميل. يزداد مع كل طفل إضافي.

#### B-004: type casting بـ `unknown` في admin [مؤكد]
**الملف:** `apps/web/src/app/admin/page.tsx` السطر 43-44
```tsx
const subject = l.subject as unknown as { name_ar: string; emoji: string } | null
```
**الأثر:** TypeScript لا يوقف البرنامج لو تغيّر schema قاعدة البيانات.

#### B-005: MediaRecorder على iOS Safari غير مدعوم لـ webm [محتمل]
**الملف:** `apps/web/src/components/stories/ReadAloudRecorder.tsx`
**الأثر المحتمل:** تسجيل صوت الطفل لا يعمل على iPhone — يحتاج fallback لـ `audio/mp4`.

---

### 2.3 Debt تقني — يؤثر على التطوير المستقبلي

| الكود | الديون | الملف |
|-------|--------|-------|
| D-001 | لا اختبارات آلية — أي تغيير قد يكسر منطق النقاط | كل الكود |
| D-002 | لا error boundaries على مستوى المكونات | `StoryReader`, `LibraryReader` |
| D-003 | Inline styles متكررة بدلاً من Tailwind classes | صفحات متعددة |
| D-004 | لا caching layer — كل طلب يذهب لـ Supabase مباشرة | middleware، pages |
| D-005 | Supabase يتوقف بعد 7 أيام خمول (Free tier) | يحتاج ping دوري |
| D-006 | `protectedPaths` في middleware يجب تحديثه يدوياً | `lib/supabase/middleware.ts` |

---

## 3. خريطة الاعتماديات (Dependency Map)

### 3.1 نظام المصادقة والجلسات

```
auth.users (Supabase Auth)
    ↓ trigger: handle_new_user
parent_profiles (id = auth.users.id)
    ↓
child_profiles (parent_id → auth.users.id)
    ↓
[كل جداول النشاط]
```

**الاعتماديات:**
- `apps/web/src/middleware.ts` ← `lib/supabase/middleware.ts` → `updateSession()`
- `lib/supabase/server.ts` ← كل Server Components
- `lib/supabase/client.ts` ← كل Client Components
- `(auth)/auth/callback/route.ts` و `auth/callback/route.ts` ← **تعارض قائم**

**تأثير التغيير:** أي تعديل في `lib/supabase/server.ts` أو `middleware.ts` يؤثر على **كل** صفحات التطبيق.

---

### 3.2 نظام القصص والمحتوى

```
stories (DB table)
    ├── pages JSONB → StoryPage[] (lib/stories/pages.ts)
    ├── quiz JSONB → QuizItem[]
    └── is_active, level, age_group, sort_order

StoryReader (Client Component)
    ├── يقرأ: pages[]، page.audio (optional MP3)
    ├── يكتب: story_reads (قراءة)، story_comprehension (quiz)
    └── يستدعي: increment_child_points RPC

الاعتماديات الخارجية:
    ├── framer-motion (animations)
    ├── Web Speech API (TTS fallback)
    └── HTMLAudioElement (page.audio MP3)
```

**تأثير التغيير:** تعديل `StoryPage` interface يؤثر على:
- `lib/stories/pages.ts` (type definition)
- `StoryReader.tsx` (uses page.audio)
- `scripts/generate-story-audio.py` (writes page.audio)
- جميع seed files `supabase/seed/009_stories_v2.sql` إلخ

---

### 3.3 نظام الملفات الشخصية

```
child_profiles (id, parent_id, name, birth_year, pin_hash)
    ↓ verify_child_pin RPC (migration 021)
child_points (child_id, total_points)
    ↓ increment_child_points RPC (migration 003)
child_badges (child_id, badge_id)
learning_progress (child_id, lesson_id, status, score)
story_reads (child_id, story_id)
game_sessions (child_id, game_type, score)
story_recordings (user_id, child_id, story_id, storage_path)
child_assignments (parent_id, child_id, story_id/lesson_id)
```

**قاعدة:** RLS تضمن أن الوالد لا يرى إلا أطفاله — مؤكد من migration 001.

---

### 3.4 نظام الوالدين والتتبع

```
parent/dashboard/page.tsx
    ← child_profiles (1 query)
    ← child_points, learning_progress, story_reads, child_badges (4 × N queries) [B-003]

parent/children/[id]/progress/page.tsx
    ← [غير محقق — يحتاج قراءة الملف]

child_assignments
    ← parent يُسند → child يُكمل
```

---

### 3.5 قاعدة البيانات والـ APIs

**لا توجد API routes منفصلة** — كل التواصل عبر Supabase JS SDK مباشرة.

الـ RPCs الموجودة (مؤكدة):
| RPC | الملف | الغرض |
|-----|-------|-------|
| `increment_child_points` | migration 003 | زيادة نقاط الطفل آمنياً |
| `is_admin` | migration 015 | التحقق من صلاحية الإدارة |
| `verify_child_pin` | migration 021 | التحقق من PIN الطفل |
| `import_sw_pages` | migration 020 | استيراد صفحات StoryWeaver |

---

## 4. مصفوفة المخاطر لكل تغيير محتمل

| التغيير | المخاطرة | التأثير | الاحتياط |
|--------|---------|---------|---------|
| حذف `/auth/callback` المكرّر | 🔴 عالية | قد يكسر تسجيل الدخول | تحقق من Supabase Dashboard أي URL مُعرَّف |
| تحديث SITE_URL في Mobile | 🟢 منخفضة | لا يوجد | تأكد URL يعمل فعلاً |
| إصلاح N+1 في dashboard | 🟡 متوسطة | قد يغيّر ترتيب البيانات | اختبر بـ 0 و1 و4 أطفال |
| إضافة migration جديد | 🟡 متوسطة | لا رجعة بدون snapshot | خذ نسخ احتياطية قبل كل migration |
| تعديل `StoryPage` interface | 🟠 عالية | يكسر كل السيد القديم | تعامل مع `audio?` كـ optional دائماً |
| تغيير middleware protected paths | 🟠 عالية | قد يكشف مسارات للعامة | اختبر كل مسار بعد التغيير |
| تعديل `lib/supabase/server.ts` | 🔴 عالية | يؤثر على كل الصفحات | لا تعدّله إلا لأسباب قوية |
| إضافة Supabase Edge Function | 🟡 متوسطة | تحتاج deploy منفصل | اختبر في Supabase Studio أولاً |
| الترقية من Next.js 14 → 15 | 🔴 عالية | (branch موجود غير مختبر) | لا تدمج حتى تُختبر بالكامل |
| تغيير RLS policies | 🔴 حرجة | قد يكشف بيانات مستخدمين | اختبر بـ `EXPLAIN` و `SET role = authenticated` |

---

## 5. خطة التنفيذ التدريجية

> الميزانية: 0 EGP / 0 USD — كل الخدمات مجانية.

### Sprint 1 (الأسبوع 1-2): الإصلاحات الحرجة

| المهمة | الملف | المخاطرة | الوقت |
|--------|-------|---------|-------|
| تحديد وحذف `/auth/callback` المكرّر (B-001) | `(auth)/auth/callback/route.ts` و `auth/callback/route.ts` | عالية | 2 ساعة |
| تحديث SITE_URL في Mobile (B-002) | `apps/mobile/app/index.tsx` | منخفضة | 10 دقائق |
| إصلاح N+1 في dashboard (B-003) | `parent/dashboard/page.tsx` | متوسطة | 3 ساعات |
| تشغيل generate-story-audio.py | `scripts/generate-story-audio.py` | منخفضة | ساعة (بعد إضافة SUPABASE_SERVICE_KEY) |
| مراجعة وإصلاح/إخفاء قصة "الثعلب الذكي" | Supabase Dashboard | منخفضة | 30 دقيقة |

**معيار الانتهاء:** تسجيل الدخول يعمل، dashboard يحمّل بأقل من ثانية، التطبيق يعرض الموقع الصحيح.

---

### Sprint 2 (الأسبوع 2-4): الأمان والأداء

| المهمة | الملف | الوقت |
|--------|-------|-------|
| تفعيل hCaptcha على Supabase | Supabase Dashboard | 15 دقيقة |
| إضافة Security Headers | `vercel.json` | 30 دقيقة |
| إضافة Supabase ping (Uptime Robot) | خارج الكود | 15 دقيقة |
| توليد TypeScript types من Supabase | CLI: `supabase gen types typescript` | ساعة |
| إصلاح type casting في admin (B-004) | `apps/web/src/app/admin/page.tsx` | ساعة |
| إضافة MediaRecorder fallback لـ iOS (B-005) | `ReadAloudRecorder.tsx` | 2 ساعة |

---

### Sprint 3 (الأسبوع 4-6): تحسين تجربة المستخدم

| المهمة | الوقت التقديري |
|--------|--------------|
| رسومات حقيقية (AI-generated) لـ 20 قصة | 3 أيام |
| شخصية كارتونية رئيسية (Mascot) على dashboard الطفل | يوم واحد |
| تقارير بيانية للوالدين (chart.js مجاني) | 2 يوم |
| إشعارات بريد إلكتروني أسبوعية (Resend free tier) | يوم واحد |
| اختبار كامل على هاتف Android حقيقي | يوم واحد |

---

### Sprint 4+ (الربع الأول): الميزات المتقدمة

- لوحة المعلمين والمدارس (Phase 7)
- دفع إلكتروني (يتطلب الانتقال من Vercel Hobby)
- إشعارات Push
- تطبيق iOS من Expo EAS

---

## 6. بروتوكول الاختبار لكل ميزة

### 6.1 Pre-development Checklist
- [ ] هل هذه الميزة في خطة المرحلة الحالية؟ (لا تبدأ ميزة Phase 7 في Phase 0)
- [ ] هل الجداول والـ RLS المطلوبة موجودة؟
- [ ] هل ستلمس مسارات محمية؟ تحقق من `middleware.ts`
- [ ] خذ نسخة احتياطية من Supabase قبل أي migration
- [ ] ضع branch منفصل لكل feature

### 6.2 Development Checklist
- [ ] كل استعلام Supabase مقيّد بـ `.eq('user_id', user.id)` أو مشمول بـ RLS
- [ ] أي بيانات طفل تتطلب التحقق من `parent_id`
- [ ] المسارات الجديدة مضافة لـ `protectedPaths` في middleware
- [ ] لا مفاتيح سرية في كود الواجهة
- [ ] TypeScript strict — لا `as unknown as`
- [ ] كل زر يؤدي عملاً فعلياً (لا placeholder UI)

### 6.3 Pre-deploy Checklist
- [ ] `npm run type-check` بدون أخطاء
- [ ] `npm run lint` بدون أخطاء
- [ ] اختبر: تسجيل دخول، إضافة طفل، قراءة قصة، لعبة، لوحة والد
- [ ] اختبر على موبايل (Chrome Android على الأقل)
- [ ] تحقق من Vercel preview deployment قبل merge

### 6.4 Post-deploy Monitoring
- [ ] تحقق من Vercel logs لأي خطأ 500
- [ ] تحقق من Supabase logs لأي failed RLS policy
- [ ] تحقق من لوحة والد بـ 1 طفل وبـ 4 أطفال
- [ ] تحقق من صفحة الإدمن: `is_admin()` تعمل

---

## 7. حماية بيانات الأطفال والخصوصية

### 7.1 الوضع الحالي [مؤكد من الكود]

| البيانات | مكان التخزين | الحماية |
|---------|-------------|--------|
| اسم الطفل | `child_profiles.name` | RLS — يرى الوالد فقط |
| سنة الميلاد | `child_profiles.birth_year` | RLS |
| PIN الطفل | `child_profiles.pin_hash` | pgcrypto hash — لا يُخزَّن نص صريح |
| تسجيلات صوت الطفل | Supabase Storage, private bucket | مقيّد بـ `user.id` في المسار |
| نشاط التعلم | `learning_progress, story_reads, game_sessions` | RLS |

**ما هو غائب [محتمل]:** لا توجد سياسة حذف تلقائي لتسجيلات الصوت، ولا نموذج موافقة صريحة على جمع بيانات الأطفال.

### 7.2 متطلبات COPPA/GDPR-K

| المتطلب | الحالة | الملاحظة |
|--------|-------|---------|
| موافقة الوالد على إنشاء حساب الطفل | ✅ جزئياً | الوالد يُنشئ حساب الطفل بنفسه — ضمني |
| حق الحذف (Right to Erasure) | ❌ غائب | لا يوجد زر "حذف بيانات الطفل" |
| حد عمر الطفل | ✅ مؤكد | `birth_year` CHECK constraint في DB |
| عدم مشاركة بيانات الطفل مع أطراف ثالثة | ✅ مؤكد | لا APIs خارجية تستلم بيانات الطفل |
| سياسة خصوصية خاصة بالأطفال | غير قابل للتحقق | صفحة `/privacy` موجودة، محتواها غير مقروء هنا |
| TTL لتسجيلات الصوت | ❌ غائب | 1 جيجا حد مجاني سيمتلئ بالوقت |

### 7.3 الموافقة الأبوية — ما هو مُنفَّذ وما هو ناقص

**مُنفَّذ [مؤكد]:**
- الوالد يُنشئ حسابه بالبريد الإلكتروني + تأكيد
- الوالد يُنشئ ملف الطفل (يتحكم في وصوله)
- PIN اختياري (الوالد يضعه ويتحكم فيه)

**ناقص [محتمل]:**
- لا checkbox صريح عند التسجيل: "أوافق على جمع بيانات طفلي"
- لا نموذج "حذف حساب الطفل وكل بياناته"
- لا إشعار للوالد عند رفع تسجيل صوتي جديد
- لا تحديد صريح لمدة الاحتفاظ بالتسجيلات

### 7.4 توصيات فورية

1. أضف storage TTL policy على Supabase: `story-recordings` → حذف تلقائي بعد 90 يوماً
2. أضف زر "حذف ملف الطفل" في `parent/children/[id]/` يحذف `child_profiles` (CASCADE سيحذف كل البيانات)
3. أضف checkbox موافقة صريحة في نموذج التسجيل
4. أضف بند "بيانات الأطفال" في صفحة `/privacy`

---

## 8. تراخيص المحتوى والاستخدام التجاري

### 8.1 القصص الأصلية (20 قصة)

**المصدر [مؤكد من seeds]:** القصص في `supabase/seed/009_stories_v2.sql` و `014_stories_v3.sql` — مكتوبة أصلياً للمشروع.
**التقييم:** مؤكد أنها ملك المشروع، لا قيود تراخيص على الاستخدام التجاري.

### 8.2 المكتبة المفتوحة (532 قصة StoryWeaver)

**المصدر [مؤكد من migration 010]:** قصص StoryWeaver.
**الرخصة:** Creative Commons — مفتوحة للاستخدام التعليمي وغير التجاري في الغالب.

> ⚠️ **تحذير قانوني مهم [محتمل]:** بعض رخص CC تحظر الاستخدام التجاري (CC BY-NC). قبل أي اشتراك مدفوع يشمل محتوى المكتبة، يجب مراجعة رخصة كل قصة على موقع StoryWeaver. الحل الآمن: فصل محتوى المكتبة عن الباقة المدفوعة، أو الحصول على إذن صريح.

### 8.3 الأصوات والموسيقى

| المصدر | الرخصة | الاستخدام التجاري |
|--------|-------|-----------------|
| edge-tts (ar-EG-SalmaNeural) | Microsoft — مجاني للاستخدام الشخصي | ⚠️ غير قابل للتحقق — مشروط بـ Terms of Use |
| Web Speech API (TTS) | متصفح المستخدم | لا تُخزَّن، لا مشكلة |
| Web Audio API (oscillators) | متاح تجاريًا | ✅ لا قيود |

> ⚠️ **تحذير:** `edge-tts` يستخدم Microsoft Edge API بشكل غير رسمي. للاستخدام التجاري الكبير، يُنصح بـ Azure TTS (مدفوع) أو تسجيل صوت بشري حقيقي.

### 8.4 المكتبات المستخدمة ورخصها (من `apps/web/package.json`)

| المكتبة | الرخصة | الاستخدام التجاري |
|--------|-------|-----------------|
| Next.js | MIT | ✅ |
| React | MIT | ✅ |
| Tailwind CSS | MIT | ✅ |
| framer-motion | MIT | ✅ |
| @supabase/ssr | Apache 2.0 | ✅ |
| lucide-react | ISC | ✅ |
| TypeScript | Apache 2.0 | ✅ |
| Expo (mobile) | MIT | ✅ |

**التقييم:** كل المكتبات مرخصة للاستخدام التجاري. ✅

### 8.5 المخاطر القانونية الملخصة

| الخطر | الخطورة | الإجراء |
|------|---------|--------|
| رخص CC للمكتبة عند الاشتراك المدفوع | 🔴 عالية | راجع رخصة كل قصة قبل الإطلاق التجاري |
| edge-tts في استخدام تجاري كبير | 🟡 متوسطة | انتقل لـ Azure TTS أو صوت بشري |
| Vercel Hobby في الاستخدام التجاري | 🔴 عالية | (مذكور في التقرير الرئيسي — انتقل لـ Cloudflare Pages) |

---

## 9. متطلبات iOS وتحويل التطبيق

### 9.1 الوضع الحالي لتطبيق Android WebView [مؤكد من الكود]

**الملف:** `apps/mobile/app/index.tsx`

ما هو مُنفَّذ:
- `react-native-webview` v13.8.6 يُغلّف الموقع كاملاً
- معالجة زر Back لـ Android
- كشف حالة الشبكة (`NetInfo`)
- شاشة loading + شاشة offline
- `applicationNameForUserAgent="SaleemApp/1.0"` للامتثال لـ Google Play
- `geolocationEnabled={false}` — لا تتبع موقع

ما هو ناقص:
- `SITE_URL` خاطئ (B-002)
- لا deep linking
- لا push notifications
- لا offline caching للمحتوى

### 9.2 ما يلزم لنشر iOS App Store

**المتطلبات الإلزامية:**

1. **Apple Developer Account** — 99 USD/سنة ⚠️ (تكلفة حقيقية — يخالف سياسة الميزانية الصفرية)
2. **Expo EAS Build** — الإصدار المجاني محدود (45 builds/شهر)
3. **App Store Review** — مراجعة بشرية، قد تستغرق 1-7 أيام
4. **شهادة Privacy Nutrition Label** — يجب إعلان كل البيانات المُجمَّعة
5. **ATS (App Transport Security)** — HTTPS إلزامي (Vercel يوفره ✅)
6. **Age Rating** — يجب تحديد 4+ مع تفاصيل المحتوى التعليمي
7. **COPPA Compliance** — Apple تطلب سياسة خصوصية صريحة للأطفال

**ملف `apps/mobile/package.json` يحتوي `build:ios` مفقود:**
```json
// الموجود:
"build:android": "eas build --platform android"
// الناقص:
"build:ios": "eas build --platform ios"
```

### 9.3 الفجوات التقنية بين Android WebView و iOS

| المشكلة | التأثير على iOS | الحل |
|--------|--------------|-----|
| `mediaPlaybackRequiresUserAction={false}` | iOS Safari يتجاهله أحياناً | اختبر التشغيل التلقائي للصوت |
| `MediaRecorder` بـ `webm` | iOS Safari لا يدعم webm | أضف `audio/mp4` fallback في `ReadAloudRecorder.tsx` |
| RTL layout | iOS WebView يدعم RTL | يجب اختباره فعلياً |
| `domStorageEnabled` | مدعوم | ✅ |
| PWA installable على iOS | محدود — Safari لا يدعم Web Push | يؤثر على إشعارات مستقبلية |

### 9.4 خطة الانتقال التدريجية

```
المرحلة الحالية: Android WebView (يعمل لكن SITE_URL خاطئ)
    ↓
الخطوة 1: إصلاح SITE_URL → اختبار على Android حقيقي
    ↓
الخطوة 2: إضافة MediaRecorder fallback + اختبار على iOS Safari (browser)
    ↓
الخطوة 3: `eas build --platform ios` → اختبار على TestFlight
    ↓
الخطوة 4: تجهيز App Store metadata + Privacy Policy + Age Rating
    ↓
الخطوة 5: نشر iOS App Store (يتطلب Apple Developer Account - 99 USD)
```

**توصية الميزانية الصفرية:** اختبر على iOS Safari عبر المتصفح المباشر بدلاً من تطبيق متجر، وأجّل iOS App Store حتى يصبح هناك إيرادات تغطي Apple Developer Account.

---

## 10. المعمارية المستقبلية المقترحة

### 10.1 المشكلات المعمارية الحالية

| المشكلة | الأثر | الخطورة |
|--------|-------|--------|
| لا caching layer | كل طلب يصل Supabase → Cold starts طويلة | 🟡 متوسطة |
| لا API layer منفصل | Business logic مبعثرة في الصفحات | 🟡 متوسطة |
| Supabase Free يتوقف بعد خمول | UX سيء لأول مستخدم بعد فترة صمت | 🟡 متوسطة |
| Vercel Hobby لا يسمح تجارياً | يمنع الإطلاق التجاري | 🔴 عالية |
| Mobile = WebView فقط | لا Native features (Push, Camera, etc.) | 🟡 متوسطة |
| لا CI/CD tests | Regressions ممكنة | 🟡 متوسطة |

### 10.2 المعمارية المقترحة (ميزانية صفرية)

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 0: CDN CACHE                        │
│         Cloudflare Pages (Free) ← بديل Vercel Hobby         │
│         Edge caching للصفحات الثابتة                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 LAYER 1: NEXT.JS APP                         │
│   Server Components (data fetching) ← الموجود حالياً        │
│   + API Routes (/api/*) للـ mutations والـ webhooks (جديد)   │
│   + Server Actions للـ forms (جديد - Next.js 14 feature)     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│               LAYER 2: SUPABASE                              │
│   PostgreSQL + RLS ← الموجود                                 │
│   + Edge Functions للـ background jobs (جديد - مجاني)        │
│   + Realtime للإشعارات الفورية (مجاني - مدعوم)              │
└─────────────────────────────────────────────────────────────┘
```

**الإضافات المقترحة بميزانية صفر:**
- **Cloudflare Pages** بدلاً من Vercel Hobby (أسرع، مجاني، تجاري)
- **Supabase Edge Functions** للبريد الأسبوعي وحساب التقارير
- **Supabase Realtime** لإشعارات "أكمل طفلك درساً جديداً"
- **Resend Free Tier** (3000 بريد/شهر) للإشعارات الأسبوعية

### 10.3 مسار الانتقال

```
الآن (Vercel Hobby):
    الموقع يعمل، غير تجاري

عند 50+ مستخدم:
    انتقل لـ Cloudflare Pages (branch: cloudflare-migration موجود، Next.js 15، غير مختبر)
    أضف Supabase Edge Functions للبريد الإلكتروني

عند 500+ مستخدم:
    فكر في Supabase Pro ($25/شهر) لـ:
    - قاعدة بيانات أكبر
    - عدم الإيقاف التلقائي
    - daily backups تلقائية
```

### 10.4 نقاط التوسع المستقبلية (Plugin Points)

| نقطة التوسع | الموقع الحالي | كيف تضيف إليها |
|------------|-------------|--------------|
| أنواع محتوى جديدة | `lib/stories/pages.ts` | أضف field اختياري لـ `StoryPage` |
| ألعاب جديدة | `app/(child)/worlds/` | أضف مجلد لعبة جديدة |
| مستويات تعليمية | `subjects` و `lessons` في DB | أضف rows في DB فقط |
| أنواع شارات جديدة | `badges` table | أضف rows + trigger في Edge Function |
| لوحة معلمين | `app/teacher/` (غير موجود) | route group مستقل لا يلمس الموجود |
| دفع إلكتروني | لا يوجد حالياً | يتطلب Stripe Webhooks → API route جديد |
| تحليلات متقدمة | `parent/children/[id]/progress/` | Server Component جديد يقرأ الجداول الموجودة |

---

## 11. أول 10 مهام تنفيذية بالترتيب

| # | المهمة | الملفات المرتبطة | معيار القبول | الوقت التقديري | الأولوية |
|---|--------|----------------|-------------|--------------|---------|
| 1 | تحديد وحذف `/auth/callback` المكرّر | `(auth)/auth/callback/route.ts` و `auth/callback/route.ts` | تسجيل الدخول يعمل بعد تأكيد البريد | 2 ساعة | 🔴 حرج |
| 2 | تحديث SITE_URL في Mobile | `apps/mobile/app/index.tsx` السطر 17 | التطبيق يفتح الموقع الصحيح | 10 دقائق | 🔴 حرج |
| 3 | إصلاح N+1 في dashboard | `parent/dashboard/page.tsx` السطر 30-52 | التحميل < 500ms لـ 4 أطفال | 3 ساعات | 🟠 عالية |
| 4 | تشغيل generate-story-audio.py | `scripts/generate-story-audio.py` + Supabase Service Key | كل الصفحات لها صوت MP3 | ساعة | 🟠 عالية |
| 5 | إضافة Security Headers | `vercel.json` (جديد أو موجود) | X-Frame-Options, nosniff, Referrer | 30 دقيقة | 🟡 متوسطة |
| 6 | إضافة Supabase ping | Uptime Robot (خارج الكود) أو Supabase Edge Function | Supabase لا يتوقف بسبب الخمول | 15 دقيقة | 🟡 متوسطة |
| 7 | تفعيل hCaptcha | Supabase Dashboard → Auth → Protection | نموذج التسجيل يطلب CAPTCHA | 15 دقيقة | 🟡 متوسطة |
| 8 | إصلاح MediaRecorder iOS fallback | `components/stories/ReadAloudRecorder.tsx` | التسجيل يعمل على iOS Safari | 2 ساعة | 🟡 متوسطة |
| 9 | توليد Types تلقائياً من Supabase | CLI + `apps/web/src/types/supabase.ts` (جديد) | لا `as unknown as` في الكود | ساعة | 🟡 متوسطة |
| 10 | مراجعة قصة "الثعلب الذكي" وقرار إخفاء/تعديل | Supabase Dashboard → stories table | القصة محجوبة أو محتواها مناسب | 30 دقيقة | 🟠 عالية |

---

## ملحق: مخطط اتخاذ القرار قبل أي تغيير

```
هل التغيير يمس middleware أو auth؟
    نعم → اختبر تسجيل الدخول والخروج بعد كل تعديل
    لا ↓

هل يمس Supabase migrations؟
    نعم → خذ نسخة احتياطية أولاً + راجع RLS policies
    لا ↓

هل يمس StoryPage type أو pages JSONB؟
    نعم → تحقق من audio? كـ optional + اختبر pagesFromContent()
    لا ↓

هل يمس مكونات Client ('use client')?
    نعم → اختبر على mobile browser + تحقق من RTL
    لا ↓

تقدّم بحرية مع اختبار يدوي بسيط
```

---

*التقرير مبني على: فحص مباشر للكود في `apps/web/`, `apps/mobile/`, `supabase/migrations/`, وملفات التدقيق السابقة في `PROJECT_AUDIT/`. التصنيف مذكور بوضوح: مؤكد / محتمل / غير قابل للتحقق.*
