'use client'


import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getAgeGroup } from '@/lib/utils'

const AVATARS = ['🧒', '👦', '👧', '🧑', '🐻', '🦁', '🐸', '⭐', '🚀', '🦋']

const currentYear = new Date().getFullYear()

export default function AddChildPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [welcome, setWelcome] = useState(false)
  useEffect(() => {
    setWelcome(new URLSearchParams(window.location.search).has('welcome'))
  }, [])
  const [form, setForm] = useState({
    name: '',
    birth_year: String(currentYear - 6),
    avatar_emoji: '🧒',
    pin: '',
  })

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const year = parseInt(form.birth_year)
    if (!form.name.trim()) return setError('اسم الطفل مطلوب')
    if (isNaN(year) || year < currentYear - 12 || year > currentYear - 3) {
      return setError('سَلِيم مناسب للأطفال من 3 إلى 12 سنة. تأكد من سنة الميلاد.')
    }
    if (form.pin && (form.pin.length !== 4 || !/^\d+$/.test(form.pin))) {
      return setError('الرقم السري يجب أن يكون 4 أرقام')
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const ageGroup = getAgeGroup(year)

    const { data: created, error: insertError } = await supabase
      .from('child_profiles')
      .insert({
        parent_id: user.id,
        name: form.name.trim(),
        birth_year: year,
        age_group: ageGroup,
        avatar_emoji: form.avatar_emoji,
        pin_hash: form.pin || null,
      })
      .select('id')
      .single()

    setLoading(false)

    if (insertError || !created) {
      setError('حدث خطأ أثناء الحفظ. حاول مجدداً.')
      return
    }

    router.push(welcome ? `/kids/${created.id}` : '/parent')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      {welcome ? (
        <div className="mb-6 text-center">
          <ol className="flex items-center justify-center gap-2 mb-6 text-xs font-bold">
            {['حسابك', 'طفلك الأول', 'ابدأ التعلّم'].map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-green-500 text-white' : i === 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i === 0 ? '✓' : i + 1}
                </span>
                <span className={i === 1 ? 'text-gray-900' : 'text-gray-400'}>{step}</span>
                {i < 2 && <span className="w-6 h-0.5 bg-gray-200" />}
              </li>
            ))}
          </ol>
          <h1 className="text-2xl font-black text-gray-900">لنضف طفلك الأول 🧒</h1>
          <p className="text-gray-500 text-sm mt-1">يمكنك إضافة باقي الأطفال لاحقًا من لوحة التحكم</p>
        </div>
      ) : (
        <div className="mb-6">
          <Link href="/parent" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← العودة
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mt-2">إضافة طفل</h1>
          <p className="text-gray-500 text-sm mt-1">أضف ملف طفلك لمتابعة تقدّمه</p>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Avatar picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الصورة الرمزية</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => update('avatar_emoji', emoji)}
                  className={`w-11 h-11 text-2xl rounded-xl flex items-center justify-center transition-all ${
                    form.avatar_emoji === emoji
                      ? 'bg-primary-light ring-2 ring-primary scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="اسم الطفل"
            placeholder="مثال: أحمد"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />

          <Input
            label="سنة الميلاد"
            type="number"
            placeholder={String(currentYear - 6)}
            value={form.birth_year}
            onChange={(e) => update('birth_year', e.target.value)}
            min={currentYear - 12}
            max={currentYear - 3}
            hint={`الفئة العمرية: ${getAgeGroup(parseInt(form.birth_year)) ?? 'غير محدد'}`}
            required
          />

          <Input
            label="رقم سري (اختياري)"
            type="password"
            placeholder="4 أرقام"
            value={form.pin}
            onChange={(e) => update('pin', e.target.value)}
            maxLength={4}
            hint="رقم سري يستخدمه الطفل للدخول لحسابه"
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            {welcome ? 'ابدأ التعلّم 🚀' : 'حفظ الملف'}
          </Button>
          <p className="text-xs text-gray-400 text-center">🔒 بيانات طفلك محمية، ولا تظهر لأي مستخدم آخر.</p>
        </form>
      </div>
    </div>
  )
}
