# إعداد Supabase — خطوة بخطوة

## 1. إنشاء المشروع

1. اذهب إلى https://supabase.com (مجاني — لا بطاقة بنكية)
2. سجّل بحساب GitHub
3. انقر **New Project**
4. اختر اسماً: `saleem` وكلمة سر قوية
5. اختر المنطقة الأقرب: `eu-central-1` (أوروبا - الأقرب للعرب)
6. انتظر ~2 دقيقة حتى ينتهي الإعداد

---

## 2. متغيرات البيئة

افتح **Project Settings → API** وانسخ:

```env
# .env.local (في apps/web/)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=  ← سيرفر فقط، لا تضعه في NEXT_PUBLIC_
```

---

## 3. تشغيل Migrations

افتح **SQL Editor** في داشبورد Supabase والصق محتوى هذا الملف:

```
supabase/migrations/001_phase2_auth_profiles.sql
```

ثم انقر **Run** (أو F5).

---

## 4. إعداد Auth

### Email Confirmation
- **Authentication → Settings → Email**
- فعّل: **Enable email confirmations**
- **Site URL:** `http://localhost:3000` (تطوير) أو رابط Cloudflare Pages (إنتاج)
- **Redirect URLs:** أضف `http://localhost:3000/auth/callback`

### Google OAuth (اختياري — للمرحلة القادمة)
- **Authentication → Providers → Google**
- احصل على Client ID/Secret من Google Cloud Console

---

## 5. اختبار الإعداد

```bash
cd apps/web
cp .env.example .env.local
# عدّل القيم بمفاتيح Supabase الحقيقية
pnpm dev
```

افتح http://localhost:3000/auth/register وجرّب إنشاء حساب.

---

## الحدود المجانية

| الخاصية | الحد المجاني |
|---------|--------------|
| قاعدة البيانات | 500 MB |
| المستخدمون | 50,000 MAU/شهر |
| التخزين | 1 GB |
| Edge Functions | 500K calls/شهر |
| Idle Pause | المشروع يتوقف بعد 7 أيام بدون نشاط |

**للتغلب على Idle Pause في التطوير:** افتح الداشبورد مرة أسبوعياً أو استخدم Uptime Robot لإرسال ping مجاني.
