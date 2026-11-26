import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { levelInfo, LEVELS } from '@/lib/stories/pages'
import ChildPageHeader from '@/components/layout/ChildPageHeader'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'المكتبة | سَلِيم' }

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
  audio_url: string | null
}

const LEVEL_COLORS: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#bbf7d0', text: '#166534', label: 'المستوى ١' },
  2: { bg: '#bfdbfe', text: '#1e40af', label: 'المستوى ٢' },
  3: { bg: '#fde68a', text: '#92400e', label: 'المستوى ٣' },
  4: { bg: '#fecaca', text: '#991b1b', label: 'المستوى ٤' },
  5: { bg: '#e9d5ff', text: '#6b21a8', label: 'المستوى ٥' },
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
    .select('sw_id, slug, title, level, credits, cover_path, audio_url', { count: 'exact' })
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
    <div className="min-h-screen" dir="rtl"
      style={{background:'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)'}}>

      {/* Header */}
      <ChildPageHeader
        backHref={searchParams.child ? `/kids/${searchParams.child}` : '/parent'}
        title="🌍 مكتبة القصص"
        count={total}
        countLabel="قصة"
      />

      <div className="max-w-5xl mx-auto px-4 py-5">
        {/* Search */}
        <form action="/library" className="flex gap-2 mb-5">
          {searchParams.child && <input type="hidden" name="child" value={searchParams.child} />}
          {level > 0 && <input type="hidden" name="level" value={level} />}
          <input name="q" defaultValue={q} placeholder="🔍 ابحث عن قصة..."
            className="flex-1 rounded-2xl border-2 border-purple-100 px-4 py-3 bg-white font-bold text-gray-800 focus:outline-none focus:border-purple-400"
          />
          <button className="text-white font-black px-5 rounded-2xl shrink-0"
            style={{background:'#7c3aed',boxShadow:'0 4px 0 #5b21b6'}}>
            بحث
          </button>
        </form>

        {/* Level filters */}
        <div className="mb-5 flex gap-2 flex-wrap">
          {[{ value: 0, label: 'الكل' }, ...LEVELS].map((lv) => (
            <Link key={lv.value} href={href({ level: lv.value || undefined })}
              className="px-4 py-2 rounded-2xl text-sm font-black transition-all"
              style={level === lv.value
                ? {background:'#7c3aed',color:'white',boxShadow:'0 4px 0 #5b21b6'}
                : {background:'white',color:'#7c3aed',border:'2px solid #e9d5ff'}}>
              {lv.value ? `المستوى ${lv.value}` : lv.label}
            </Link>
          ))}
        </div>

        {!books?.length ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500 font-bold">لا توجد قصص مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((b: Book) => {
              const readerHref = `/library/${b.slug}${searchParams.child ? `?child=${searchParams.child}` : ''}`
              const lvl = b.level ?? 1
              const lc = LEVEL_COLORS[lvl] ?? LEVEL_COLORS[1]
              return (
                <a key={b.sw_id} href={readerHref}
                  className="bg-white rounded-3xl overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-transform"
                  style={{boxShadow:'0 5px 0 #e9d5ff',border:'2px solid #f3e8ff'}}>
                  <div className="aspect-square overflow-hidden"
                    style={{background:'linear-gradient(135deg,#f5f3ff,#ede9fe)'}}>
                    {b.cover_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={COVER(b.cover_path)} alt={b.title} loading="lazy"
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <p className="font-black text-gray-900 leading-snug line-clamp-2 text-sm">{b.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {b.level && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                          style={{background:lc.bg,color:lc.text}}>
                          {lc.label}
                        </span>
                      )}
                      {b.audio_url && (
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full"
                          style={{background:'#dcfce7',color:'#166534'}}>
                          🔊 صوت
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-1">
                      <span className="block w-full text-center text-white text-sm font-black py-2 rounded-xl"
                        style={{background:'#7c3aed',boxShadow:'0 3px 0 #5b21b6'}}>
                        اقرأ
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            {page > 1 && (
              <Link href={href({ page: page - 1 })}
                className="px-5 py-2.5 rounded-2xl bg-white font-black text-purple-700"
                style={{border:'2px solid #e9d5ff',boxShadow:'0 3px 0 #e9d5ff'}}>
                → السابق
              </Link>
            )}
            <span className="text-sm font-bold text-gray-600 bg-white px-4 py-2.5 rounded-2xl"
              style={{border:'2px solid #e9d5ff'}}>
              {page} / {pages}
            </span>
            {page < pages && (
              <Link href={href({ page: page + 1 })}
                className="px-5 py-2.5 rounded-2xl bg-white font-black text-purple-700"
                style={{border:'2px solid #e9d5ff',boxShadow:'0 3px 0 #e9d5ff'}}>
                التالي ←
              </Link>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-10 leading-relaxed">
          قصص المكتبة من{' '}
          <a href="https://storyweaver.org.in" target="_blank" rel="noopener noreferrer" className="underline">StoryWeaver</a>{' '}
          (Pratham Books) برخصة{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.ar" target="_blank" rel="noopener noreferrer" className="underline">CC BY 4.0</a>.
        </p>
      </div>
    </div>
  )
}
