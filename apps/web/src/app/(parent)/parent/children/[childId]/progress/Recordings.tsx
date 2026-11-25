'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Recording {
  id: string
  path: string
  url: string | null
  title: string
  duration: number | null
  created_at: string
}

export default function Recordings({ items, childName }: { items: Recording[]; childName: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  const remove = async (r: Recording) => {
    if (!confirm('حذف هذا التسجيل نهائيًا؟')) return
    setBusy(r.id)
    const supabase = createClient()
    await supabase.storage.from('recordings').remove([r.path])
    await supabase.from('story_recordings').delete().eq('id', r.id)
    setBusy(null)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
      <h2 className="font-bold text-gray-700 mb-1">تسجيلات {childName}</h2>
      <p className="text-xs text-gray-500 mb-3">تسجيلات صوتية لطفلك وهو يقرأ. لا يسمعها غيرك.</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">لا توجد تسجيلات بعد. يستطيع طفلك التسجيل من زر «سجّل قراءتك» داخل أي قصة.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-semibold text-sm text-gray-800 truncate">🎙️ {r.title}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(r.created_at).toLocaleDateString('ar-EG')}
                  {r.duration ? ` · ${Math.floor(r.duration / 60)}:${String(r.duration % 60).padStart(2, '0')}` : ''}
                </span>
              </div>
              {r.url ? (
                <audio controls preload="none" src={r.url} className="w-full" />
              ) : (
                <p className="text-xs text-red-500">تعذّر تحميل الملف.</p>
              )}
              <button onClick={() => remove(r)} disabled={busy === r.id} className="mt-2 text-xs text-red-500 font-bold disabled:opacity-50">
                حذف التسجيل
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
