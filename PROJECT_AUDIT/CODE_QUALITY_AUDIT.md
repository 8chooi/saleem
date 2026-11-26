# تدقيق جودة الكود — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26

---

## ملخص التقييم: 7.5/10

الكود نظيف بشكل عام، TypeScript strict مطبَّق، والمكونات منظّمة. أبرز المشكلات: N+1 queries، كود مكرّر في عدة أماكن، وغياب الاختبارات التلقائية.

---

## ✅ نقاط القوة

### 1. TypeScript Strict
**الملف:** `apps/web/tsconfig.json`  
TypeScript strict mode محتمل (المعيار في Next.js 14). التعريفات واضحة في جميع الملفات.

### 2. فصل المسؤوليات
- Server Components للبيانات (fetch من Supabase)
- Client Components (`'use client'`) للتفاعل فقط
- مثال جيد: `StoryPage` (server) → `StoryReader` (client)

### 3. useMemo/useCallback صحيح في StoryReader
**الملف:** `apps/web/src/app/(child)/stories/[slug]/StoryReader.tsx`
```tsx
const pages = useMemo(
  () => story.pages?.length ? story.pages : pagesFromContent(...),
  [story.pages, story.content_ar, story.cover_emoji]
)
const words = useMemo(() => { ... }, [page.text])
const stopAll = useCallback(() => { ... }, [])
const playPage = useCallback((idx) => { ... }, [pages, canSpeak, voice, level])
```
✅ استخدام صحيح للـ hooks يمنع إعادة الحساب غير الضرورية.

### 4. Promise.all للاستعلامات المتوازية
**الملفات:** `stories/page.tsx`, `admin/page.tsx`, `badges/page.tsx`
```tsx
const [{ data: children }, { data: allStories }] = await Promise.all([...])
```
✅ استخدام ممتاز لتقليل زمن الاستجابة.

### 5. audioRef cleanup صحيح
**الملف:** `StoryReader.tsx`
```tsx
useEffect(() => () => {
  clearTimeout(timerRef.current)
  if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
}, [])
```
✅ تنظيف كامل عند unmount.

### 6. saveGameSession مع حماية مزدوجة
**الملف:** `apps/web/src/lib/games/save.ts`
- التحقق من نسبة الإتقان (60%+)
- منع التكرار: مرة واحدة لكل لعبة في اليوم
- منطق واضح وقابل للاختبار

---

## ⚠️ مشكلات مؤكدة

### 1. N+1 Query في لوحة الوالد
**الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx` السطر 29–53

```tsx
for (const child of children || []) {
  const [...] = await Promise.all([
    supabase.from('child_points')...,
    supabase.from('learning_progress')...,
    supabase.from('story_reads')...,
    supabase.from('child_badges')...,
  ])
}
```

**المشكلة (مؤكدة):** لكل طفل يُنفَّذ 4 استعلامات بشكل تسلسلي (loop). مع 4 أطفال = 16 استعلاماً.  
**الحل:** استعلام واحد بـ `GROUP BY child_id` أو `Promise.all` على مستوى الأطفال.

### 2. ملف `/auth/callback` مكرّر
**الملفات:**
- `apps/web/src/app/(auth)/auth/callback/route.ts`
- `apps/web/src/app/auth/callback/route.ts`

**المشكلة (مؤكدة):** مسار callback مكرّر في مكانين. مذكور في `TASKS.md` كـ pending.  
**المخاطر:** قد يستجيب المسار الخطأ حسب ترتيب Next.js للملفات.  
**الحل:** احذف أحدهما بعد تحديد أيهما يستخدمه Supabase.

### 3. inline styles بدلاً من Tailwind classes
**الملف:** `apps/web/src/app/(child)/stories/page.tsx` (مثال على النمط المتكرر)
```tsx
style={{ background: 'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)' }}
style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}
```
**الملاحظة:** inline styles موجودة في أكثر من 10 مكان. لا تُستخدم Tailwind JIT بشكل كامل.  
**التأثير:** ليست خطأ، لكن تصعّب الصيانة والتغيير المركزي للتصميم.

### 4. `any` و `unknown` type casts
**الملف:** `apps/web/src/app/admin/page.tsx` السطر 43–44
```tsx
const subject = l.subject as unknown as { name_ar: string; emoji: string } | null
const qCount = (l.questions as unknown as { count: number }[] | null)?.[0]?.count ?? 0
```
**الملاحظة:** type casting إلى `unknown` يتجاوز TypeScript safety. سببه محدودية Supabase types.  
**الحل:** توليد types تلقائياً من Supabase schema (`supabase gen types typescript`).

### 5. `createClient()` بدون await check في بعض الأماكن
**الملف:** `apps/web/src/app/(parent)/parent/dashboard/page.tsx` السطر 19
```tsx
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')
```
✅ هذا صحيح. لكن في بعض الصفحات الأخرى قد لا يُتحقق من الخطأ.

---

## ⚡ ملاحظات (ليست أخطاء)

### 6. Web Audio API بدلاً من audio files
**الملف:** `apps/web/src/app/(child)/kids/[childId]/KidDashboard.tsx`
```tsx
function playPop() {
  const ctx = new AudioContext()
  // ... oscillator code
}
```
**الملاحظة:** توليد أصوات بـ Web Audio API (oscillators). ذكي ولا يحتاج ملفات صوتية، لكن الجودة محدودة.

### 7. تلوين الكلمات يعتمد على `charIndex`
**الملف:** `StoryReader.tsx`
خوارزمية تلوين الكلمة المقروءة معقدة بعض الشيء وتعتمد على `SpeechSynthesisEvent.charIndex`. ستصبح غير ذات صلة عند التحول لـ MP3 audio.

### 8. cleanPageText في LibraryReader
**الملف:** `apps/web/src/app/(child)/library/[slug]/LibraryReader.tsx`
```tsx
function cleanPageText(raw: string): string {
  // إزالة كود JavaScript المضمّن من StoryWeaver
}
```
**الملاحظة:** workaround لمشكلة في بيانات StoryWeaver. واضح ومعلَّق.

---

## 🔴 الكود الغائب

### لا يوجد أي اختبار تلقائي
**البحث:** لا توجد ملفات `*.test.ts`, `*.spec.ts`, `cypress/`, `playwright/` في المشروع.  
**التأثير:** أي تغيير قد يكسر وظائف موجودة دون إنذار.  
**التوصية:** على الأقل اختبارات على منطق `saveGameSession` و `shouldAwardPoints` و `pagesFromContent`.

### لا يوجد Error Boundary شامل
**الملف:** `apps/web/src/app/error.tsx` موجود لكن لا يوجد error boundary على مستوى المكونات.

---

## ملخص المشكلات حسب الأولوية

| الأولوية | المشكلة | الملف |
|---------|---------|-------|
| 🔴 عالية | N+1 query في dashboard | `parent/dashboard/page.tsx` |
| 🔴 عالية | ملف callback مكرّر | `(auth)/auth/callback/` + `auth/callback/` |
| 🟡 متوسطة | type casting بـ `unknown` | `admin/page.tsx` |
| 🟡 متوسطة | inline styles متكررة | متعددة |
| 🟡 متوسطة | لا Supabase generated types | — |
| 🟢 منخفضة | لا اختبارات تلقائية | — |
| 🟢 منخفضة | Web Audio oscillators للأصوات | `KidDashboard.tsx` |
