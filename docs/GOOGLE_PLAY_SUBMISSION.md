# دليل نشر سَلِيم على Google Play

## المتطلبات قبل البدء

- [ ] حساب Google Play Developer ($25 مرة واحدة فقط)
- [ ] الموقع منشور على Cloudflare Pages (URL الحقيقي)
- [ ] صور التطبيق جاهزة (انظر قسم الأصول)
- [ ] سياسة الخصوصية منشورة على الموقع

---

## الخطوة 1: تحديث SITE_URL

بعد نشر الموقع على Cloudflare، افتح `apps/mobile/app/index.tsx` وغيّر:
```typescript
const SITE_URL = 'https://saleem.8ch.app' // ← URL الحقيقي هنا
```

---

## الخطوة 2: تجهيز الأصول المطلوبة

### أيقونات التطبيق (ضعها في `apps/mobile/assets/`)
| الملف | الحجم | الاستخدام |
|-------|-------|-----------|
| `icon.png` | 1024×1024 | أيقونة التطبيق الرئيسية |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon (foreground) |
| `splash.png` | 1242×2436 | شاشة البداية |

### صور Google Play Console
| النوع | الحجم | العدد |
|-------|-------|-------|
| أيقونة التطبيق | 512×512 PNG | 1 |
| Feature Graphic | 1024×500 JPG/PNG | 1 |
| لقطات شاشة هاتف | 1080×1920 (نسبة 16:9) | 2-8 |

---

## الخطوة 3: تثبيت EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

## الخطوة 4: بناء APK للاختبار (مجاني)

```bash
cd apps/mobile
eas build --profile preview --platform android
```

- يستغرق ~15 دقيقة
- يُنتج APK للتثبيت المباشر
- 30 بناء مجاني/شهر مع Expo

---

## الخطوة 5: بناء AAB للنشر

```bash
eas build --profile production --platform android
```

- يُنتج `.aab` (Android App Bundle)
- مطلوب لـ Google Play

---

## الخطوة 6: إعداد Google Play Console

1. افتح [play.google.com/console](https://play.google.com/console)
2. **Create app**
3. أدخل:
   - App name: `سَلِيم | SALEEM`
   - Default language: `Arabic - ar`
   - App or game: `App`
   - Free or paid: `Free`
4. اقبل سياسات المطوّر

---

## الخطوة 7: إعداد Store Listing

في **Main store listing**:

```
App name: سَلِيم | SALEEM
Short description: تعلّم وافهم.. العقل السليم والفكر المتوازن
Full description:
سَلِيم منصة تعليمية تفاعلية للأطفال من 3 إلى 12 سنة.

7 عوالم تعليمية:
🌙 الحروف والقراءة
🔢 الأرقام والرياضيات
🔭 العلوم والاستكشاف
🌍 اللغات والثقافات
🧩 التفكير والمنطق
🎨 الإبداع والفنون
🌟 المعرفة العامة

✅ محتوى آمن 100% بدون إعلانات
✅ متابعة تقدم الطفل للوالدين
✅ مناسب للأطفال 3-12 سنة
✅ باللغة العربية
```

---

## الخطوة 8: Content Rating (تصنيف المحتوى)

في **Content rating** → **Start questionnaire**:
- Category: **Education**
- أجب على الأسئلة:
  - Violence: **No**
  - Sexual content: **No**
  - Language: **No**
  - Controlled substances: **No**
  - User-generated content: **No**
  - Personal/location data: **No** (الأطفال لا يُدخلون بيانات مباشرة)
- النتيجة المتوقعة: **IARC: Everyone / 3+**

---

## الخطوة 9: سياسة الخصوصية للأطفال (إجبارية)

في **App content** → **Privacy Policy**:
```
https://saleem.8ch.app/privacy
```

في **App content** → **Target audience**:
- Ages: `5 and under` و `6-8` و `9-12`
- هذا يُفعّل متطلبات COPPA/GDPR-K تلقائياً

---

## الخطوة 10: رفع AAB

1. في **Production** → **Create new release**
2. ارفع ملف `.aab` من الخطوة 5
3. أضف Release notes:
   ```
   ar-EG: الإصدار الأول من منصة سَلِيم التعليمية
   en-US: First release of SALEEM educational platform
   ```

---

## الخطوة 11: المراجعة والنشر

- اضغط **Review release** ثم **Start rollout to Production**
- مدة المراجعة: 1-7 أيام (التطبيقات للأطفال قد تستغرق أكثر)
- ستصلك رسالة على البريد عند القبول أو الرفض

---

## ملاحظات مهمة

### سياسة Google للتطبيقات الموجهة للأطفال (Families Policy)
- ✅ لا إعلانات مستهدفة للأطفال
- ✅ لا مشتريات داخل التطبيق بدون موافقة الوالدين
- ✅ لا جمع بيانات شخصية من الأطفال بشكل مباشر
- ✅ سياسة خصوصية واضحة تشمل الأطفال

### WebView وسياسة Google Play
- ✅ `setSupportMultipleWindows={false}` — منع التنقل لمواقع خارجية
- ✅ `geolocationEnabled={false}` — لا نطلب الموقع
- ✅ `applicationNameForUserAgent="SaleemApp/1.0"` — هوية واضحة
- ✅ الصلاحيات: `INTERNET` و `ACCESS_NETWORK_STATE` فقط

### حالة رفض شائعة وحلولها
| سبب الرفض | الحل |
|-----------|------|
| سياسة خصوصية مفقودة | تأكد من رابط /privacy |
| target audience غير محدد | حدد أعمار 5 وما دون، 6-8، 9-12 |
| WebView يفتح مواقع خارجية | `setSupportMultipleWindows={false}` موجود ✅ |

---

## الخطوات بعد القبول

1. **Deep link**: أضف `intentFilters` في `app.json` لفتح روابط الموقع مباشرة في التطبيق
2. **Push notifications**: Expo Notifications (مجاني) عند الحاجة
3. **Analytics**: Expo Analytics أو Plausible (مجاني لـ self-hosted)
