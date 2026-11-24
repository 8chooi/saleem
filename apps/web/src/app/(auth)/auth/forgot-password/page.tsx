'use client'

export const runtime = 'edge'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/reset-password` }
    )

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-5">✉️</div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">تحقّق من بريدك</h1>
          <p className="text-gray-500 mb-6 leading-relaxed">
            أرسلنا رابط إعادة تعيين كلمة السر إلى{' '}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-black text-gray-900">نسيت كلمة السر؟</h1>
          <p className="text-gray-500 mt-1 text-sm">أدخل بريدك وسنرسل لك رابط الاسترداد</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            autoComplete="email"
            required
            dir="ltr"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            إرسال رابط الاسترداد
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            ← العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
