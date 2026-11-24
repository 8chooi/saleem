'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Lesson, Subject, QuizQuestion, LearningProgress } from '@/lib/learning/types'

interface Props {
  lesson: Lesson
  subject: Subject
  questions: QuizQuestion[]
  initialProgress: LearningProgress | null
  childId: string | null
}

type Phase = 'reading' | 'quiz' | 'result'

export default function LessonClient({ lesson, subject, questions, initialProgress, childId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [phase, setPhase] = useState<Phase>(
    initialProgress?.status === 'completed' ? 'result' : 'reading'
  )
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [saving, setSaving] = useState(false)
  const [finalScore, setFinalScore] = useState(initialProgress?.score ?? 0)

  const q = questions[currentQ]
  const isLastQ = currentQ === questions.length - 1

  async function startLesson() {
    if (!childId) { setPhase('quiz'); return }
    await supabase.from('learning_progress').upsert({
      child_id: childId,
      lesson_id: lesson.id,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    }, { onConflict: 'child_id,lesson_id' })
    setPhase(questions.length > 0 ? 'quiz' : 'result')
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setShowExplanation(true)
    const updated = [...answers]
    updated[currentQ] = idx
    setAnswers(updated)
  }

  async function nextQuestion() {
    if (isLastQ) {
      await finishLesson()
    } else {
      setCurrentQ((c) => c + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  async function finishLesson() {
    setSaving(true)
    const correct = answers.filter((a, i) => a === questions[i]?.correct_idx).length
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 100
    const pointsEarned = score >= 60 ? lesson.points : Math.floor(lesson.points * score / 100)

    setFinalScore(score)

    if (childId) {
      await supabase.from('learning_progress').upsert({
        child_id: childId,
        lesson_id: lesson.id,
        status: 'completed',
        score,
        points_earned: pointsEarned,
        completed_at: new Date().toISOString(),
        attempts: (initialProgress?.attempts ?? 0) + 1,
      }, { onConflict: 'child_id,lesson_id' })

      // تحديث النقاط الإجمالية
      try {
        await supabase.rpc('increment_child_points', {
          p_child_id: childId,
          p_points: pointsEarned,
        })
      } catch {}
    }

    setSaving(false)
    setPhase('result')
  }

  // ══════════════════════════════════════════
  // Phase: reading
  // ══════════════════════════════════════════
  if (phase === 'reading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.content_ar ?? '<p>محتوى الدرس قيد الإضافة.</p>' }}
          />
        </div>

        <button
          onClick={startLesson}
          className="w-full py-4 rounded-2xl text-white font-black text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: subject.color }}
        >
          {questions.length > 0 ? '🎯 ابدأ الاختبار' : '✅ أنهيت الدرس'}
        </button>

        {!childId && (
          <p className="text-center text-sm text-gray-400 mt-3">
            اختر طفلاً من صفحة العالم لحفظ التقدم
          </p>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════
  // Phase: quiz
  // ══════════════════════════════════════════
  if (phase === 'quiz' && q) {
    const isCorrect = selected === q.correct_idx

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>سؤال {currentQ + 1} من {questions.length}</span>
            <span>{Math.round(((currentQ) / questions.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((currentQ) / questions.length) * 100}%`,
                backgroundColor: subject.color,
              }}
            />
          </div>
        </div>

        {/* السؤال */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4">
          <p className="text-xl font-bold text-gray-900 mb-6">{q.question_ar}</p>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let cls = 'w-full text-right p-4 rounded-2xl border-2 font-semibold transition-all '
              if (selected === null) {
                cls += 'border-gray-200 hover:border-gray-400 cursor-pointer text-gray-800'
              } else if (i === q.correct_idx) {
                cls += 'border-green-400 bg-green-50 text-green-800'
              } else if (i === selected && !isCorrect) {
                cls += 'border-red-400 bg-red-50 text-red-800'
              } else {
                cls += 'border-gray-100 text-gray-400'
              }

              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)}>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* شرح الإجابة */}
          {showExplanation && q.explanation_ar && (
            <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
              isCorrect ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'
            }`}>
              {isCorrect ? '🎉 ' : '💡 '}{q.explanation_ar}
            </div>
          )}
        </div>

        {selected !== null && (
          <button
            onClick={nextQuestion}
            disabled={saving}
            className="w-full py-4 rounded-2xl text-white font-black text-lg disabled:opacity-50"
            style={{ backgroundColor: subject.color }}
          >
            {saving ? 'يتم الحفظ...' : isLastQ ? '🏁 إنهاء الدرس' : 'السؤال التالي →'}
          </button>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════
  // Phase: result
  // ══════════════════════════════════════════
  const passed = finalScore >= 60
  const correctCount = answers.filter((a, i) => a === questions[i]?.correct_idx).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
      <div className="bg-white rounded-3xl shadow-sm p-8">
        <div className="text-7xl mb-4">{passed ? '🌟' : '💪'}</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          {passed ? 'أحسنت!' : 'حاول مجدداً'}
        </h2>

        {questions.length > 0 && (
          <p className="text-gray-600 mb-2">
            أجبت صح على {correctCount} من {questions.length} أسئلة
          </p>
        )}

        <div
          className="text-5xl font-black my-6"
          style={{ color: subject.color }}
        >
          {finalScore}%
        </div>

        {passed && (
          <div className="bg-yellow-50 rounded-2xl p-4 mb-6 inline-block">
            <p className="text-yellow-800 font-bold">
              🎁 كسبت {lesson.points} نقطة!
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => {
              setPhase('reading')
              setCurrentQ(0)
              setAnswers(new Array(questions.length).fill(null))
              setSelected(null)
              setShowExplanation(false)
            }}
            className="px-6 py-3 rounded-2xl bg-gray-100 font-bold text-gray-700 hover:bg-gray-200"
          >
            🔄 أعد الدرس
          </button>
          <button
            onClick={() => router.push(`/worlds/${subject.slug}${childId ? `?child=${childId}` : ''}`)}
            className="px-6 py-3 rounded-2xl text-white font-bold"
            style={{ backgroundColor: subject.color }}
          >
            → درس تالٍ
          </button>
        </div>
      </div>
    </div>
  )
}
