'use client'

export const runtime = 'edge'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) return setError('كلمة السر يجب أن تكون 8 أحرف على الأقل')
    if (password !== confirm) return setError('كلمتا السر غير متطابقتين')

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/parent'), 2000)
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">تم تغيير كلمة السر</h1>
        <p className="text-gray-500">جاري تحويلك…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-black text-gray-900">كلمة سر جديدة</h1>
          <p className="text-gray-500 mt-1 text-sm">اكتب كلمة سرك الجديدة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="كلمة السر الجديدة"
            type="password"
            placeholder="٨ أحرف على الأقل"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            autoComplete="new-password"
            required
          />
          <Input
            label="تأكيد كلمة السر"
            type="password"
            placeholder="أعد كتابة كلمة السر"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            حفظ كلمة السر
          </Button>
        </form>
      </div>
    </div>
  )
}
