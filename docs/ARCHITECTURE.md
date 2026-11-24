# ARCHITECTURE.md — البنية التقنية
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24

---

## 1. نظرة عامة على البنية

```
saleem/
├── apps/
│   ├── web/          # Next.js 14 + TypeScript
│   └── mobile/       # React Native + Expo
├── packages/
│   ├── shared/       # منطق العمل المشترك
│   ├── types/        # TypeScript types مشتركة
│   ├── validation/   # Zod schemas
│   ├── api-client/   # Supabase client wrapper
│   ├── design-tokens/ # ألوان، خطوط، spacing
│   ├── learning-core/ # منطق التعلم والتقدم
│   └── game-engine/  # Phaser wrapper للألعاب
├── supabase/
│   ├── migrations/   # Database migrations
│   ├── functions/    # Edge Functions
│   ├── policies/     # RLS policies
│   └── seed/         # بيانات أولية
├── docs/
└── tests/
```

---

## 2. Stack التقني

### Frontend — Web
| الطبقة | التقنية | السبب |
|--------|---------|-------|
| Framework | Next.js 14 (App Router) | SSR + SSG + PWA |
| Language | TypeScript strict | Type safety |
| Styling | Tailwind CSS | سرعة + RTL support |
| State | Zustand | بسيط وخفيف |
| Forms | React Hook Form + Zod | validation آمن |
| Animations | Framer Motion (محدود) | أداء جيد |
| Icons | Lucide React | مجاني + خفيف |
| PWA | next-pwa | تثبيت من المتصفح |

### Frontend — Mobile
| الطبقة | التقنية |
|--------|---------|
| Framework | React Native + Expo SDK 51 |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind للموبايل) |
| Shared Logic | packages/shared |

### Backend
| الطبقة | التقنية |
|--------|---------|
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth |
| API | Next.js API Routes + Supabase |
| Storage | Supabase Storage |
| Edge Functions | Supabase Edge Functions (Deno) |
| Email | Resend (3,000/شهر مجاناً) |

### Games
| الطبقة | التقنية |
|--------|---------|
| Engine | Phaser 3 | 
| Integration | React component wrapper |

---

## 3. بنية قاعدة البيانات (ملخص)
راجع `docs/DATABASE.md` للتفاصيل الكاملة

**الجداول الأساسية (Phase 2):**
- users, parent_profiles, child_profiles, parent_child_links

**الجداول التعليمية (Phase 3-5):**
- subjects, educational_stages, learning_units, lessons
- stories, story_pages, games, questions, quizzes
- learning_progress, points_transactions, badges

**الجداول المدرسية (Phase 7):**
- schools, teachers, classrooms, classroom_students

---

## 4. الأمان والصلاحيات

```
Admin
  └── يرى ويدير كل شيء

Teacher
  └── يرى فصوله وطلابه فقط

Parent
  └── يرى أطفاله المرتبطين به فقط

Child (عبر جلسة ولي الأمر)
  └── يرى محتواه المناسب لعمره فقط
```

- RLS على كل جدول في Supabase
- JWT لكل طلب API
- Server-side validation لكل input
- لا مفاتيح service_role في الواجهة أبداً

---

## 5. الاستضافة والنشر

### المرحلة الأولى (مجاني)
| الخدمة | الاستخدام |
|--------|----------|
| Vercel Hobby | Web (للتطوير) |
| Cloudflare Pages | Web (للإنتاج — مجاني تجاري) |
| Supabase Free | Database + Auth + Storage |
| GitHub | Monorepo + CI/CD |

### تحذير Vercel
Vercel Hobby غير مسموح للاستخدام التجاري رسمياً.
**للإنتاج: استخدم Cloudflare Pages** (مجاني بدون قيود تجارية)

---

## 6. أنماط التصميم

- **Monorepo** — pnpm workspaces
- **Server Components** — افتراضي في Next.js App Router
- **Client Components** — فقط عند الحاجة للتفاعل
- **API Routes** — لعمليات الكتابة والمصادقة
- **RLS** — أمان على مستوى قاعدة البيانات
- **Optimistic UI** — لتجربة أسرع
