export const metadata = {
  title: 'شروط الاستخدام',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-black text-gray-900 mb-2">شروط الاستخدام</h1>
        <p className="text-gray-500 mb-8 text-sm">آخر تحديث: نوفمبر 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">قبول الشروط</h2>
            <p>
              باستخدامك منصة سَلِيم، فأنت توافق على هذه الشروط. إذا كنت تُسجّل حساباً لطفل،
              فأنت تؤكد أنك وليّ أمره القانوني.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">استخدام المنصة</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>المنصة مخصصة للاستخدام التعليمي الشخصي غير التجاري</li>
              <li>ممنوع مشاركة معلومات تسجيل الدخول مع أشخاص آخرين</li>
              <li>ممنوع محاولة اختراق المنصة أو إساءة استخدامها</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">المحتوى</h2>
            <p>
              جميع المحتويات على المنصة (قصص، دروس، ألعاب) محمية بحقوق الملكية الفكرية لـ 8CH – أتش
              أو مرخّصة للاستخدام. يُحظر نسخ المحتوى أو إعادة توزيعه بدون إذن.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">إنهاء الحساب</h2>
            <p>
              يمكنك إنهاء حسابك في أي وقت. نحتفظ بالحق في إيقاف الحسابات التي تنتهك هذه الشروط.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">تغيير الشروط</h2>
            <p>
              قد نُحدّث هذه الشروط من وقت لآخر. سنُعلمك بأي تغييرات جوهرية عبر البريد الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">الاتصال</h2>
            <p>
              للاستفسار:{' '}
              <a href="mailto:support@8ch.app" className="text-primary hover:underline">
                support@8ch.app
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
