# TESTING.md — استراتيجية الاختبار
## سَلِيم | SALEEM

> الإصدار: 1.0 | التاريخ: 2026-11-24

---

## مبدأ الاختبار

**لا مرحلة منتهية حتى يجتاز الاختبار.**

---

## أدوات الاختبار (مجانية)

| الأداة | الاستخدام |
|--------|----------|
| Vitest | Unit tests |
| Testing Library | Component tests |
| Playwright | E2E tests |
| TypeScript | Static type checking |
| ESLint | Code quality |

---

## قائمة الاختبار لكل مرحلة

### قائمة الفحص الإلزامية
```
□ pnpm build — ينجح بدون أخطاء
□ pnpm type-check — لا TypeScript errors
□ pnpm lint — نظيف
□ لا secrets في الكود (grep للـ keys)
□ لا console.log في الإنتاج
□ RTL يعمل على الموبايل والديسكتوب
□ كل زر وكل form يعمل فعلياً
□ حالات الخطأ (error states) ظاهرة
□ حالات التحميل (loading states) ظاهرة
□ حالات البيانات الفارغة (empty states) ظاهرة
```

### اختبار المصادقة (Phase 2)
```
□ تسجيل بإيميل صحيح ينجح
□ تسجيل بإيميل موجود يُظهر خطأ واضح
□ دخول صحيح يعمل
□ دخول خاطئ يُظهر خطأ
□ ولي الأمر لا يرى بيانات طفل غيره
□ استعادة كلمة السر تعمل
□ تسجيل الخروج يمحو الجلسة
□ المسارات المحمية تعيد توجيه غير المصرح
```

### اختبار حماية الأطفال
```
□ لا يستطيع طفل فتح حساب مستقل
□ ولي الأمر يرى أطفاله فقط
□ المعلم يرى طلاب فصله فقط
□ لا يظهر محتوى غير مناسب للعمر
□ لا روابط خارجية في تجربة الطفل
```

### اختبار الأداء
```
□ Lighthouse Performance > 85
□ FCP < 2 ثانية (3G)
□ لا images كبيرة بدون optimization
□ لا JavaScript غير ضروري
□ لا fonts ثقيلة
```

### اختبار RTL
```
□ النصوص العربية في اتجاه صحيح
□ الأيقونات الاتجاهية معكوسة
□ padding/margin صحيح في RTL
□ الفورمات والقوائم في الاتجاه الصحيح
```

---

## Unit Tests — الأولوية

```typescript
// packages/learning-core
test('progress calculation is correct')
test('next lesson recommendation logic')
test('points calculation')
test('badge eligibility check')

// packages/validation
test('child profile validation rejects invalid age')
test('quiz submission validates required fields')

// packages/shared
test('age group determination from birth year')
```

---

## E2E Tests — أهم Flows

```typescript
// Phase 2
test('parent signs up and creates child profile')
test('parent logs in and views child progress')

// Phase 3
test('child completes a lesson')
test('child progress is saved correctly')

// Phase 4
test('child reads a story and progress is recorded')
```

---

## الاختبار اليدوي

**الأجهزة المستهدفة:**
- موبايل Android متوسط (محاكي أو جهاز حقيقي)
- iPhone Safari
- Chrome Desktop
- Firefox Desktop
- Edge

**سيناريوهات خاصة:**
- إنترنت بطيء (تقليد 3G في DevTools)
- الوضع الليلي (Dark Mode)
- تكبير الخط في المتصفح إلى 125%
- Offline بعد تحميل المحتوى (PWA)
