# التحليل التقني والمعمارية — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26

---

## نظرة عامة على المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Browser (PWA) ←──── Next.js SSR/RSC ────→ Expo WebView    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                   NEXT.JS 14 APP ROUTER                      │
│  Route Groups: (auth) | (child) | (parent) | (marketing)    │
│  Middleware: Session refresh + Route protection              │
│  Server Components (default) + Client Components ('use client')│
└──────────────────────────┬──────────────────────────────────┘
                           │ Supabase JS SDK
┌──────────────────────────▼──────────────────────────────────┐
│                      SUPABASE                                │
│  PostgreSQL DB │ Auth (email/PIN) │ Storage (recordings)     │
│  Row Level Security (RLS) │ Edge Functions (future)          │
└─────────────────────────────────────────────────────────────┘
```

---

## تفاصيل Stack التقني

### Frontend (apps/web)

| التقنية | الإصدار | الغرض |
|---------|---------|-------|
| Next.js | 14.2.21 | App Router, SSR, RSC |
| React | 18.3.1 | UI framework |
| TypeScript | 5.3.3 | Type safety (strict mode) |
| Tailwind CSS | 3.4.14 | Styling |
| framer-motion | 11.11.17 | صفحات القصص والانتقالات |
| @supabase/ssr | 0.12.7 | Auth + DB client (server-side) |
| @supabase/supabase-js | 2.119.2 | DB client (browser-side) |
| lucide-react | 0.454.0 | Icons |
| clsx + tailwind-merge | - | CSS class merging |

### Mobile (apps/mobile)

| التقنية | الغرض |
|---------|-------|
| Expo SDK 51 | Mobile framework |
| expo-router | File-based routing |
| react-native-webview | تغليف الموقع |
| @react-native-community/netinfo | كشف الاتصال |
| EAS Build | بناء APK/AAB |

### Backend / Database

| التقنية | الغرض |
|---------|-------|
| Supabase Free | PostgreSQL + Auth + Storage |
| PostgreSQL | قاعدة البيانات الرئيسية |
| Supabase Auth | المصادقة (email/password) |
| Supabase Storage | تسجيلات صوت الأطفال + story-audio (مخطط) |
| RLS (Row Level Security) | عزل بيانات الأسر |
| Supabase RPCs | `increment_child_points`, `is_admin`, `verify_child_pin` |

### Monorepo

```
saleem/
├── apps/
│   ├── web/          Next.js 14 — الموقع الرئيسي
│   └── mobile/       Expo — تطبيق Android WebView
├── packages/
│   ├── design-tokens/ CSS variables لأسلوب التصميم
│   └── types/         TypeScript types مشتركة
├── supabase/migrations/ 21 migration file
├── scripts/           Python scripts (audio generation)
└── docs/             توثيق الإعداد والنشر
```

---

## هيكل قاعدة البيانات (من الـ migrations)

### جداول المصادقة والحسابات (001)
- `parent_profiles(id, user_id, full_name, ...)`
- `child_profiles(id, parent_id, name, birth_year, avatar_emoji, pin_hash, age_group, ...)`

### التعلم (002, 003)
- `subjects(id, slug, name_ar, emoji, color, is_active, sort_order)`
- `lessons(id, subject_id, slug, title_ar, age_group, content_ar, is_active, sort_order)`
- `quiz_questions(id, lesson_id, question_ar, choices, correct_index, explanation_ar)`
- `learning_progress(id, child_id, lesson_id, status, score, completed_at)`
- `child_points(id, child_id, total_points)` + RPC `increment_child_points`

### القصص (004, 009, 018)
- `stories(id, slug, title_ar, summary_ar, cover_emoji, content_ar, age_group, level, pages JSONB, quiz JSONB, is_active, sort_order, read_time_min)`
- `story_reads(id, child_id, story_id, read_at)`
- `story_comprehension(id, child_id, story_id, score, answers JSONB)`

### المكتبة المفتوحة (010, 019, 020)
- `open_library(id, sw_id, slug, title, level, credits, cover_path, orientation, audio_url, vtt_url, pages JSONB)`
- دالة `import_sw_pages` لاستيراد صفحات StoryWeaver

### الألعاب (005)
- `game_sessions(id, child_id, game_type, subject_slug, score, max_score, duration_sec, played_at)`

### الشارات والنقاط (007)
- `badges(id, slug, name_ar, description_ar, emoji, category, points_required, is_active, sort_order)`
- `child_badges(id, child_id, badge_id, earned_at)`

### الإدارة (008, 013, 014, 015, 016, 017, 021)
- PIN hashing بـ pgcrypto
- `child_assignments(id, parent_id, child_id, story_id, lesson_id, note, assigned_at, completed_at)`
- `story_recordings(id, user_id, child_id, story_id, storage_path, mime_type, duration_sec, ...)`
- `admins(id, user_id)` + RPC `is_admin`
- migration 016: إزالة سياسات القراءة العامة
- migration 017: الإتقان (60%) شرط الحصول على نقاط

---

## تدفق المصادقة

```
Visitor → /auth/register → Supabase Auth → تأكيد البريد
                                          ↓
                              /auth/callback → redirect /parent
                                          ↓
