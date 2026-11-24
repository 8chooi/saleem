import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { levelInfo } from '@/lib/stories/pages'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'عالمي | سَلِيم' }
}

const LEVEL_BY_AGE: Record<string, number> = { '3-5': 1, '6-8': 2, '9-12': 3 }

export default async function KidHomePage({ params }: { params: { childId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: child } = await supabase
    .from('child_profiles')
    .select('id, name, avatar_emoji, age_group')
    .eq('id', params.childId)
    .eq('parent_id', user.id)
    .single()
  if (!child) notFound()

  const level = LEVEL_BY_AGE[child.age_group] ?? 1

  const [{ data: points }, { count: badgesCount }, { data: reads }, { data: stories }, { data: subjects }] =
    await Promise.all([
      supabase.from('child_points').select('total_points').eq('child_id', child.id).single(),
      supabase.from('child_badges').select('*', { count: 'exact', head: true }).eq('child_id', child.id),
      supabase.from('story_reads').select('story_id').eq('child_id', child.id),
      supabase
        .from('stories')
        .select('id, slug, title_ar, cover_emoji, level')
        .eq('is_active', true)
        .lte('level', level + 1)
        .order('level')
        .order('sort_order'),
      supabase.from('subjects').select('slug, name_ar, emoji, color').eq('is_active', true).order('sort_order'),
    ])

  const readIds = new Set((reads ?? []).map((r: { story_id: string }) => r.story_id))
  const picked = (stories ?? [])
    .filter((s: { id: string; level: number }) => !readIds.has(s.id))
    .sort((a: { level: number }, b: { level: number }) => Math.abs(a.level - level) - Math.abs(b.level - level))
    .slice(0, 6)

  const q = `?child=${child.id}`
  const activities = [
    { href: `/stories${q}`, icon: '📖', label: 'اقرأ', color: 'from-green-400 to-green-600' },
    { href: `/worlds/letters${q}`, icon: '🎓', label: 'تعلّم', color: 'from-sky-400 to-sky-600' },
    { href: `/games/matching${q}`, icon: '🎮', label: 'العب', color: 'from-purple-400 to-purple-600' },
    { href: `/draw${q}`, icon: '🎨', label: 'ارسم', color: 'from-rose-400 to-rose-600' },
    { href: `/badges${q}`, icon: '🏅', label: 'شاراتي', color: 'from-amber-400 to-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white" dir="rtl">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-3xl">
              {child.avatar_emoji}
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg leading-tight">أهلًا {child.name}</p>
              <p className="text-xs text-gray-500">ماذا تريد أن تفعل اليوم؟</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">⭐ {points?.total_points ?? 0}</span>
            <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full">🏅 {badgesCount ?? 0}</span>
            <Link href="/parent" className="text-gray-400 hover:text-gray-700 px-2" aria-label="لوحة ولي الأمر">
              👨‍👩‍👧
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <section className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {activities.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className={`bg-gradient-to-b ${a.color} text-white rounded-3xl p-4 flex flex-col items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-transform`}
            >
              <span className="text-4xl sm:text-5xl">{a.icon}</span>
              <span className="font-black text-lg">{a.label}</span>
            </Link>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-gray-900">اخترنا لك</h2>
            <Link href={`/stories${q}`} className="text-sm font-bold text-sky-600">كل القصص ←</Link>
          </div>
          {picked.length === 0 ? (
            <p className="text-gray-500 bg-white rounded-2xl p-6 text-center">
              قرأت كل القصص المناسبة لك. أحسنت! 🎉
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
              {picked.map((s: { id: string; slug: string; title_ar: string; cover_emoji: string; level: number }) => (
                <Link
                  key={s.id}
                  href={`/stories/${s.slug}${q}`}
                  className="snap-start shrink-0 w-36 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center hover:shadow-md transition-shadow"
                >
                  <div className="h-24 rounded-xl bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center text-5xl mb-2">
                    {s.cover_emoji}
                  </div>
                  <p className="font-bold text-sm text-gray-800 line-clamp-2 min-h-[2.5rem]">{s.title_ar}</p>
                  <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full ${levelInfo(s.level).color}`}>
                    {levelInfo(s.level).label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-black text-gray-900 mb-3">عوالم التعلّم</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(subjects ?? []).map((s: { slug: string; name_ar: string; emoji: string; color: string }) => (
              <Link
                key={s.slug}
                href={`/worlds/${s.slug}${q}`}
                className="rounded-2xl p-4 text-white font-black flex items-center gap-2 hover:scale-[1.03] transition-transform"
                style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)` }}
              >
                <span className="text-3xl">{s.emoji}</span>
                {s.name_ar}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
