export const metadata = {
  title: 'سياسة الخصوصية',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-black text-gray-900 mb-2">سياسة الخصوصية</h1>
        <p className="text-gray-500 mb-8 text-sm">آخر تحديث: نوفمبر 2026</p>

        <div className="prose prose-lg max-w-none space-y-6 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">مقدمة</h2>
            <p>
              سَلِيم | SALEEM ("المنصة") منصة تعليمية تفاعلية للأطفال مملوكة ومشغّلة من قِبَل 8CH – أتش.
              نحن نأخذ خصوصية أطفالك ومعلوماتك الشخصية على محمل الجد.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>معلومات الحساب:</strong> الاسم والبريد الإلكتروني عند التسجيل</li>
              <li><strong>ملفات الأطفال:</strong> الاسم وسنة الميلاد فقط (لا نجمع بيانات حساسة)</li>
              <li><strong>بيانات الاستخدام:</strong> الدروس المكتملة والنقاط المكتسبة</li>
              <li><strong>البيانات التقنية:</strong> نوع الجهاز ونظام التشغيل والمتصفح لأغراض تقنية فقط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">كيف نستخدم المعلومات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>تقديم الخدمة التعليمية وتتبّع التقدّم</li>
              <li>إرسال إشعارات مهمة عن الحساب (بريد إلكتروني فقط)</li>
              <li>تحسين تجربة المنصة</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">حماية بيانات الأطفال</h2>
            <p>نلتزم بما يلي:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>الوالد/الوصي هو المالك الوحيد لحساب الطفل</li>
              <li><strong>لا نبيع</strong> أي بيانات لأطراف ثالثة</li>
              <li><strong>لا إعلانات</strong> سلوكية أو مستهدفة</li>
              <li><strong>لا دردشة مفتوحة</strong> بين الأطفال</li>
              <li>يمكن للوالد حذف حساب الطفل وجميع بياناته في أي وقت</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">مشاركة المعلومات</h2>
            <p>
              لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Supabase:</strong> قاعدة البيانات والمصادقة (مزوّد تقني موثوق)</li>
              <li><strong>الالتزام القانوني:</strong> إذا طُلب قانونياً فقط</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">حقوقك</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>الوصول إلى بياناتك وتصحيحها</li>
              <li>حذف حسابك وجميع البيانات المرتبطة به</li>
              <li>الاعتراض على أي معالجة للبيانات</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">الاتصال بنا</h2>
            <p>
              لأي استفسار عن الخصوصية أو طلب حذف البيانات، تواصل معنا عبر:{' '}
              <a href="mailto:privacy@8ch.app" className="text-primary hover:underline">
                privacy@8ch.app
              </a>
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <a href="/" className="text-primary hover:underline text-sm font-semibold">
            ← العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  )
}
