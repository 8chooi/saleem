import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LEVELS, levelInfo } from '@/lib/stories/pages'

interface Story {
  id: string
  slug: string
  title_ar: string
  summary_ar: string
  cover_emoji: string
  age_group: string
  read_time_min: number
  level: number
  quiz: unknown[] | null
}

interface StoryRead {
  story_id: string
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: { child?: string; level?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const levelFilter = Number(searchParams.level) || 0

  const [{ data: children }, { data: allStories }] = await Promise.all([
    supabase
      .from('child_profiles')
      .select('id, name')
      .eq('parent_id', user.id)
      .order('created_at'),
    supabase
      .from('stories')
      .select('id, slug, title_ar, summary_ar, cover_emoji, age_group, read_time_min, level, quiz')
      .eq('is_active', true)
      .order('level')
      .order('sort_order'),
  ])

  const selectedChildId = searchParams.child || children?.[0]?.id

  const { data: storyReads } = selectedChildId
    ? await supabase
        .from('story_reads')
        .select('story_id')
        .eq('child_id', selectedChildId)
    : { data: [] }

  const readStoryIds = new Set((storyReads || []).map((r: StoryRead) => r.story_id))

  // فصل القصص: بصوت (عندها quiz) ← بقسم المستويات
  //             بدون صوت (بدون quiz) ← قسم "قراءة فقط"
  const storiesWithAudio = (allStories || []).filter((s: Story) =>
    Array.isArray(s.quiz) && s.quiz.length > 0
  )
  const storiesReadOnly = (allStories || []).filter((s: Story) =>
    !s.quiz || (s.quiz as unknown[]).length === 0
  )

  // فلتر المستوى يطبّق فقط على قسم "بصوت"
  const displayedAudio = levelFilter
    ? storiesWithAudio.filter((s: Story) => s.level === levelFilter)
    : storiesWithAudio

  const levelHref = (level: number) => {
    const q = new URLSearchParams()
    if (selectedChildId) q.set('child', selectedChildId)
    if (level) q.set('level', String(level))
    const qs = q.toString()
    return `/stories${qs ? `?${qs}` : ''}`
  }

  const StoryCard = ({ story }: { story: Story }) => {
    const isRead = readStoryIds.has(story.id)
    return (
      <Link
        href={`/stories/${story.slug}${selectedChildId ? `?child=${selectedChildId}` : ''}`}
        className="bg-white rounded-2xl border border-purple-100 p-5 hover:shadow-md hover:border-purple-300 transition-all group"
        style={{ boxShadow: '0 3px 0 #ede9fe' }}
      >
        <div className="flex items-start gap-4">
          <div className="text-5xl">{story.cover_emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-black text-gray-800 group-hover:text-purple-700 transition-colors leading-snug">
                {story.title_ar}
              </h2>
              {isRead && <span className="text-green-500 text-sm shrink-0">✓</span>}
            </div>
            {story.summary_ar && (
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{story.summary_ar}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
              <span className={`px-2 py-0.5 rounded-full font-bold ${levelInfo(story.level).color}`}>
                المستوى {story.level}
              </span>
              <span>⏱ {story.read_time_min} د</span>
              {isRead && <span className="text-green-500 font-bold">تمت القراءة</span>}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)' }} dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', boxShadow: '0 2px 20px rgba(124,58,237,0.1)' }}>
        <Link
          href={selectedChildId ? `/kids/${selectedChildId}` : '/parent'}
          className="text-purple-600 font-black text-sm px-3 py-2 rounded-xl"
          style={{ background: 'rgba(124,58,237,0.1)' }}>
          ← رجوع
        </Link>
        <h1 className="text-lg font-black text-purple-900">📚 مكتبة القصص</h1>
        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
          {(allStories || []).length} قصة
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Child Selector */}
        {children && children.length > 1 && (
          <div className="mb-5 flex gap-2 flex-wrap">
            {children.map((child: { id: string; name: string }) => (
              <Link
                key={child.id}
                href={`/stories?child=${child.id}${levelFilter ? `&level=${levelFilter}` : ''}`}
                className="px-4 py-2 rounded-2xl text-sm font-black transition-all"
                style={selectedChildId === child.id
                  ? { background: '#7c3aed', color: 'white', boxShadow: '0 3px 0 #5b21b6' }
                  : { background: 'white', color: '#7c3aed', border: '2px solid #e9d5ff' }}>
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* ═══ قسم ١: قصص بصوت + مستويات ═══ */}
        {storiesWithAudio.length > 0 && (
          <section className="mb-10">
            {/* عنوان القسم */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-purple-100" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm text-purple-700"
                style={{ background: 'rgba(124,58,237,0.08)', border: '2px solid #e9d5ff' }}>
                🔊 قصص بصوت وتمارين
              </div>
              <div className="flex-1 h-px bg-purple-100" />
            </div>

            {/* فلتر المستوى */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {[{ value: 0, label: 'الكل' }, ...LEVELS].map((lv) => (
                <Link
                  key={lv.value}
                  href={levelHref(lv.value)}
                  className="px-4 py-2 rounded-2xl text-sm font-black transition-all"
                  style={levelFilter === lv.value
                    ? { background: '#7c3aed', color: 'white', boxShadow: '0 3px 0 #5b21b6' }
                    : { background: 'white', color: '#7c3aed', border: '2px solid #e9d5ff' }}>
                  {lv.value ? `المستوى ${lv.value}` : lv.label}
                </Link>
              ))}
            </div>

            {displayedAudio.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">🔍</p>
                <p>لا توجد قصص في هذا المستوى</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayedAudio.map((story: Story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══ قسم ٢: قصص للقراءة فقط ═══ */}
        {storiesReadOnly.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-amber-100" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm text-amber-700"
                style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid #fde68a' }}>
                📖 قصص للقراءة وتسجيل الصوت
              </div>
              <div className="flex-1 h-px bg-amber-100" />
            </div>

            <p className="text-xs text-gray-500 text-center mb-4">
              اقرأ القصة بصوتك وسجّل نفسك
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {storiesReadOnly.map((story: Story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {!allStories || allStories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-lg font-bold">لا توجد قصص متاحة</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
