# DESIGN_SYSTEM.md — نظام التصميم
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24

---

## 1. الهوية البصرية

**النمط:** Premium Educational — Modern Hybrid
مزيج بين الاحتراف وعالم الأطفال — يبدو كمنتج حقيقي لا قالب جاهز.

### تجنب
- التصميم الطفولي المبالغ فيه
- ازدحام العناصر
- مؤثرات ثقيلة على الأداء
- نوافذ منبثقة مزعجة
- إعلانات داخل تجربة الطفل

---

## 2. Design Tokens (قابلة للتعديل)

```css
:root {
  /* الألوان الأساسية — قابلة للتغيير بالكامل */
  --color-primary: #2563EB;      /* أزرق رئيسي */
  --color-primary-light: #DBEAFE;
  --color-secondary: #7C3AED;    /* بنفسجي ثانوي */
  --color-accent: #F59E0B;       /* ذهبي للنقاط والجوائز */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* الخلفيات */
  --color-bg: #FAFAFA;
  --color-bg-card: #FFFFFF;
  --color-bg-child: #F0F7FF;     /* خلفية تجربة الطفل */

  /* النص */
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;

  /* الحدود */
  --color-border: #E5E7EB;
  --color-border-focus: #2563EB;

  /* الخطوط */
  --font-arabic: 'Cairo', 'Noto Sans Arabic', sans-serif;
  --font-latin: 'Inter', system-ui, sans-serif;

  /* أحجام الخط */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;

  /* للأطفال — أكبر */
  --text-child-base: 1.125rem;
  --text-child-heading: 1.5rem;

  /* الـ Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* الـ Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* الظلال */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-card: 0 2px 8px rgba(0,0,0,0.08);
}
```

---

## 3. الخطوط

### العربية
- **Cairo** — الخط الأساسي للواجهة
- **Noto Sans Arabic** — احتياطي
- مصدر: Google Fonts (مجاني)

### الإنجليزية
- **Inter** — للنصوص والواجهة
- مصدر: Google Fonts (مجاني)

### للأطفال
- خط أكبر، تباعد أسطر أوسع
- وضوح عالٍ في جميع الأحجام

---

## 4. المكونات الأساسية (Phase 1)

### Button
```
variants: primary | secondary | ghost | danger
sizes: sm | md | lg
states: default | hover | active | disabled | loading
```

### Card
```
variants: default | elevated | interactive | child-card
```

### Input
```
variants: text | password | search | select | textarea
states: default | focus | error | disabled
```

### Avatar
```
sizes: xs | sm | md | lg | xl
variants: image | initials | child-avatar
```

### Badge / Chip
```
variants: default | success | warning | error | info
```

### Progress Bar
```
variants: linear | circular | steps
```

---

## 5. التخطيط والشبكة

```
Mobile:  < 768px   — 1 عمود، padding 16px
Tablet:  768-1024px — 2 عمود
Desktop: > 1024px  — 3-4 أعمدة
Wide:    > 1280px  — container max-width 1280px
```

---

## 6. RTL / LTR

```css
/* الافتراضي عربي RTL */
html {
  dir: rtl;
  lang: ar;
}

/* عند تبديل اللغة */
html[lang="en"] {
  dir: ltr;
}
```

- استخدم `ms-*` و `me-*` في Tailwind بدل `ml-*` و `mr-*`
- استخدم `ps-*` و `pe-*` بدل `pl-*` و `pr-*`
- الأيقونات الاتجاهية تعكس في RTL

---

## 7. الحركة والأنيميشن

### مبادئ
- لا حركات بدون هدف
- لا تأثر على أداء الصفحة
- احترم `prefers-reduced-motion`

### الحركات المسموحة
```css
/* انتقالات بسيطة */
transition: all 150ms ease;

/* للبطاقات التفاعلية */
transform: translateY(-2px);

/* للنجاحات والجوائز */
/* Lottie animations — خفيفة وذات معنى */
```

---

## 8. تجربة الطفل — قواعد خاصة

- خلفية مختلفة عن الواجهة العامة (`--color-bg-child`)
- أزرار أكبر (min 44px × 44px)
- نص أكبر (`--text-child-base`)
- ألوان مبهجة بدون مبالغة
- تغذية راجعة بصرية فورية لكل تفاعل
- لا عناصر مشتتة أو إعلانات
