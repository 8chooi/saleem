# المرحلة 1 — Design System + Foundation
# SALEEM PHASE 1 DESIGN PLAN
تاريخ: 2026-11-27
مبني على فحص مباشر للكود الفعلي — لا افتراضات

---

## 1. الوضع الحالي (ما وجدناه في الكود)

### 1.1 الصفحات والمكونات الموجودة

**صفحات الطفل (Child Zone):**
| الصفحة | المسار | الحالة |
|--------|--------|--------|
| اختيار الطفل + PIN | `(child)/kids/page.tsx` | ✅ جاهز، تصميم جيد |
| الصفحة الرئيسية للطفل | `(child)/kids/[childId]/KidDashboard.tsx` | ✅ جاهز، Clay Style |
| عوالم التعلم | `(child)/worlds/[slug]/page.tsx` | ⚠️ تصميم بسيط |
| درس داخل العالم | `(child)/worlds/[slug]/lessons/[slug]/` | ⚠️ تصميم بسيط |
| القصص (قائمة) | `(child)/stories/page.tsx` | ⚠️ تصميم متوسط |
| قارئ القصص | `(child)/stories/[slug]/StoryReader.tsx` | ✅ لا نلمسه |
| المكتبة (قائمة) | `(child)/library/page.tsx` | ⚠️ تصميم متوسط |
| قارئ المكتبة | `(child)/library/[slug]/LibraryReader.tsx` | ✅ لا نلمسه |
| الألعاب | `(child)/games/page.tsx` + 6 ألعاب | ⚠️ تصميم متفاوت |
| الرسم والتلوين | `(child)/draw/page.tsx` | ✅ لا نلمسه |
| الشارات | `(child)/badges/page.tsx` | ⚠️ يحتاج تحسين |

**مكونات UI الموجودة:**
```
components/ui/
├── Avatar.tsx      ← موجود
├── Badge.tsx       ← موجود
├── Button.tsx      ← موجود
├── Card.tsx        ← موجود (5 variants: default, elevated, interactive, child, world)
├── EmptyState.tsx  ← موجود
├── Input.tsx       ← موجود
├── Progress.tsx    ← موجود
└── Skeleton.tsx    ← موجود
```

### 1.2 نظام التصميم الحالي (من الكود الفعلي)

**الخطوط الحالية** (`styles/globals.css` + `tailwind.config.ts`):
```css
/* محمّل فعلاً من Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
/* التعريف في tailwind */
fontFamily: { arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'] }
```
→ **الخط الحالي: Cairo** — ممتاز للأطفال، لا نحتاج تغييره.

**الألوان الحالية** (`tailwind.config.ts`):
```js
primary:   #2563EB  (أزرق)
secondary: #7C3AED  (بنفسجي)
accent:    #F59E0B  (ذهبي)
success:   #10B981  (أخضر)
// 7 ألوان للعوالم:
world.letters:    #F97316 (برتقالي)
world.numbers:    #22C55E (أخضر)
world.science:    #0EA5E9 (سماوي)
world.languages:  #A855F7 (بنفسجي)
world.thinking:   #F43F5E (أحمر وردي)
world.creativity: #EAB308 (أصفر)
world.knowledge:  #14B8A6 (تيل)
```

**الحركات الموجودة** (`tailwind.config.ts`):
```js
'fade-in': 200ms, 'slide-up': 200ms, 'bounce-soft': 600ms infinite
```

**المكتبات المثبتة فعلاً** (`package.json`):
- `framer-motion@11.11.17` ✅ — مثبت، يُستخدم في StoryReader
- `lucide-react@0.454.0` ✅ — مثبت
- `clsx@2.1.1` + `tailwind-merge@2.5.4` ✅ — مثبتان
- `@saleem/design-tokens` ← workspace dependency (لم يُتحقق من محتواه)

### 1.3 نقاط القوة التي نحافظ عليها
- ✅ **KidDashboard.tsx** — Clay Style مع gradients جميلة، أصوات تفاعلية، حلقات تقدم SVG
- ✅ **شاشة اختيار الطفل** — Glassmorphism + gradient بنفسجي/وردي، لوحة مفاتيح عربية
- ✅ **CSS Variables** في globals.css منظمة
- ✅ **child-mode** CSS class لأحجام لمس كبيرة (min 52px)
- ✅ **RTL كامل** في html dir="rtl"
- ✅ **prefers-reduced-motion** مُطبَّق في globals.css
- ✅ **7 ألوان العوالم** محددة ومنسقة

