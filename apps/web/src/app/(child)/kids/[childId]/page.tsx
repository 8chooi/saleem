import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { levelInfo } from '@/lib/stories/pages'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'عالمي | سَلِيم' }
}

type Band = '3-5' | '6-8' | '9-12'
const LEVEL_BY_AGE: Record<Band, number> = { '3-5': 1, '6-8': 2, '9-12': 3 }

interface Lesson {
  id: string
  slug: string
  title_ar: string
  age_group: string
  sort_order: number
  subject: { slug: string; name_ar: string; emoji: string; color: string } | null
}

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

  const band = (child.age_group as Band) ?? '6-8'
  const level = LEVEL_BY_AGE[band] ?? 1

  const [{ data: points }, { data: badges }, { data: reads }, { data: stories }, { data: lessons }, { data: progress }] =
    await Promise.all([
      supabase.from('child_points').select('total_points').eq('child_id', child.id).single(),
      supabase
        .from('child_badges')
        .select('earned_at, badge:badges(name_ar, emoji)')
        .eq('child_id', child.id)
        .order('earned_at', { ascending: false })
        .limit(4),
      supabase.from('story_reads').select('story_id').eq('child_id', child.id),
      supabase
        .from('stories')
        .select('id, slug, title_ar, cover_emoji, level')
        .eq('is_active', true)
        .lte('level', level + 1)
        .order('level')
        .order('sort_order'),
      supabase
        .from('lessons')
        .select('id, slug, title_ar, age_group, sort_order, subject:subjects(slug, name_ar, emoji, color)')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('learning_progress')
        .select('lesson_id, status, started_at, completed_at')
        .eq('child_id', child.id),
    ])

  const q = `?child=${child.id}`
  const readIds = new Set((reads ?? []).map((r: { story_id: string }) => r.story_id))
  const picked = (stories ?? [])
    .filter((s: { id: string }) => !readIds.has(s.id))
    .sort((a: { level: number }, b: { level: number }) => Math.abs(a.level - level) - Math.abs(b.level - level))
    .slice(0, 6)

  const allLessons = (lessons ?? []) as unknown as Lesson[]
  const done = new Set((progress ?? []).filter((p) => p.status === 'completed').map((p) => p.lesson_id))
  const inProgress = (progress ?? [])
    .filter((p) => p.status === 'in_progress')
    .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)))[0]
  const suitable = allLessons.filter((l) => l.age_group === band || l.age_group === 'all')
  const continueLesson =
    allLessons.find((l) => l.id === inProgress?.lesson_id) ??
    suitable.find((l) => !done.has(l.id)) ??
    allLessons.find((l) => !done.has(l.id))
  const challenge = suitable.find((l) => !done.has(l.id) && l.id !== continueLesson?.id)

  const worlds = new Map<string, NonNullable<Lesson['subject']> & { total: number; done: number }>()
  for (const l of allLessons) {
    if (!l.subject) continue
    const w = worlds.get(l.subject.slug) ?? { ...l.subject, total: 0, done: 0 }
    w.total++
    if (done.has(l.id)) w.done++
    worlds.set(l.subject.slug, w)
  }

  const lessonHref = (l: Lesson) => `/worlds/${l.subject?.slug}/lessons/${l.slug}${q}`
  const young = band === '3-5'

  const activities = [
    { href: `/stories${q}`, icon: '📖', label: 'اقرأ', color: 'from-green-400 to-green-600' },
    { href: `/games${q}`, icon: '🎮', label: 'العب', color: 'from-purple-400 to-purple-600' },
    { href: `/draw${q}`, icon: '🎨', label: 'ارسم', color: 'from-rose-400 to-rose-600' },
    { href: continueLesson ? lessonHref(continueLesson) : `/worlds/letters${q}`, icon: '🎓', label: 'تعلّم', color: 'from-sky-400 to-sky-600' },
    { href: `/badges${q}`, icon: '🏅', label: 'شاراتي', color: 'from-amber-400 to-amber-600' },
  ]

  const ContinueCard = continueLesson && (
    <Link
      href={lessonHref(continueLesson)}
      className="flex items-center gap-4 rounded-3xl bg-white border-2 border-sky-100 p-4 shadow-sm hover:border-sky-300 transition-colors"
    >
      <span
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
        style={{ background: `${continueLesson.subject?.color}22` }}
      >
        {continueLesson.subject?.emoji}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-bold text-sky-600">
          {inProgress?.lesson_id === continueLesson.id ? 'أكمل من حيث توقفت' : 'درسك التالي'}
        </span>
        <span className="block font-black text-gray-900 truncate">{continueLesson.title_ar}</span>
      </span>
      <span className="bg-sky-500 text-white font-bold text-sm px-4 py-2 rounded-xl shrink-0">ابدأ</span>
    </Link>
  )

  const ActivitiesGrid = (
    <section className={`grid gap-3 ${young ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-5'}`}>
      {(young ? activities.slice(0, 3) : activities).map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className={`bg-gradient-to-b ${a.color} text-white rounded-3xl flex flex-col items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-transform ${
            young ? 'p-6' : 'p-4'
          }`}
        >
          <span className={young ? 'text-6xl' : 'text-4xl sm:text-5xl'}>{a.icon}</span>
          <span className={`font-black ${young ? 'text-2xl' : 'text-lg'}`}>{a.label}</span>
        </Link>
      ))}
    </section>
  )

  const StoriesRow = (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black text-gray-900">قصص لك</h2>
        <Link href={`/stories${q}`} className="text-sm font-bold text-sky-600">كل القصص ←</Link>
      </div>
      {picked.length === 0 ? (
        <p className="text-gray-500 bg-white rounded-2xl p-6 text-center">قرأت كل القصص المناسبة لك. أحسنت! 🎉</p>
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
  )

  const WorldsGrid = (
    <section>
      <h2 className="text-xl font-black text-gray-900 mb-3">عوالم التعلّم</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from(worlds.values()).map((w) => (
          <Link
            key={w.slug}
            href={`/worlds/${w.slug}${q}`}
            className="rounded-2xl p-4 text-white hover:scale-[1.02] transition-transform"
            style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color}cc)` }}
          >
            <span className="flex items-center gap-2 font-black text-lg">
              <span className="text-3xl">{w.emoji}</span>
              {w.name_ar}
            </span>
            <span className="block mt-3 h-2 rounded-full bg-white/30 overflow-hidden">
              <span className="block h-full bg-white" style={{ width: `${(w.done / w.total) * 100}%` }} />
            </span>
            <span className="block text-xs mt-1 text-white/90">{w.done} من {w.total} دروس</span>
          </Link>
        ))}
      </div>
    </section>
  )

  const ChallengeCard = challenge && (
    <Link
      href={lessonHref(challenge)}
      className="flex items-center gap-4 rounded-3xl bg-gradient-to-l from-amber-400 to-orange-500 text-white p-5 shadow-md hover:scale-[1.01] transition-transform"
    >
      <span className="text-4xl">🎯</span>
      <span className="flex-1">
        <span className="block text-sm text-white/85 font-bold">تحدّي اليوم</span>
        <span className="block text-lg font-black">{challenge.title_ar}</span>
        <span className="block text-xs text-white/85">أجب عن أسئلة الدرس واجمع النقاط</span>
      </span>
    </Link>
  )

  const Achievements = (badges?.length ?? 0) > 0 && (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-black text-gray-900">إنجازاتي</h2>
        <Link href={`/badges${q}`} className="text-sm font-bold text-sky-600">كل الشارات ←</Link>
      </div>
      <div className="flex gap-3 flex-wrap">
        {(badges ?? []).map((b, i) => {
          const badge = b.badge as unknown as { name_ar: string; emoji: string } | null
          return (
            <span key={i} className="flex items-center gap-2 bg-white rounded-2xl border border-amber-100 px-4 py-2 shadow-sm">
              <span className="text-2xl">{badge?.emoji}</span>
              <span className="font-bold text-sm text-gray-800">{badge?.name_ar}</span>
            </span>
          )
        })}
      </div>
    </section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white" dir="rtl">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-3xl">
              {child.avatar_emoji}
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg leading-tight">أهلًا يا {child.name}</p>
              <p className="text-xs text-gray-500">{young ? 'هيّا نلعب ونتعلّم!' : 'ماذا تريد أن تتعلّم اليوم؟'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full" title="نقاطي">⭐ {points?.total_points ?? 0}</span>
            <Link href="/parent" className="text-gray-400 hover:text-gray-700 px-2 text-xs" aria-label="العودة لولي الأمر">
              👨‍👩‍👧
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-7">
        {band === '3-5' && (
          <>
            {ActivitiesGrid}
            {StoriesRow}
            {ContinueCard}
            {Achievements}
          </>
        )}
        {band === '6-8' && (
          <>
            {ContinueCard}
            {ActivitiesGrid}
            {StoriesRow}
            {WorldsGrid}
            {Achievements}
          </>
        )}
        {band === '9-12' && (
          <>
            {ContinueCard}
            {ChallengeCard}
            {WorldsGrid}
            {ActivitiesGrid}
            {StoriesRow}
            {Achievements}
          </>
        )}
      </main>
    </div>
  )
}