Parent → /parent → يضيف أطفالاً → /kids/[childId]?pin=...
                                          ↓
Child → /kids → يدخل PIN → /kids/[childId] (dashboard)
```

**الحماية في Middleware:**  
`apps/web/src/middleware.ts` → يحمي: `/parent, /child, /admin, /teacher, /worlds, /stories, /badges, /games, /kids, /draw, /library`

**Admin Check:**  
`apps/web/src/app/admin/layout.tsx` → `supabase.rpc('is_admin')` → `notFound()` إذا ليس admin

---

## نظام التوجيه (Route Groups)

| المجموعة | المسار | الحماية |
|---------|--------|--------|
| `(marketing)` | `/`, `/privacy`, `/terms` | عامة |
| `(auth)` | `/auth/*` | عامة (redirect إذا مسجّل) |
| `(parent)` | `/parent/*` | Supabase Auth |
| `(child)` | `/kids, /stories, /games, /badges, /draw, /library, /worlds` | Supabase Auth |
| `admin` | `/admin/*` | Supabase Auth + is_admin() |

---

## CI/CD والنشر

```
GitHub Push
    ↓
GitHub Actions (.github/workflows/)
    ↓ lint + type-check
Vercel (auto-deploy on push to master)
    ↓
saleem-*.vercel.app
```

**ملاحظة مهمة:** Vercel Hobby لا يسمح بالاستخدام التجاري. القرار: نقل للإنتاج على Cloudflare Pages عند بدء الدفع (branch `cloudflare-migration` موجود، Next.js 15 مُرقَّى، لم يُختبر الحجم بعد).

---

## الاعتماديات الخارجية (مجانية كلها)

| الخدمة | الحد المجاني | الاستخدام |
|--------|-------------|---------|
| Supabase Free | 500MB DB, 1GB Storage, 50MB file | DB + Auth + Audio recordings |
| Vercel Hobby | 100GB bandwidth/mo | Web hosting (dev/staging) |
| GitHub Free | Actions 2000 min/mo | CI/CD |
| Expo/EAS | Build quota محدود | Mobile builds |
| StoryWeaver | مفتوح المصدر CC | مكتبة 532 قصة |
| edge-tts | مجاني (Microsoft Edge API) | توليد أصوات القصص |

---

## تقييم المعمارية: 8/10

**نقاط القوة:**
- Monorepo محكم بـ pnpm workspaces
- Next.js 14 App Router (Server Components أفضل للأداء)
- RLS حقيقية تعزل بيانات كل أسرة
- فصل واضح: Server Components للبيانات، Client Components للتفاعل

**نقاط الضعف:**
- لا يوجد caching layer (Redis/Edge Cache)
- لا يوجد API layer منفصل (يمكن إضافة Next.js API routes)
- Supabase قد يتوقف بعد 7 أيام خمول (يحتاج ping دوري)
- Mobile app هو WebView فقط — لا Native features
