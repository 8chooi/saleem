# API.md — توثيق الـ API
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24

---

## البنية العامة

### Base URL
```
Development: http://localhost:3000/api
Production:  https://saleem.app/api
```

### المصادقة
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### استجابة موحدة
```typescript
// نجاح
{ data: T, error: null }

// خطأ
{ data: null, error: { code: string, message: string } }
```

---

## Endpoints المخطط لها (Phase 2+)

### المصادقة
```
POST /api/auth/signup          تسجيل ولي أمر
POST /api/auth/login           دخول
POST /api/auth/logout          خروج
POST /api/auth/forgot-password طلب استعادة كلمة السر
```

### ملفات الأطفال
```
GET  /api/children              أطفال ولي الأمر
POST /api/children              إضافة طفل
PUT  /api/children/[id]         تعديل
DELETE /api/children/[id]       حذف (يتطلب موافقة)
```

### المحتوى
```
GET /api/worlds                 العوالم
GET /api/worlds/[id]/units      وحدات عالم
GET /api/stories                قائمة قصص (مع فلترة)
GET /api/stories/[id]           قصة + صفحاتها
GET /api/lessons/[id]           درس
GET /api/games/[id]             لعبة
```

### التقدم
```
POST /api/progress/lesson       تسجيل إتمام درس
POST /api/progress/story        تسجيل قراءة قصة
POST /api/quiz/submit           تسليم اختبار
GET  /api/progress/[childId]    تقدم طفل (لولي الأمر)
```

### المعلم
```
GET  /api/teacher/classrooms    فصول المعلم
POST /api/teacher/classrooms    إنشاء فصل
GET  /api/teacher/classrooms/[id]/students  طلاب الفصل
POST /api/teacher/assignments   تعيين واجب
```

---

## RLS بدلاً من API Middleware

معظم قراءة البيانات تتم مباشرة من Supabase Client مع RLS.
API Routes مخصصة للعمليات التي تحتاج:
- منطق خادمي (مثل تحديث النقاط)
- إرسال إيميلات
- عمليات متعددة الجداول (transactions)
- التحقق من صلاحيات معقدة

---

## أمان API

```typescript
// كل route تتحقق من:
1. JWT صالح (Supabase middleware)
2. الدور المطلوب (parent/teacher/admin)
3. صلاحية الوصول للمورد المحدد
4. Rate limiting (Edge Config أو middleware)

// لا service_role_key في أي client-side code أبداً
```

---

## Supabase Realtime (Phase 6+)

للميزات التي تحتاج تحديثاً لحظياً:
- إشعارات ولي الأمر بنشاط الطفل
- تحديثات لوحة المعلم

```typescript
// مثال
supabase
  .channel('child-progress')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'learning_progress',
    filter: `child_id=eq.${childId}`
  }, handleProgressUpdate)
  .subscribe()
```
