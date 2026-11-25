import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { htmlToPlain } from '@/lib/admin/text'
import LessonEditor, { type LessonInput } from './LessonEditor'

export default async function EditLessonPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: subjects } = await supabase.from('subjects').select('id, name_ar, emoji').order('sort_order')
  if (!subjects?.length) notFound()

  if (params.id === 'new') {
    const blank: LessonInput = {
      subject_id: subjects[0].id, slug: `lesson-${Date.now().toString(36)}`, title_ar: '', description_ar: '', content: '',
      age_group: '6-8', difficulty: 1, duration_min: 5, points: 10, is_active: false,
      questions: [{ question: '', options: ['', '', ''], correct: 0, explanation: '' }],
    }
    return <LessonEditor initial={blank} subjects={subjects} />
  }

  const [{ data: l }, { data: qs }] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', params.id).single(),
    supabase.from('quiz_questions').select('question_ar, options, correct_idx, explanation_ar').eq('lesson_id', params.id).order('sort_order'),
  ])
  if (!l) notFound()

  return (
    <LessonEditor
      subjects={subjects}
      initial={{
        id: l.id, subject_id: l.subject_id, slug: l.slug, title_ar: l.title_ar, description_ar: l.description_ar ?? '',
        content: htmlToPlain(l.content_ar), age_group: l.age_group, difficulty: l.difficulty, duration_min: l.duration_min,
        points: l.points, is_active: l.is_active,
        questions: (qs ?? []).map((q) => ({
          question: q.question_ar, options: q.options as string[], correct: q.correct_idx, explanation: q.explanation_ar ?? '',
        })),
      }}
    />
  )
}
