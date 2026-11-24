import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const worlds = [
  { slug: 'letters',    icon: '🌙', label: 'عالَم الحروف',  color: 'from-orange-400 to-amber-500',   bg: 'bg-orange-50' },
  { slug: 'numbers',   icon: '🔢', label: 'عالَم الأعداد', color: 'from-green-400 to-emerald-500',  bg: 'bg-green-50' },
  { slug: 'science',   icon: '🔭', label: 'عالَم العلوم',  color: 'from-blue-400 to-sky-500',       bg: 'bg-blue-50' },
  { slug: 'languages', icon: '🌍', label: 'عالَم اللغات',  color: 'from-purple-400 to-violet-500',  bg: 'bg-purple-50' },
  { slug: 'thinking',  icon: '🧩', label: 'عالَم التفكير', color: 'from-pink-400 to-rose-500',      bg: 'bg-pink-50' },
  { slug: 'creativity',icon: '🎨', label: 'عالَم الإبداع', color: 'from-yellow-400 to-orange-400',  bg: 'bg-yellow-50' },
  { slug: 'knowledge', icon: '🌟', label: 'عالَم المعرفة', color: 'from-indigo-400 to-blue-500',    bg: 'bg-indigo-50' },
]

const features = [
  { icon: '📖', title: 'قصص تفاعلية', desc: 'مئات القصص المصوّرة والمسموعة لجميع الأعمار' },
  { icon: '🎮', title: 'ألعاب تعليمية', desc: 'ألعاب مصمّمة لتنمية المهارات بطريقة ممتعة' },
  { icon: '🏆', title: 'نظام النقاط والشارات', desc: 'تحفيز حقيقي يشجّع الأطفال على الاستمرار' },
  { icon: '👨‍👩‍👧', title: 'لوحة الوالدين', desc: 'تتبّع تقدّم طفلك ومراقبة وقت الشاشة بسهولة' },
  { icon: '🏫', title: 'بوابة المعلمين', desc: 'أدوات خاصة للمعلمين لمتابعة الطلاب وإنشاء الفصول' },
  { icon: '📱', title: 'يعمل على كل الأجهزة', desc: 'جوال، تابلت، أو حاسوب — بدون تحميل تطبيق' },
]

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary font-semibold text-sm px-4 py-2 rounded-full mb-6">
              <span>🎉</span>
              <span>منصة تعليمية مجانية بالكامل</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
              عالَم تعليميّ
              <span className="text-primary block">لا حدود له</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
              سَلِيم — منصة تعليمية تفاعلية للأطفال من ٣ إلى ١٢ سنة.
              قصص، ألعاب، دروس، وعوالم ممتعة. مجانية بالكامل.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 font-bold text-lg px-8 py-4 rounded-2xl min-h-[60px] bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transition-all"
              >
                ابدأ مجاناً الآن 🚀
              </Link>
              <Link
                href="/#worlds"
                className="inline-flex items-center justify-center gap-2 font-bold text-lg px-8 py-4 rounded-2xl min-h-[60px] border-2 border-primary text-primary hover:bg-primary-light transition-all"
              >
                استكشف العوالم
              </Link>
            </div>
            <p className="mt-5 text-sm text-gray-400">لا بطاقة بنكية — لا إعلانات — لا حدود</p>
          </div>
        </section>

        {/* Worlds */}
        <section id="worlds" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                ٧ عوالم تعليمية
              </h2>
              <p className="text-gray-500 text-lg">كل عالَم رحلة تعلّم كاملة</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {worlds.map((w) => (
                <Link
                  key={w.slug}
                  href={`/worlds/${w.slug}`}
                  className={`${w.bg} rounded-3xl p-5 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${w.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                    {w.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 text-center leading-tight">{w.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">لماذا سَلِيم؟</h2>
              <p className="text-gray-500 text-lg">كل ما يحتاجه طفلك في مكان واحد</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              ابدأ رحلة التعلّم اليوم
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-md mx-auto">
              انضم لآلاف الأسر التي تثق بسَلِيم في تعليم أطفالها
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 font-bold text-lg px-10 py-4 rounded-2xl min-h-[60px] bg-white text-primary hover:bg-blue-50 shadow-lg transition-all"
            >
              إنشاء حساب مجاني ✨
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
