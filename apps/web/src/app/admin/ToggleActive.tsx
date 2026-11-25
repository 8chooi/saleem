'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ToggleActive({ table, id, active }: { table: 'stories' | 'lessons'; id: string; active: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const toggle = async () => {
    setBusy(true)
    await createClient().from(table).update({ is_active: !active }).eq('id', id)
    setBusy(false)
    router.refresh()
  }
  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs font-bold px-3 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'} disabled:opacity-50`}
      title={active ? 'اضغط للإخفاء عن الأطفال' : 'اضغط للإظهار للأطفال'}
    >
      {active ? 'ظاهر' : 'مخفي'}
    </button>
  )
}
