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

  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name')
    .eq('parent_id', user.id)
    .order('created_at')

  const selectedChildId = searchParams.child || children?.[0]?.id
  const levelFilter = Number(searchParams.level) || 0

  let storiesQuery = supabase
    .from('stories')
    .select('id, slug, title_ar, summary_ar, cover_emoji, age_group, read_time_min, level')
    .eq('is_active', true)
    .order('level')
    .order('sort_order')

  if (levelFilter) {
    storiesQuery = storiesQuery.eq('level', levelFilter)
  }

  const { data: stories } = await storiesQuery
  const { data: storyReads } = selectedChildId
    ? await supabase
        .from('story_reads')
        .select('story_id')
        .eq('child_id', selectedChildId)
    : { data: [] }

  const readStoryIds = new Set((storyReads || []).map((r: StoryRead) => r.story_id))

  const levelHref = (level: number) => {
    const q = new URLSearchParams()
    if (selectedChildId) q.set('child', selectedChildId)
    if (level) q.set('level', String(level))
    const qs = q.toString()
    return `/stories${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={selectedChildId ? `/kids/${selectedChildId}` : '/parent'} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
            ← عالمي
          </Link>
          <h1 className="text-xl font-bold text-purple-800">📚 مكتبة القصص</h1>
          <span className="text-sm text-gray-500">{stories?.length || 0} قصة</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Child Selector */}
        {children && children.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {children.map((child: { id: string; name: string }) => (
              <Link
                key={child.id}
                href={`/stories?child=${child.id}${levelFilter ? `&level=${levelFilter}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedChildId === child.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Level Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[{ value: 0, label: 'كل المستويات' }, ...LEVELS].map((lv) => (
            <Link
              key={lv.value}
              href={levelHref(lv.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                levelFilter === lv.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              {lv.value ? `المستوى ${lv.value}: ${lv.label}` : lv.label}
            </Link>
          ))}
        </div>

        {/* Stories Grid */}
        {!stories || stories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-lg">لا توجد قصص متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stories.map((story: Story) => {
              const isRead = readStoryIds.has(story.id)
              return (
                <Link
                  key={story.id}
                  href={`/stories/${story.slug}${selectedChildId ? `?child=${selectedChildId}` : ''}`}
                  className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5 hover:shadow-md hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{story.cover_emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                          {story.title_ar}
                        </h2>
                        {isRead && <span className="text-green-500 text-sm">✓</span>}
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{story.summary_ar}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className={`px-2 py-0.5 rounded-full ${levelInfo(story.level).color}`}>
                          المستوى {story.level}: {levelInfo(story.level).label}
                        </span>
                        <span>⏱ {story.read_time_min} دقائق</span>
                        {isRead && <span className="text-green-500 font-medium">تمت القراءة</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
