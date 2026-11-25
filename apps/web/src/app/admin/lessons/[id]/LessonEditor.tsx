'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { plainToHtml } from '@/lib/admin/text'

export interface Question {
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface LessonInput {
  id?: string
  subject_id: string
  slug: string
  title_ar: string
  description_ar: string
  content: string
  age_group: string
  difficulty: number
  duration_min: number
  points: number
  is_active: boolean
  questions: Question[]
}

const blankQ = (): Question => ({ question: '', options: ['', '', ''], correct: 0, explanation: '' })

export default function LessonEditor({ initial, subjects }: { initial: LessonInput; subjects: { id: string; name_ar: string; emoji: string }[] }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof LessonInput>(k: K, v: LessonInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setQ = (i: number, patch: Partial<Question>) => set('questions', form.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)))

  const save = async () => {
    if (!form.title_ar.trim()) return setMsg('العنوان مطلوب')
    if (!/^[a-z0-9-]{3,60}$/.test(form.slug)) return setMsg('الرابط بالإنجليزية الصغيرة والأرقام والشرطة فقط')
    if (!form.content.trim()) return setMsg('محتوى الدرس مطلوب')
    const qs = form.questions.filter((q) => q.question.trim())
    for (const [i, q] of qs.entries()) {
      const opts = q.options.map((o) => o.trim())
      if (opts.filter(Boolean).length < 3) return setMsg(`السؤال ${i + 1} يحتاج 3 اختيارات على الأقل`)
      if (!opts[q.correct]) return setMsg(`السؤال ${i + 1}: الإجابة الصحيحة فارغة`)
    }
    setBusy(true)
    setMsg('')
    const supabase = createClient()
    const row = {
      subject_id: form.subject_id,
      slug: form.slug,
      title_ar: form.title_ar.trim(),
      description_ar: form.description_ar.trim() || null,
      content_ar: plainToHtml(form.content),
      age_group: form.age_group,
      difficulty: form.difficulty,
      duration_min: form.duration_min,
      points: form.points,
      is_active: form.is_active,
    }
    const res = form.id
      ? await supabase.from('lessons').update(row).eq('id', form.id).select('id').single()
      : await supabase.from('lessons').insert(row).select('id').single()
    if (res.error) {
      setBusy(false)
      return setMsg(res.error.code === '23505' ? 'هذا الرابط مستخدم لدرس آخر في نفس العالم' : `تعذّر الحفظ: ${res.error.message}`)
    }
    const lessonId = res.data.id
    await supabase.from('quiz_questions').delete().eq('lesson_id', lessonId)
    if (qs.length) {
      const { error } = await supabase.from('quiz_questions').insert(
        qs.map((q, i) => {
          const opts = q.options.map((o) => o.trim()).filter(Boolean)
          return {
            lesson_id: lessonId,
            question_ar: q.question.trim(),
            options: opts,
            correct_idx: Math.min(q.correct, opts.length - 1),
            explanation_ar: q.explanation.trim() || null,
            sort_order: i + 1,
          }
        }),
      )
      if (error) {
        setBusy(false)
        return setMsg(`حُفظ الدرس لكن تعذّر حفظ الأسئلة: ${error.message}`)
      }
    }
    setBusy(false)
    setMsg(`حُفظ الدرس و${qs.length} أسئلة ✓`)
    if (!form.id) router.replace(`/admin/lessons/${lessonId}`)
    router.refresh()
  }

  const input = 'w-full rounded-xl border border-gray-200 px-3 py-2 bg-white'

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h1 className="font-black text-lg">{form.id ? 'تعديل درس' : 'درس جديد'}</h1>
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="text-sm font-bold">العالم
            <select className={input} value={form.subject_id} onChange={(e) => set('subject_id', e.target.value)}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name_ar}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">الرابط (إنجليزي)<input className={input} dir="ltr" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} /></label>
        </div>
        <label className="block text-sm font-bold">العنوان<input className={input} value={form.title_ar} onChange={(e) => set('title_ar', e.target.value)} /></label>
        <label className="block text-sm font-bold">وصف قصير<input className={input} value={form.description_ar} onChange={(e) => set('description_ar', e.target.value)} /></label>
        <label className="block text-sm font-bold">
          المحتوى
          <span className="block text-xs font-normal text-gray-500">السطر الأول عنوان، وكل سطر بعده فقرة. نص عادي فقط.</span>
          <textarea className={input} rows={8} value={form.content} onChange={(e) => set('content', e.target.value)} />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <label className="text-sm font-bold">العمر
            <select className={input} value={form.age_group} onChange={(e) => set('age_group', e.target.value)}>
              {['3-5', '6-8', '9-12', 'all'].map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">الصعوبة
            <select className={input} value={form.difficulty} onChange={(e) => set('difficulty', Number(e.target.value))}>
              {[1, 2, 3].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">دقائق<input type="number" min={1} max={60} className={input} value={form.duration_min} onChange={(e) => set('duration_min', Number(e.target.value) || 5)} /></label>
          <label className="text-sm font-bold">نقاط<input type="number" min={1} max={100} className={input} value={form.points} onChange={(e) => set('points', Number(e.target.value) || 10)} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> ظاهر للأطفال
        </label>
      </div>

      {form.questions.map((q, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">سؤال {i + 1}</span>
            <button type="button" onClick={() => set('questions', form.questions.filter((_, j) => j !== i))} className="text-xs text-red-500 font-bold">حذف</button>
          </div>
          <input className={input} value={q.question} onChange={(e) => setQ(i, { question: e.target.value })} placeholder="نص السؤال" />
          {q.options.map((o, k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="radio" name={`correct-${i}`} checked={q.correct === k} onChange={() => setQ(i, { correct: k })} aria-label="الإجابة الصحيحة" />
              <input className={input} value={o} onChange={(e) => setQ(i, { options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} placeholder={`اختيار ${k + 1}`} />
            </label>
          ))}
          {q.options.length < 4 && (
            <button type="button" onClick={() => setQ(i, { options: [...q.options, ''] })} className="text-xs font-bold text-blue-600">+ اختيار رابع</button>
          )}
          <input className={input} value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} placeholder="شرح يظهر بعد الإجابة (اختياري)" />
        </div>
      ))}
      <button type="button" onClick={() => set('questions', [...form.questions, blankQ()])} className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-3 font-bold text-gray-600">
        + سؤال
      </button>

      {msg && <p className={`text-sm font-bold ${msg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
      <button onClick={save} disabled={busy} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
        {busy ? 'جارٍ الحفظ…' : 'حفظ الدرس'}
      </button>
      <p className="text-xs text-gray-500">اختر الدائرة بجوار الإجابة الصحيحة. الأسئلة القديمة تُستبدل بالأسئلة الحالية عند الحفظ.</p>
    </div>
  )
}
