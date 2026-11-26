import Link from 'next/link'

export const metadata = { title: 'الألعاب | سَلِيم' }

const GAMES = [
  { href: '/games/letters',  icon: 'أ ب', title: 'أين الحرف؟',     desc: 'اختر الصورة التي تبدأ بالحرف', ages: '٣–٨',  color: '#0ea5e9', shadow: '#0369a1' },
  { href: '/games/counting', icon: '١٢٣', title: 'عُدّ معي',        desc: 'عُدّ الأشياء واختر الرقم',     ages: '٣–٦',  color: '#22c55e', shadow: '#15803d' },
  { href: '/games/words',    icon: '🔤',  title: 'رتّب الكلمات',   desc: 'رتّب الكلمات لتكوّن جملة',     ages: '٥–١٢', color: '#f59e0b', shadow: '#b45309' },
  { href: '/games/math',     icon: '+ −', title: 'حساب سريع',       desc: 'اجمع واطرح واختر الناتج',      ages: '٦–١٠', color: '#f97316', shadow: '#c2410c' },
  { href: '/games/opposites',icon: '⇄',   title: 'الأضداد',          desc: 'اختر الكلمة التي تعني العكس',  ages: '٦–١٢', color: '#8b5cf6', shadow: '#6d28d9' },
  { href: '/games/matching', icon: '🃏',  title: 'لعبة المطابقة',  desc: 'طابق الحرف مع صورته',           ages: '٥–١٢', color: '#ec4899', shadow: '#be185d' },
]

export default function GamesHub({ searchParams }: { searchParams: { child?: string } }) {
  const q = searchParams.child ? `?child=${searchParams.child}` : ''

  return (
    <div className="min-h-screen" dir="rtl"
      style={{background:'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)'}}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3"
        style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(12px)',boxShadow:'0 2px 20px rgba(124,58,237,0.1)'}}>
        <Link href={searchParams.child ? `/kids/${searchParams.child}` : '/parent'}
          className="text-purple-600 font-black text-sm px-3 py-2 rounded-xl"
          style={{background:'rgba(124,58,237,0.1)'}}>
          ← رجوع
        </Link>
        <h1 className="text-lg font-black text-purple-900">🎮 الألعاب</h1>
        <span />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <p className="text-center text-gray-500 font-bold mb-6">اختر لعبة وابدأ!</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={`${g.href}${q}`}
              className="rounded-3xl text-white p-5 flex flex-col gap-2 active:translate-y-1 active:shadow-none transition-all"
              style={{background:g.color, boxShadow:`0 6px 0 ${g.shadow}`}}
            >
              <div className="text-4xl font-black leading-none h-12 flex items-center">{g.icon}</div>
              <p className="text-lg font-black leading-tight">{g.title}</p>
              <p className="text-xs text-white/80 leading-snug">{g.desc}</p>
              <span className="self-start mt-1 text-[11px] font-bold bg-white/20 rounded-full px-2 py-0.5">
                {g.ages} سنة
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
