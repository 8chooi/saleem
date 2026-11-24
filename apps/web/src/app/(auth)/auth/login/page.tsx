'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/parent'

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    setLoading(false)

    if (signInError) {
      if (signInError.message.includes('Invalid login')) {
        setError('البريد الإلكتروني أو كلمة السر غير صحيحة')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً')
      } else {
        setError(signInError.message)
      }
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌙</div>
          <h1 className="text-2xl font-black text-gray-900">أهلاً بعودتك</h1>
          <p className="text-gray-500 mt-1 text-sm">سجّل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
            required
            dir="ltr"
          />
          <Input
            label="كلمة السر"
            type="password"
            placeholder="كلمة السر"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="text-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              نسيت كلمة السر؟
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            تسجيل الدخول
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ليس لديك حساب؟{' '}
          <Link href="/auth/register" className="text-primary font-semibold hover:underline">
            أنشئ حساباً مجانياً
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 bg-white rounded-3xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
