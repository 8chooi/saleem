import Link from 'next/link'

export const metadata = { title: 'الألعاب | سَلِيم' }

const GAMES = [
  { href: '/games/letters', goal: 'يربط شكل الحرف بأول صوت في الكلمة', icon: 'أ ب', title: 'أين الحرف؟', desc: 'اختر الصورة التي تبدأ بالحرف', ages: '٣–٨', color: 'from-sky-400 to-sky-600' },
  { href: '/games/counting', goal: 'يعدّ الأشياء حتى ١٠ ويقرأ الأرقام', icon: '١٢٣', title: 'عُدّ معي', desc: 'عُدّ الأشياء واختر الرقم الصحيح', ages: '٣–٦', color: 'from-green-400 to-green-600' },
  { href: '/games/math', goal: 'يجمع ويطرح أعدادًا حتى ٢٠ ذهنيًا', icon: '+ −', title: 'حساب سريع', desc: 'اجمع واطرح واختر الناتج الصحيح', ages: '٦–١٠', color: 'from-orange-400 to-orange-600' },
  { href: '/games/opposites', goal: 'يوسّع مفرداته بمعرفة الكلمة وعكسها', icon: '⇄', title: 'الأضداد', desc: 'اختر الكلمة التي تعني العكس', ages: '٦–١٢', color: 'from-violet-400 to-violet-600' },
  { href: '/games/matching', goal: 'يقوّي الذاكرة ويطابق الحرف مع صورته', icon: '🃏', title: 'لعبة المطابقة', desc: 'اقلب البطاقات وطابق كل حرف مع صورته', ages: '٥–١٢', color: 'from-purple-400 to-purple-600' },
]

export default function GamesHub({ searchParams }: { searchParams: { child?: string } }) {
  const q = searchParams.child ? `?child=${searchParams.child}` : ''
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-6">
          <Link href={searchParams.child ? `/kids/${searchParams.child}` : '/parent'} className="text-sm font-bold text-purple-700">
            ← رجوع
          </Link>
          <h1 className="text-2xl font-black text-purple-800">🎮 الألعاب</h1>
          <span />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={`${g.href}${q}`}
              className={`bg-gradient-to-b ${g.color} text-white rounded-3xl p-5 shadow-md hover:scale-[1.03] active:scale-95 transition-transform`}
            >
              <div className="text-5xl mb-2 font-black leading-none h-14 flex items-center">{g.icon}</div>
              <p className="text-xl font-black">{g.title}</p>
              <p className="text-sm text-white/85 mt-1">{g.desc}</p>
              <p className="text-xs text-white mt-2 bg-white/15 rounded-lg px-2 py-1">🎯 {g.goal}</p>
              <span className="inline-block mt-3 text-xs bg-white/20 rounded-full px-2 py-0.5">الأعمار {g.ages}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
