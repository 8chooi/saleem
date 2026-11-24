'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) return setError('الاسم مطلوب')
    if (!form.email.trim()) return setError('البريد الإلكتروني مطلوب')
    if (form.password.length < 8) return setError('كلمة السر يجب أن تكون 8 أحرف على الأقل')
    if (form.password !== form.confirm) return setError('كلمتا السر غير متطابقتين')

    setLoading(true)
    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.name.trim(), role: 'parent' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('هذا البريد الإلكتروني مسجّل مسبقاً')
      } else {
        setError(signUpError.message)
      }
      return
    }

    setStep('verify')
  }

  if (step === 'verify') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="text-6xl mb-5">📬</div>
        <h1 className="text-2xl font-black text-gray-900 mb-3">تحقّق من بريدك</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          أرسلنا رابط التأكيد إلى <span className="font-semibold text-gray-700">{form.email}</span>.
          افتح بريدك وانقر على الرابط لتفعيل حسابك.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all"
        >
          الذهاب لصفحة الدخول
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="text-2xl font-black text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-500 mt-1 text-sm">مجاني بالكامل — لا بطاقة بنكية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="الاسم الكامل"
            placeholder="محمد أحمد"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            autoComplete="name"
            required
          />
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
            placeholder="٨ أحرف على الأقل"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            label="تأكيد كلمة السر"
            type="password"
            placeholder="أعد كتابة كلمة السر"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
            autoComplete="new-password"
            required
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            إنشاء الحساب
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            سجّل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
