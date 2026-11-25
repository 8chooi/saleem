'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Option {
  id: string
  title: string
}

interface Assignment {
  id: string
  title: string
  kind: 'story' | 'lesson'
  note: string | null
  completed_at: string | null
}

export default function AssignTask({
  childId,
  stories,
  lessons,
  assignments,
}: {
  childId: string
  stories: Option[]
  lessons: Option[]
  assignments: Assignment[]
}) {
  const router = useRouter()
  const [kind, setKind] = useState<'story' | 'lesson'>('story')
  const [itemId, setItemId] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const options = kind === 'story' ? stories : lessons

  const assign = async () => {
    if (!itemId) return setError('اختر قصة أو درسًا أولًا')
    setBusy(true)
    setError('')
    const supabase = createClient()
    const { error: e } = await supabase.from('child_assignments').insert({
      child_id: childId,
      story_id: kind === 'story' ? itemId : null,
      lesson_id: kind === 'lesson' ? itemId : null,
      note: note.trim() || null,
    })
    setBusy(false)
    if (e) return setError('تعذّر حفظ المهمة. حاول مرة أخرى.')
    setItemId('')
    setNote('')
    router.refresh()
  }

  const remove = async (id: string) => {
    const supabase = createClient()
    await supabase.from('child_assignments').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
      <h2 className="font-bold text-gray-700 mb-3">أسند مهمة</h2>
      <div className="flex gap-2 mb-3">
        {(['story', 'lesson'] as const).map((k) => (
          <button
            key={k}
            onClick={() => { setKind(k); setItemId('') }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${kind === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {k === 'story' ? 'قصة' : 'درس'}
          </button>
        ))}
      </div>
      <select
        value={itemId}
        onChange={(e) => setItemId(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-2 bg-white"
        aria-label={kind === 'story' ? 'اختر قصة' : 'اختر درسًا'}
      >
        <option value="">{kind === 'story' ? 'اختر قصة…' : 'اختر درسًا…'}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.title}</option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={120}
        placeholder="رسالة قصيرة لطفلك (اختياري)"
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 mb-2"
      />
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button onClick={assign} disabled={busy} className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50">
        {busy ? 'جارٍ الحفظ…' : 'أسند المهمة'}
      </button>

      {assignments.length > 0 && (
        <ul className="mt-4 space-y-2">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2">
              <span>{a.completed_at ? '✅' : a.kind === 'story' ? '📖' : '🎓'}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-sm text-gray-800 truncate">{a.title}</span>
                <span className="block text-xs text-gray-500">
                  {a.completed_at ? `أنجزها ${new Date(a.completed_at).toLocaleDateString('ar-EG')}` : 'لم تُنجز بعد'}
                  {a.note ? ` · ${a.note}` : ''}
                </span>
              </span>
              {!a.completed_at && (
                <button onClick={() => remove(a.id)} className="text-xs text-red-500 font-bold">حذف</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
