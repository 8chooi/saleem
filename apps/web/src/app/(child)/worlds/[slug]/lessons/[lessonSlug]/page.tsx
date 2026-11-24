import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'
import LessonClient from './LessonClient'
import type { Lesson, Subject, QuizQuestion, LearningProgress } from '@/lib/learning/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string; lessonSlug: string }
  searchParams: { child?: string }
}

export async function generateMetadata({ params }: Props) {
  return { title: `درس | سَلِيم` }
}

export default async function LessonPage({ params, searchParams }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // جلب العالم
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!subject) notFound()

  // جلب الدرس
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('slug', params.lessonSlug)
    .eq('is_active', true)
    .single()

  if (!lesson) notFound()

  // جلب أسئلة الاختبار
  const { data: questions = [] } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('sort_order')

  // جلب التقدم الحالي
  let progress: LearningProgress | null = null
  let childId: string | null = null

  if (searchParams.child) {
    const { data: child } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('id', searchParams.child)
      .eq('parent_id', user.id)
      .single()

    if (child) {
      childId = child.id
      const { data: prog } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('child_id', child.id)
        .eq('lesson_id', lesson.id)
        .single()
      progress = prog ?? null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="py-6 px-4 text-white"
        style={{ background: `linear-gradient(135deg, ${subject.color}dd, ${subject.color}99)` }}
      >
        <div className="container mx-auto max-w-2xl">
          <Link
            href={`/worlds/${params.slug}${childId ? `?child=${childId}` : ''}`}
            className="text-white/70 text-sm hover:text-white inline-flex items-center gap-1 mb-3"
          >
            <span>←</span> {subject.emoji} {subject.name_ar}
          </Link>
          <h1 className="text-2xl font-black">{lesson.title_ar}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
            <span>⏱ {lesson.duration_min} دقيقة</span>
            <span>⭐ {lesson.points} نقطة</span>
            <span>👶 {lesson.age_group === 'all' ? 'جميع الأعمار' : `${lesson.age_group} سنة`}</span>
          </div>
        </div>
      </div>

      {/* محتوى الدرس والاختبار */}
      <LessonClient
        lesson={lesson as Lesson}
        subject={subject as Subject}
        questions={(questions ?? []) as QuizQuestion[]}
        initialProgress={progress}
        childId={childId}
      />
    </div>
  )
}
