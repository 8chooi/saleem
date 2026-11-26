import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { levelInfo, LEVELS } from '@/lib/stories/pages'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'المكتبة المفتوحة | سَلِيم' }

const PER_PAGE = 48
const COVER = (path: string) => {
  const [id, file] = path.split('/')
  return `https://storage.googleapis.com/static.storyweaver.org.in/illustration_crops/${id}/size3/${file}`
}

interface Book {
  sw_id: number
  slug: string
  title: string
  level: number | null
  credits: string[]
  cover_path: string | null
}

function creditLine(credits: string[]) {
  if (credits.length === 3) return `تأليف: ${credits[0]} · رسم: ${credits[1]} · ترجمة: ${credits[2]}`
  return credits.join(' · ')
}

export default async function OpenLibraryPage({
  searchParams,
}: {
  searchParams: { level?: string; q?: string; page?: string; child?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const level = Number(searchParams.level) || 0
  const q = (searchParams.q ?? '').trim()
  const page = Math.max(1, Number(searchParams.page) || 1)

  let query = supabase
    .from('open_library')
    .select('sw_id, slug, title, level, credits, cover_path', { count: 'exact' })
    .order('level', { nullsFirst: false })
    .order('sw_id')
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
  if (level) query = query.eq('level', level)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: books, count } = await query
  const total = count ?? 0
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))

  const href = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams()
    const next = { level: level || undefined, q: q || undefined, page: undefined, child: searchParams.child, ...patch }
    Object.entries(next).forEach(([k, v]) => v !== undefined && v !== '' && v !== 0 && p.set(k, String(v)))
    const s = p.toString()
    return `/library${s ? `?${s}` : ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" dir="rtl">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link
            href={searchParams.child ? `/kids/${searchParams.child}` : '/parent'}
            className="text-emerald-700 text-sm font-medium"
          >
            ← رجوع
          </Link>
          <h1 className="text-xl font-black text-emerald-800">🌍 المكتبة المفتوحة</h1>
          <span className="text-sm text-gray-500">{total} قصة</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <form action="/library" className="flex gap-2 mb-4">
          {searchParams.child && <input type="hidden" name="child" value={searchParams.child} />}
          {level > 0 && <input type="hidden" name="level" value={level} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث باسم القصة"
            className="flex-1 rounded-xl border border-emerald-200 px-4 py-2.5 bg-white"
          />
          <button className="bg-emerald-600 text-white font-bold px-5 rounded-xl">بحث</button>
        </form>

        <div className="mb-6 flex gap-2 flex-wrap">
          {[{ value: 0, label: 'كل المستويات' }, ...LEVELS].map((lv) => (
            <Link
              key={lv.value}
              href={href({ level: lv.value || undefined })}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                level === lv.value ? 'bg-emerald-600 text-white' : 'bg-white border border-emerald-200 text-emerald-700'
              }`}
            >
              {lv.value ? `المستوى ${lv.value}` : lv.label}
            </Link>
          ))}
        </div>

        {!books?.length ? (
          <p className="text-center text-gray-500 py-16">لا توجد قصص مطابقة.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((b: Book) => {
              const readerHref = `/library/${b.slug}${searchParams.child ? `?child=${searchParams.child}` : ''}`
              const swSource = `https://storyweaver.org.in/en/stories/${b.sw_id}-${b.slug}`
              return (
                <div key={b.sw_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <a href={readerHref} className="block aspect-square bg-emerald-50">
                    {b.cover_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={COVER(b.cover_path)} alt={b.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                    )}
                  </a>
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <p className="font-bold text-gray-900 leading-snug line-clamp-2">{b.title}</p>
                    {b.level && (
                      <span className={`self-start text-[11px] px-2 py-0.5 rounded-full ${levelInfo(b.level).color}`}>
                        المستوى {b.level}
                      </span>
                    )}
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3" dir="auto">
                      {creditLine(b.credits)}
                    </p>
                    <div className="mt-auto flex gap-2 pt-1">
                      <a
                        href={readerHref}
                        className="flex-1 text-center bg-emerald-600 text-white text-sm font-bold py-2 rounded-xl"
                      >
                        اقرأ
                      </a>
                      <a
                        href={swSource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center border border-emerald-300 text-emerald-700 text-sm font-bold py-2 rounded-xl"
                        title="التحميل من صفحة القصة الأصلية"
                      >
                        تحميل
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className="px-4 py-2 rounded-xl bg-white border font-bold">→ السابق</Link>
            )}
            <span className="text-sm text-gray-600">صفحة {page} من {pages}</span>
            {page < pages && (
              <Link href={href({ page: page + 1 })} className="px-4 py-2 rounded-xl bg-white border font-bold">التالي ←</Link>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-10 leading-relaxed">
          قصص هذه المكتبة من{' '}
          <a href="https://storyweaver.org.in" target="_blank" rel="noopener noreferrer" className="underline">StoryWeaver</a>{' '}
          (Pratham Books)، ومنشورة برخصة{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.ar" target="_blank" rel="noopener noreferrer" className="underline">
            المشاع الإبداعي نسب المصنف 4.0 (CC BY 4.0)
          </a>
          . حقوق كل قصة لمؤلفيها ورساميها ومترجميها المذكورين.
        </p>
      </div>
    </div>
  )
}
