'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Child {
  id: string
  name: string
  avatar_emoji: string
  pin_hash: string | null
}

export default function KidsSelectPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Child | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }

      const { data } = await supabase
        .from('child_profiles')
        .select('id, name, avatar_emoji, pin_hash')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: true })

      setChildren(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  function pickChild(child: Child) {
    setSelected(child)
    setPin('')
    setError('')
  }

  function addDigit(d: string) {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) verifyPin(next)
  }

  function delDigit() { setPin(p => p.slice(0, -1)); setError('') }

  async function verifyPin(code: string) {
    if (!selected) return
    setChecking(true)
    setError('')
    try {
      const supabase = createClient()
      const { data } = await supabase.rpc('verify_child_pin', {
        p_child_id: selected.id,
        p_pin: code,
      })
      if (data === true) {
        router.push(`/kids/${selected.id}`)
      } else {
        setError('الرقم غلط!')
        setPin('')
      }
    } catch {
      setError('حدث خطأ')
      setPin('')
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed,#ec4899)'}}>
        <div className="text-white text-2xl animate-pulse">...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      dir="rtl"
      style={{background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#ec4899 100%)'}}>

      {!selected ? (
        /* ───── اختر الطفل ───── */
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-2">🌟</div>
          <h1 className="text-white text-3xl font-black mb-1">مرحباً!</h1>
          <p className="text-white/70 text-base mb-8">من سيتعلّم اليوم؟</p>

          <div className="grid grid-cols-2 gap-4">
            {children.map(child => (
              <button key={child.id} onClick={() => pickChild(child)}
                className="flex flex-col items-center gap-3 p-5 rounded-3xl active:scale-95 transition-all"
                style={{background:'rgba(255,255,255,0.15)',backdropFilter:'blur(10px)',
                  boxShadow:'0 6px 0 rgba(0,0,0,0.2)'}}>
                <span className="text-6xl">{child.avatar_emoji}</span>
                <span className="text-white font-black text-lg">{child.name}</span>
              </button>
            ))}
          </div>

          <button onClick={() => router.push('/parent')}
            className="mt-8 text-white/50 text-sm font-bold">
            ← لوحة ولي الأمر
          </button>
        </div>

      ) : (
        /* ───── أدخل الرقم السري ───── */
        <div className="w-full max-w-xs text-center">
          <button onClick={() => setSelected(null)}
            className="text-white/60 text-sm mb-6 block">← رجوع</button>

          <div className="text-7xl mb-3">{selected.avatar_emoji}</div>
          <h2 className="text-white text-2xl font-black mb-1">{selected.name}</h2>
          <p className="text-white/70 text-sm mb-6">أدخل رقمك السري</p>

          {/* النقاط */}
          <div className="flex justify-center gap-3 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                {i < pin.length && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-red-300 font-black text-sm mb-4 animate-bounce">{error}</p>
          )}

          {/* لوحة المفاتيح */}
          <div className="grid grid-cols-3 gap-3">
            {['١','٢','٣','٤','٥','٦','٧','٨','٩'].map((d, i) => (
              <button key={d} onClick={() => addDigit(String(i + 1))}
                disabled={checking}
                className="h-16 rounded-2xl text-white text-2xl font-black active:scale-95 transition-all disabled:opacity-50"
                style={{background:'rgba(255,255,255,0.15)',boxShadow:'0 4px 0 rgba(0,0,0,0.2)'}}>
                {d}
              </button>
            ))}
            <div />
            <button onClick={() => addDigit('0')} disabled={checking}
              className="h-16 rounded-2xl text-white text-2xl font-black active:scale-95 transition-all disabled:opacity-50"
              style={{background:'rgba(255,255,255,0.15)',boxShadow:'0 4px 0 rgba(0,0,0,0.2)'}}>
              ٠
            </button>
            <button onClick={delDigit} disabled={checking}
              className="h-16 rounded-2xl text-white text-2xl font-black active:scale-95 transition-all"
              style={{background:'rgba(255,255,255,0.1)'}}>
              ⌫
            </button>
          </div>

          {checking && <p className="text-white/60 text-sm mt-4">جارٍ التحقق...</p>}
        </div>
      )}
    </div>
  )
}
