# نظرة عامة على المشروع — سَلِيم | SALEEM
**تاريخ التدقيق:** 2026-11-26

---

## الهوية

| العنصر | التفاصيل |
|--------|---------|
| الاسم | سَلِيم \| SALEEM |
| المالك | 8CH – أتش |
| الشعار | "العقل السليم.. والفكر المتوازن" |
| الجمهور | أطفال 3–12 سنة وأولياء أمورهم |
| اللغة | العربية (RTL-first) |
| النوع | منصة تعليمية تفاعلية (EdTech) |

---

## المشكلة التي يحلها

شُحّ المحتوى التعليمي العربي الرقمي عالي الجودة المجاني الذي يجمع:
- قصصاً مشكّلة بمستويات قراءة
- دروساً قصيرة تفاعلية بأسئلة فهم
- ألعاباً تعليمية مرتبطة بالمنهج
- متابعة موضوعية لتقدم الطفل من قِبل الوالدين

---

## الميزات الموجودة حالياً (مؤكدة بالكود)

### المحتوى التعليمي
| الميزة | الحالة | المصدر |
|--------|--------|--------|
| 20 قصة أصلية بمستويات 1–4 | ✅ كاملة | `stories` table + migration 004 |
| قصص بمشاهد متحركة (SVG/emoji) | ✅ كاملة | `StoryScene.tsx`, `StoryReader.tsx` |
| تلوين الكلمة المقروءة | ✅ كاملة | `StoryReader.tsx` word highlighting |
| صوت TTS (يعتمد الجهاز) | ✅ جزئية | Web Speech API |
| أصوات MP3 حقيقية (edge-tts) | ⏳ بانتظار تشغيل السكريبت | `scripts/generate-story-audio.py` |
| مكتبة مفتوحة (532 قصة StoryWeaver) | ✅ كاملة | migration 010, 019 |
| 7 عوالم تعليمية | ✅ هيكل فقط | `subjects` table |
| 20 درساً بـ 59 سؤالاً | ✅ كاملة | `lessons` + `quiz_questions` |
| تسجيل صوت الطفل أثناء القراءة | ✅ كاملة | `ReadAloudRecorder.tsx` |

### الألعاب (6 ألعاب)
| اللعبة | المسار |
|--------|--------|
| أين الحرف؟ | `/games/letters` |
| عُدّ معي | `/games/counting` |
| رتّب الكلمات | `/games/words` |
| حساب سريع | `/games/math` |
| الأضداد | `/games/opposites` |
| لعبة المطابقة | `/games/matching` |

### النظام والحسابات
| الميزة | الحالة | المصدر |
|--------|--------|--------|
| تسجيل دخول الوالد (email/password) | ✅ | `auth/login` |
| تأكيد البريد الإلكتروني | ✅ | Supabase Auth |
| نسيت كلمة المرور | ✅ | `auth/forgot-password` |
| ملفات أطفال متعددة (3–12 سنة) | ✅ | `child_profiles` |
| دخول الطفل بـ PIN | ✅ | `kids/[childId]`, migration 008 |
| عزل البيانات بين الأسر (RLS) | ✅ مختبر | 13 خطوة اختبار نجحت |
| نقاط تلقائية (60%+ إتقان) | ✅ | `increment_child_points` RPC |
| شارات تلقائية | ✅ | `child_badges`, migration 007 |
| تحدي أسبوعي | ✅ | dashboard |
| إسناد قصة/درس من ولي الأمر | ✅ | migration 013 |
| لوحة رسم + تلوين | ✅ | `DrawingBoard.tsx`, `ColoringBoard.tsx` |
| لوحة إدارة المحتوى `/admin` | ✅ | `StoryEditor.tsx`, `LessonEditor.tsx` |
| تطبيق Android (Expo WebView) | ✅ هيكل جاهز | `apps/mobile` |
| PWA | ✅ | `manifest.json` |

---

## ما ينقص (غير موجود أو غير مكتمل)

| الميزة | الأولوية |
|--------|---------|
| رسومات أصلية احترافية (كل الصور إيموجي) | عالية |
| لوحة المعلمين والمدارس | متوسطة |
| إشعارات Push | متوسطة |
| Offline content caching | متوسطة |
| نظام الدفع | عند الإطلاق التجاري |
| اختبارات تلقائية (unit/e2e) | عالية |
| شخصية كارتونية رئيسية (mascot) | متوسطة |
| تقارير تفصيلية لأولياء الأمور | متوسطة |

---

## خارطة المراحل

```
Phase 0  ✅ Audit & Readiness
Phase 1  ✅ Foundation & Design System
Phase 2  ✅ Authentication & Profiles
Phase 2.5✅ Mobile WebView App
Phase 3  ✅ Learning Engine
Phase 4  ✅ Stories & Library
Phase 5  ✅ Games & Assessment
Phase 6  ✅ Parent Experience
Phase 7  ⏳ Teachers & Schools
Phase 8  ⏳ Admin CMS (Full)
Phase 9  ⏳ Mobile Native Features
Phase 10 ⏳ QA & Release
```

**نسبة الاكتمال التقديرية: ~55%** (بالوزن النسبي للمراحل)

---

## نموذج الإيرادات المقترح

حالياً: مجاني بالكامل (ميزانية صفر).  
المستقبل (من `DECISIONS.md`): اشتراك شهري/سنوي، دفع عبر فودافون كاش وإنستاباي مع رفع إيصال.
