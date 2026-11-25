'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StoryScene from '@/components/stories/StoryScene'
import type { SceneAnim, SceneBg, SceneItem, StoryPage } from '@/lib/stories/pages'

const BGS: { value: SceneBg; label: string }[] = [
  { value: 'meadow', label: 'مرج' }, { value: 'garden', label: 'حديقة' }, { value: 'home', label: 'بيت' },
  { value: 'village', label: 'قرية' }, { value: 'forest', label: 'غابة' }, { value: 'sea', label: 'بحر' },
  { value: 'sky', label: 'سماء' }, { value: 'night', label: 'ليل' }, { value: 'desert', label: 'صحراء' },
  { value: 'mountain', label: 'جبال' },
]
const ANIMS: SceneAnim[] = ['bounce', 'float', 'sway', 'pulse']

interface EditPage {
  text: string
  bg: SceneBg
  chars: string
  original?: { chars: string; items: SceneItem[] }
}

export interface StoryInput {
  id?: string
  slug: string
  title_ar: string
  summary_ar: string
  cover_emoji: string
  level: number
  age_group: string
  read_time_min: number
  is_active: boolean
  pages: StoryPage[] | null
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function layout(chars: string): SceneItem[] {
  const list = chars.split(/\s+/).filter(Boolean).slice(0, 5)
  const n = list.length
  return list.map((e, i) => ({
    e,
    x: n === 1 ? 50 : 25 + (50 / (n - 1)) * i,
    y: 62,
    size: n === 1 ? 130 : n === 2 ? 100 : 80,
    anim: ANIMS[i % ANIMS.length],
  }))
}

function toPages(edit: EditPage[]): StoryPage[] {
  return edit.map((p) => ({
    text: p.text.trim(),
    scene: { bg: p.bg, items: p.original && p.original.chars === p.chars ? p.original.items : layout(p.chars) },
  }))
}

export default function StoryEditor({ initial }: { initial: StoryInput }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const startPages: StoryPage[] = initial.pages?.length ? initial.pages : [{ text: '', scene: { bg: 'meadow', items: [] } }]
  const [pages, setPages] = useState<EditPage[]>(
    startPages.map((p) => {
      const chars = p.scene.items.map((i) => i.e).join(' ')
      return { text: p.text, bg: p.scene.bg, chars, original: { chars, items: p.scene.items } }
    }),
  )
  const [preview, setPreview] = useState(0)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const set = <K extends keyof StoryInput>(k: K, v: StoryInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setPage = (i: number, patch: Partial<EditPage>) => setPages((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  const save = async () => {
    if (!form.title_ar.trim()) return setMsg('العنوان مطلوب')
    if (!/^[a-z0-9-]{3,60}$/.test(form.slug)) return setMsg('الرابط بالإنجليزية الصغيرة والأرقام والشرطة فقط (3 أحرف على الأقل)')
    if (pages.some((p) => !p.text.trim())) return setMsg('كل صفحة تحتاج نصًا')
    setBusy(true)
    setMsg('')
    const built = toPages(pages)
    const row = {
      slug: form.slug,
      title_ar: form.title_ar.trim(),
      summary_ar: form.summary_ar.trim() || null,
      cover_emoji: form.cover_emoji.trim() || '📖',
      level: form.level,
      age_group: form.age_group,
      read_time_min: form.read_time_min,
      is_active: form.is_active,
      pages: built,
      content_ar: `<p>${built.map((p) => escape(p.text)).join(' ')}</p>`,
    }
    const supabase = createClient()
    const res = form.id
      ? await supabase.from('stories').update(row).eq('id', form.id).select('id').single()
      : await supabase.from('stories').insert(row).select('id').single()
    setBusy(false)
    if (res.error) return setMsg(res.error.code === '23505' ? 'هذا الرابط مستخدم لقصة أخرى' : `تعذّر الحفظ: ${res.error.message}`)
    setMsg('حُفظت القصة ✓')
    if (!form.id) router.replace(`/admin/stories/${res.data.id}`)
    router.refresh()
  }

  const input = 'w-full rounded-xl border border-gray-200 px-3 py-2 bg-white'
  const current = toPages(pages)[Math.min(preview, pages.length - 1)]

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h1 className="font-black text-lg">{form.id ? 'تعديل قصة' : 'قصة جديدة'}</h1>
          <label className="block text-sm font-bold">العنوان<input className={input} value={form.title_ar} onChange={(e) => set('title_ar', e.target.value)} /></label>
          <label className="block text-sm font-bold">الرابط (إنجليزي)<input className={input} dir="ltr" value={form.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="the-brave-cat" /></label>
          <label className="block text-sm font-bold">ملخص قصير<input className={input} value={form.summary_ar} onChange={(e) => set('summary_ar', e.target.value)} /></label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="text-sm font-bold">الغلاف<input className={input} value={form.cover_emoji} onChange={(e) => set('cover_emoji', e.target.value)} /></label>
            <label className="text-sm font-bold">المستوى
              <select className={input} value={form.level} onChange={(e) => set('level', Number(e.target.value))}>
                {[1, 2, 3, 4].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">العمر
              <select className={input} value={form.age_group} onChange={(e) => set('age_group', e.target.value)}>
                {['3-5', '6-8', '9-12', 'all'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold">دقائق<input type="number" min={1} max={30} className={input} value={form.read_time_min} onChange={(e) => set('read_time_min', Number(e.target.value) || 3)} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> ظاهرة للأطفال
          </label>
        </div>

        {pages.map((p, i) => (
          <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm space-y-2 border-2 ${preview === i ? 'border-blue-300' : 'border-transparent'}`} onFocus={() => setPreview(i)}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">صفحة {i + 1}</span>
              <span className="flex gap-2 text-xs font-bold">
                <button type="button" disabled={i === 0} onClick={() => setPages((ps) => { const a = [...ps]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a })} className="disabled:opacity-30">↑</button>
                <button type="button" disabled={i === pages.length - 1} onClick={() => setPages((ps) => { const a = [...ps]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; return a })} className="disabled:opacity-30">↓</button>
                <button type="button" disabled={pages.length === 1} onClick={() => { setPages((ps) => ps.filter((_, j) => j !== i)); setPreview(0) }} className="text-red-500 disabled:opacity-30">حذف</button>
              </span>
            </div>
            <textarea className={input} rows={2} value={p.text} onChange={(e) => setPage(i, { text: e.target.value })} placeholder="نص الصفحة (مشكّل للمستويين 1 و2)" />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-bold">الخلفية
                <select className={input} value={p.bg} onChange={(e) => setPage(i, { bg: e.target.value as SceneBg })}>
                  {BGS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold">الشخصيات (إيموجي بينها مسافة، حتى 5)
                <input className={input} value={p.chars} onChange={(e) => setPage(i, { chars: e.target.value })} placeholder="🐱 ⚽" />
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => { setPages((ps) => [...ps, { text: '', bg: ps[ps.length - 1]?.bg ?? 'meadow', chars: '' }]); setPreview(pages.length) }} className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-3 font-bold text-gray-600">
          + صفحة
        </button>
      </div>

      <div className="lg:sticky lg:top-4 self-start space-y-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm">
          <p className="text-xs text-gray-500 mb-2">معاينة الصفحة {Math.min(preview, pages.length - 1) + 1}</p>
          <StoryScene scene={current.scene} />
          <p className="mt-3 text-center text-xl font-bold leading-loose">{current.text || '…'}</p>
        </div>
        {msg && <p className={`text-sm font-bold ${msg.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        <button onClick={save} disabled={busy} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {busy ? 'جارٍ الحفظ…' : 'حفظ القصة'}
        </button>
      </div>
    </div>
  )
}