### 1.4 نقاط الضعف التصميمية
- ❌ **لا mascot** — شخصية سَلِيم غائبة كلياً
- ❌ **إيموجي كأيقونات** في كل الأنشطة (ClayBtn) بدلاً من SVG موحد
- ❌ **تضارب بصري** — primary أزرق لكن شاشة الطفل بنفسجي/وردي، لا يوجد توحيد واضح
- ❌ **صفحات العوالم والقصص** تصميمها أدنى من KidDashboard
- ❌ **لا welcome screen** — الطفل يذهب مباشرة للـ Dashboard دون ترحيب بالشخصية
- ❌ **لوحة ألوان غير مكتملة** — لا `brand purple` رسمي (secondary #7C3AED يستخدم أحياناً)

---

## 2. هوية سَلِيم البصرية الجديدة

### 2.1 الشخصية الأصلية — سَلِيم Mascot

**الوصف الكامل:**
طفل عربي بعيون كبيرة ولامعة، شعر قصير أسود مجعّد قليلاً، ابتسامة عريضة دافئة، بشرة قمحية. يرتدي ثوباً/تيشيرت بالأزرق البنفسجي `#5C4AE4` مع نجمة ذهبية `✦` في المنتصف. أسلوب 3D Cartoon ناعم (rounded shapes، highlights بيضاء، shadows خفيفة).

**التنفيذ المقترح:**
- SVG inline مع CSS keyframe animations
- حالتان: `idle` (تأرجح ناعم) و `celebrate` (قفز مع نجوم)
- لا Lottie (يحتاج ملفات JSON خارجية) — pure SVG + CSS

**مواضع الاستخدام:**
1. شاشة اختيار الطفل (بجانب "مرحباً!")
2. الصفحة الرئيسية للطفل (Header صغير)
3. شاشة المكافآت/الشارات الجديدة
4. الحالات الفارغة (EmptyState)
5. شاشة 404 الخاصة بالأطفال

### 2.2 لوحة الألوان (تعديل، لا استبدال كامل)

نحتفظ بالألوان الموجودة ونُضيف:

```
// الحالي (نحتفظ به)
primary:   #2563EB  ← للبالغين (parent dashboard, auth)
secondary: #7C3AED  ← يصبح اللون الرئيسي لمنطقة الطفل

// جديد — نضيف للـ tailwind extend
brand: {
  purple:  '#5C4AE4'   // اللون الرئيسي للبراند (أغمق من secondary)
  pink:    '#EC4899'   // للقصص والمكتبة
  gold:    '#F59E0B'   // النجوم والمكافآت (= accent الموجود)
  mint:    '#10B981'   // النجاح (= success الموجود)
  coral:   '#F97316'   // الألعاب (= world.letters الموجود)
}
// لا نحذف الألوان القديمة — نضيف فقط
```

**الـ gradient الرئيسي للطفل** (موجود في KidDashboard، نوثّقه رسمياً):
```css
--gradient-child: linear-gradient(135deg, #5C4AE4 0%, #7C3AED 50%, #EC4899 100%);
```

### 2.3 الخطوط (بدون تغيير)
Cairo موجود ومحمّل بالفعل، ممتاز للأطفال — **لا تغيير على الخطوط**.

### 2.4 Tailwind Design Tokens المقترحة (إضافة فقط)
```ts
// في tailwind.config.ts → theme.extend.colors
brand: {
  purple: '#5C4AE4',
  pink:   '#EC4899',
  gold:   '#F59E0B',
  mint:   '#10B981',
  coral:  '#F97316',
},
// في theme.extend.boxShadow
clay: {
  sm:  '0 4px 0 rgba(0,0,0,0.15)',
  md:  '0 6px 0 rgba(0,0,0,0.20)',
  lg:  '0 8px 0 rgba(0,0,0,0.25)',
},
// في theme.extend.animation
'float':     'float 3s ease-in-out infinite',
'celebrate': 'celebrate 0.6s ease',
// في theme.extend.keyframes
float: {
  '0%, 100%': { transform: 'translateY(0)' },
  '50%': { transform: 'translateY(-8px)' },
},
celebrate: {
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.15)' },
  '100%': { transform: 'scale(1)' },
},
```

### 2.5 نظام الحركة والانتقالات
- مدة: 150-300ms للتفاعلات، 600ms للاحتفالات
- Clay press: `active:translate-y-1.5 active:shadow-none` (موجود فعلاً في KidDashboard)
- Float: `animate-float` (جديد)
- موجود في globals.css: `prefers-reduced-motion` ✅

---

## 3. المكونات الجديدة المقترحة

### 3.1 SaleemMascot.tsx — **جديد تماماً**
```
المسار: src/components/mascot/SaleemMascot.tsx
```
**الوصف:** SVG للشخصية مع CSS animation states.

**Props:**
```ts
interface SaleemMascotProps {
  size?: number           // default: 120
  mood?: 'idle' | 'celebrate' | 'wave'  // default: 'idle'
  className?: string
}
```

**الملفات التي ستستخدمه:**
- `(child)/kids/page.tsx` — بجانب "مرحباً!"
- `(child)/kids/[childId]/KidDashboard.tsx` — في الـ header (اختياري)
- `components/ui/EmptyState.tsx` — تعديل لإضافة خيار الماسكوت

**الملفات التي ستتعدل:** لا شيء (استخدام إضافي)

**المخاطر:** صفر — ملف جديد مستقل

---

### 3.2 WorldCard.tsx — **جديد**
```
المسار: src/components/learning/WorldCard.tsx
```
**الوصف:** بطاقة عالم تعليمي بأسلوب Clay، تعرض الأيقونة والاسم ونسبة التقدم.

**Props:**
```ts
interface WorldCardProps {
  slug: string
  name: string
  emoji: string
  color: string        // hex — من world colors الموجودة
  totalLessons: number
  doneLessons: number
  childId?: string
  onClick?: () => void
}
```

**الملفات التي ستستخدمه:**
- `(child)/kids/[childId]/KidDashboard.tsx` — استبدال قسم العوالم الحالي (أو إضافته)

**الملفات التي ستتعدل:**
- `KidDashboard.tsx` — استدعاء WorldCard بدل الكود inline

**المخاطر:** منخفضة — نعيد استخدام كود موجود في KidDashboard

---

### 3.3 ContentCard.tsx — **جديد**
```
المسار: src/components/ui/ContentCard.tsx
```
**الوصف:** بطاقة موحّدة للقصص والكتب، تحل مشكلة عدم التناسق بين صفحة Stories و Library.

**Props:**
```ts
interface ContentCardProps {
  type: 'story' | 'book'
  title: string
  emoji: string
  level?: number
  readTime?: number
  isNew?: boolean
  href: string
  accentColor?: string
}
```

**الملفات التي ستستخدمه:**
- `(child)/stories/page.tsx`
- `(child)/library/page.tsx`

**الملفات التي ستتعدل:**
- `stories/page.tsx` — استبدال بطاقات القصص المبعثرة بـ ContentCard
- `library/page.tsx` — نفس الشيء

**المخاطر:** متوسطة — نعدّل صفحتين قائمتين

---

### 3.4 PointsDisplay.tsx — **جديد**
```
المسار: src/components/ui/PointsDisplay.tsx
```
**الوصف:** مكوّن موحّد لعرض النقاط/النجوم (يحل محل الكود inline في KidDashboard).

**Props:**
```ts
interface PointsDisplayProps {
  points: number
  variant?: 'header' | 'inline' | 'celebration'
  animate?: boolean
}
```

**الملفات التي ستستخدمه:** KidDashboard، badges page

**المخاطر:** منخفضة

---

### 3.5 ChildPageHeader.tsx — **جديد**
```
المسار: src/components/layout/ChildPageHeader.tsx
```
**الوصف:** Header مشترك لصفحات الطفل الداخلية (stories, library, games) — يحل مشكلة عدم التناسق.

**Props:**
```ts
interface ChildPageHeaderProps {
  title: string
  emoji?: string
  backHref?: string
  accentColor?: string  // default: brand.purple
  childId?: string
}
```

**الملفات التي ستستخدمه:**
- `(child)/stories/page.tsx`
- `(child)/library/page.tsx`
- `(child)/games/page.tsx`
- `(child)/badges/page.tsx`

**المخاطر:** منخفضة عند الإضافة، متوسطة عند استبدال headers موجودة

---

## 4. الصفحات التي ستتعدل

| الصفحة | المسار | التعديلات | المخاطر |
|--------|--------|-----------|---------|
| اختيار الطفل | `(child)/kids/page.tsx` | إضافة SaleemMascot فوق "مرحباً!" | منخفضة — إضافة فقط |
| الرئيسية (KidDashboard) | `(child)/kids/[childId]/KidDashboard.tsx` | استبدال قسم العوالم بـ WorldCard (اختياري) | متوسطة |
| قائمة القصص | `(child)/stories/page.tsx` | استخدام ContentCard + ChildPageHeader | متوسطة |
| قائمة المكتبة | `(child)/library/page.tsx` | استخدام ContentCard + ChildPageHeader | متوسطة |
| صفحة الألعاب | `(child)/games/page.tsx` | استخدام ChildPageHeader | منخفضة |
| صفحة الشارات | `(child)/badges/page.tsx` | ChildPageHeader + PointsDisplay | منخفضة |

**لا نلمس:**
- `KidDashboard.tsx` بشكل جذري (نضيف فقط، لا نعيد كتابة)
- `StoryReader.tsx` — تم تحديثه مؤخراً
- `LibraryReader.tsx` — تم تحديثه مؤخراً
- جميع صفحات الألعاب الداخلية (6 ألعاب)
- صفحات Auth وParent
- قاعدة البيانات

---

## 5. الملفات التي ستنشأ (جديدة فقط)

```
apps/web/src/
├── components/
│   ├── mascot/
│   │   └── SaleemMascot.tsx          ← الشخصية الأصلية (SVG + CSS)
│   ├── learning/
│   │   └── WorldCard.tsx             ← بطاقة عالم تعليمي
│   ├── ui/
│   │   ├── ContentCard.tsx           ← بطاقة قصة/كتاب موحّدة
│   │   └── PointsDisplay.tsx         ← عرض النقاط
│   └── layout/
│       └── ChildPageHeader.tsx       ← header مشترك لصفحات الطفل
```

**الملفات التي ستتعدل (بالإضافة فقط):**
```
apps/web/
├── tailwind.config.ts                ← إضافة brand colors + clay shadows + animations
├── src/styles/globals.css            ← إضافة --gradient-child CSS variable
└── src/app/(child)/kids/page.tsx     ← إضافة SaleemMascot
```

**الملفات التي قد تتعدل (جوهرية — تحتاج موافقة منفصلة):**
```
apps/web/src/app/(child)/stories/page.tsx   ← استخدام ContentCard
apps/web/src/app/(child)/library/page.tsx   ← استخدام ContentCard
```

---

## 6. ترتيب التنفيذ (Sprints)

### Sprint 1A — Design Tokens (آمن 100%)
**التغيير:** إضافة brand colors + clay shadows + float/celebrate animations لـ tailwind.config.ts
**الملفات:** `tailwind.config.ts`, `styles/globals.css`
**الوقت:** 15 دقيقة
**المخاطر:** صفر — إضافة فقط، لا حذف
**معيار القبول:** `npm run build` ينجح بلا أخطاء

---

### Sprint 1B — SaleemMascot Component (آمن 100%)
**التغيير:** إنشاء `src/components/mascot/SaleemMascot.tsx` — SVG inline مع CSS animations
**الملفات:** ملف جديد فقط
**الوقت:** 60 دقيقة
**المخاطر:** صفر — ملف جديد مستقل
**معيار القبول:** المكوّن يُعرض في isolation بدون أخطاء TypeScript

---

### Sprint 1C — WorldCard + ContentCard + ChildPageHeader
**التغيير:** إنشاء 3 مكونات جديدة
**الملفات:** 3 ملفات جديدة
**الوقت:** 60 دقيقة
**المخاطر:** صفر — ملفات جديدة
**معيار القبول:** TypeScript تمر بلا errors، المكونات تُعرض بشكل صحيح

---

### Sprint 1D — تكامل Mascot في شاشة الاختيار
**التغيير:** إضافة `<SaleemMascot mood="wave" />` فوق "مرحباً!" في `(child)/kids/page.tsx`
**الملفات:** `kids/page.tsx` (تعديل سطرين فقط)
**الوقت:** 10 دقيقة
**المخاطر:** منخفضة جداً
**معيار القبول:** الماسكوت يظهر، شاشة PIN تعمل كما كانت

---

### Sprint 1E — تحديث صفحة القصص (يحتاج موافقة منفصلة)
**التغيير:** استخدام ContentCard + ChildPageHeader في `stories/page.tsx`
**الملفات:** `stories/page.tsx`
**الوقت:** 45 دقيقة
**المخاطر:** متوسطة — نعدّل صفحة قائمة وفيها Supabase queries
**معيار القبول:** القصص تظهر، الفلترة تعمل، Loading skeleton يعمل

---

### Sprint 1F — تحديث صفحة المكتبة (يحتاج موافقة منفصلة)
**التغيير:** استخدام ContentCard + ChildPageHeader في `library/page.tsx`
**الملفات:** `library/page.tsx`
**الوقت:** 30 دقيقة
**المخاطر:** متوسطة
**معيار القبول:** الكتب تظهر، الروابط تعمل

---

## 7. معايير القبول للمرحلة كاملة

- [ ] شخصية سَلِيم تظهر في شاشة اختيار الطفل
- [ ] Design tokens جديدة مضافة ولا شيء تكسّر
- [ ] جميع المكونات الجديدة تمر TypeScript strict بلا errors
- [ ] الوظائف القديمة كلها تعمل (PIN، قصص، مكتبة، ألعاب، شارات)
- [ ] يعمل على 375px (iPhone SE) و 768px (Tablet) و 1280px (Desktop)
- [ ] RTL سليم في كل المكونات الجديدة
- [ ] لا محتوى يختفي خلف bars ثابتة
- [ ] `npm run build` ينجح بلا أخطاء
- [ ] `npm run type-check` ينجح بلا أخطاء

---

## 8. المكتبات — ما هو مثبت وما هو مقترح

| المكتبة | الغرض | مثبتة؟ | الإصدار |
|---------|-------|--------|--------|
| framer-motion | Animations | ✅ نعم | 11.11.17 |
| lucide-react | Icons | ✅ نعم | 0.454.0 |
| clsx | Class merging | ✅ نعم | 2.1.1 |
| tailwind-merge | Tailwind conflicts | ✅ نعم | 2.5.4 |

**لا حاجة لأي مكتبة جديدة.** كل ما نحتاجه مثبت بالفعل.

---

## 9. ما لن نلمسه في هذه المرحلة

- قاعدة البيانات والـ Supabase queries
- نظام المصادقة (Auth pages)
- `StoryReader.tsx` — تم تحديثه مؤخراً
- `LibraryReader.tsx` — تم تحديثه مؤخراً
- الألعاب الداخلية (6 ألعاب جاهزة)
- `KidDashboard.tsx` بشكل جذري
- لوحة ولي الأمر (Parent pages)
- Admin pages
- التطبيق المحمول

---

## 10. مخاطر التنفيذ

| الخطر | الاحتمالية | التأثير | الحل |
|------|-----------|---------|------|
| Tailwind tokens تكسر classes موجودة | منخفضة | متوسط | نضيف فقط، لا نعيد تسمية |
| SVG الماسكوت ثقيل على الأداء | منخفضة | منخفض | inline SVG بسيط + will-change: transform |
| ContentCard تكسر stories/library | متوسطة | عالٍ | نختبر محلياً قبل push |
| TypeScript errors في Props جديدة | منخفضة | منخفض | strict mode مفعّل — نكتشف فوراً |

---

## 11. ترتيب الموافقة المقترح

**نحتاج موافقتك على:**

**قبل أي كود:**
1. ✅ لوحة الألوان المعدّلة (brand purple `#5C4AE4` كلون رئيسي للطفل)
2. ✅ وصف شخصية سَلِيم (طفل عربي، ثوب أزرق/بنفسجي، نجمة ذهبية)
3. ✅ ترتيب Sprints 1A → 1B → 1C → 1D أولاً (آمنة 100%)

**بعد إنجاز 1A-1D:**
4. موافقة منفصلة على تعديل stories/page.tsx (Sprint 1E)
5. موافقة منفصلة على تعديل library/page.tsx (Sprint 1F)

---

> **ملاحظة:** KidDashboard.tsx يحتوي على Clay Style جميل وأصوات تفاعلية — هو المرجع البصري للمشروع. كل ما نضيفه يجب أن يكون بنفس روحه: مرح، دافئ، تفاعلي.
