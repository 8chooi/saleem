import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Lesson, LearningProgress, Subject } from '@/lib/learning/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
  searchParams: { child?: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `عالم ${params.slug} | سَلِيم` }
}

export default async function WorldPage({ params, searchParams }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // جلب بيانات العالم
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!subject) notFound()

  // جلب الدروس
  const { data: lessons = [] } = await supabase
    .from('lessons')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('is_active', true)
    .order('sort_order')

  // جلب الطفل المحدد (اختياري)
  let progress: LearningProgress[] = []
  let selectedChild: { id: string; name: string; emoji: string } | null = null

  if (searchParams.child) {
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id, name, emoji')
      .eq('id', searchParams.child)
      .eq('parent_id', user.id)
      .single()

    if (child) {
      selectedChild = child
      const { data: prog = [] } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('child_id', child.id)
        .in('lesson_id', (lessons ?? []).map((l: Lesson) => l.id))
      progress = prog ?? []
    }
  }

  const getProgress = (lessonId: string) =>
    progress.find((p) => p.lesson_id === lessonId)

  const completedCount = progress.filter((p) => p.status === 'completed').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="py-10 px-4 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${subject.color}dd, ${subject.color}99)` }}
      >
        <Link href="/parent" className="text-white/70 text-sm mb-4 inline-block hover:text-white">
          ← لوحة التحكم
        </Link>
        <div className="text-6xl mb-3">{subject.emoji}</div>
        <h1 className="text-3xl font-black">{subject.name_ar}</h1>
        {subject.description_ar && (
          <p className="mt-2 text-white/80 max-w-md mx-auto">{subject.description_ar}</p>
        )}
        {selectedChild && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
            <span>{selectedChild.emoji}</span>
            <span>{selectedChild.name}</span>
            <span className="bg-white/30 rounded-full px-2">
              {completedCount}/{(lessons ?? []).length} دروس
            </span>
          </div>
        )}
      </div>

      {/* Lessons Grid */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {!selectedChild && (
          <ChildSelector
            parentId={user.id}
            supabase={supabase}
            worldSlug={params.slug}
          />
        )}

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          الدروس ({(lessons ?? []).length})
        </h2>

        <div className="space-y-3">
          {(lessons ?? []).map((lesson: Lesson, idx: number) => {
            const prog = getProgress(lesson.id)
            const isCompleted = prog?.status === 'completed'
            const isInProgress = prog?.status === 'in_progress'

            return (
              <Link
                key={lesson.id}
                href={`/worlds/${params.slug}/lessons/${lesson.slug}${selectedChild ? `?child=${selectedChild.id}` : ''}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* رقم الدرس / حالته */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>

                  {/* معلومات الدرس */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">{lesson.title_ar}</div>
                    {lesson.description_ar && (
                      <div className="text-sm text-gray-500 truncate">{lesson.description_ar}</div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{lesson.duration_min} دقيقة</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{lesson.points} نقطة</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {lesson.age_group === 'all' ? 'جميع الأعمار' : `${lesson.age_group} سنة`}
                      </span>
                      {isCompleted && prog?.score !== undefined && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-green-600 font-semibold">{prog.score}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* صعوبة */}
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1, 2, 3].map((d) => (
                      <div
                        key={d}
                        className={`w-2 h-2 rounded-full ${
                          d <= lesson.difficulty ? 'bg-current' : 'bg-gray-200'
                        }`}
                        style={{ color: subject.color }}
                      />
                    ))}
                  </div>

                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// مكوّن اختيار الطفل (Server Component يعرض رابط)
async function ChildSelector({
  parentId,
  supabase,
  worldSlug,
}: {
  parentId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  worldSlug: string
}) {
  const { data: children = [] } = await supabase
    .from('child_profiles')
    .select('id, name, emoji')
    .eq('parent_id', parentId)
    .order('created_at')

  if (!children?.length) return null

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
      <p className="text-sm font-semibold text-blue-800 mb-3">اختر طفلاً لتتبع تقدمه:</p>
      <div className="flex flex-wrap gap-2">
        {children.map((child: { id: string; name: string; emoji: string }) => (
          <Link
            key={child.id}
            href={`/worlds/${worldSlug}?child=${child.id}`}
            className="flex items-center gap-2 bg-white rounded-full px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md transition-shadow"
          >
            <span>{child.emoji}</span>
            <span>{child.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
