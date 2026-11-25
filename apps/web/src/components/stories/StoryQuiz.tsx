'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { shuffle } from '@/lib/games/save'

export interface QuizItem {
  q: string
  options: string[]
  correct: number
}

function say(text: string) {
  if (!('speechSynthesis' in window)) return
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('ar'))
  if (!v) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = v
  u.lang = v.lang
  u.rate = 0.85
  window.speechSynthesis.speak(u)
}

export default function StoryQuiz({
  quiz,
  storyId,
  childId,
  onPassed,
}: {
  quiz: QuizItem[]
  storyId: string
  childId: string
  onPassed: () => void
}) {
  const [order, setOrder] = useState<number[][]>([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // ترتيب الاختيارات عشوائي في المتصفح فقط، ونرسل رقم الاختيار الأصلي للتصحيح
  const reset = () => {
    setOrder(quiz.map((item) => shuffle(item.options.map((_, i) => i))))
    setIdx(0)
    setAnswers([])
    setScore(null)
    setError('')
  }
  useEffect(reset, [quiz]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (all: number[]) => {
    setBusy(true)
    const { data, error: e } = await createClient().rpc('submit_story_quiz', {
      p_child_id: childId,
      p_story_id: storyId,
      p_answers: all,
    })
    setBusy(false)
    if (e) return setError('تعذّر حفظ الإجابات. حاول مرة أخرى.')
    setScore(data as number)
    if ((data as number) >= 60) onPassed()
  }

  const choose = (original: number) => {
    const next = [...answers, original]
    setAnswers(next)
    if (idx < quiz.length - 1) setIdx(idx + 1)
    else submit(next)
  }

  if (!quiz.length) {
    return score === null ? (
      <div className="text-center mb-4">
        <button onClick={() => submit([])} disabled={busy} className="bg-green-500 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50">
          ✅ أنهيت القصة
        </button>
      </div>
    ) : null
  }
  if (!order.length) return null

  if (score !== null) {
    const passed = score >= 60
    const correct = Math.round((score / 100) * quiz.length)
    return (
      <div className={`rounded-3xl p-6 text-center mb-4 ${passed ? 'bg-green-50 border-2 border-green-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
        <div className="text-5xl mb-2">{passed ? '🌟' : '💪'}</div>
        <p className="text-xl font-black text-gray-900">{passed ? 'أحسنت! فهمت القصة' : 'اقرأ القصة مرة أخرى وحاول'}</p>
        <p className="text-gray-600 mt-1">أجبت صح على {correct} من {quiz.length}</p>
        {!passed && (
          <button onClick={reset} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl">حاول مرة أخرى</button>
        )}
      </div>
    )
  }

  const item = quiz[idx]
  return (
    <div className="bg-white rounded-3xl shadow-sm border-2 border-sky-100 p-5 mb-4">
      <div className="flex items-center justify-between mb-3 text-sm font-bold text-sky-700">
        <span>هل فهمت القصة؟</span>
        <span>سؤال {idx + 1} من {quiz.length}</span>
      </div>
      <p className="text-xl font-black text-gray-900 text-center mb-2">{item.q}</p>
      <button onClick={() => say(item.q)} className="block mx-auto mb-4 text-sm font-bold text-gray-500">🔊 اسمع السؤال</button>
      <div className="grid gap-2">
        {order[idx].map((original) => (
          <button
            key={original}
            disabled={busy}
            onClick={() => choose(original)}
            className="rounded-2xl border-2 border-gray-100 bg-gray-50 hover:border-sky-300 px-4 py-3 text-lg font-bold text-gray-800 active:scale-[0.98] disabled:opacity-50"
          >
            {item.options[original]}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
    </div>
  )
}
