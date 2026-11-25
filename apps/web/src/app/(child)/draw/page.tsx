import Link from 'next/link'
import DrawingBoard from './DrawingBoard'
import ColoringBoard from './ColoringBoard'

export const metadata = { title: 'ارسم | سَلِيم' }

export default function DrawPage({ searchParams }: { searchParams: { child?: string; mode?: string } }) {
  const coloring = searchParams.mode === 'color'
  const base = searchParams.child ? `?child=${searchParams.child}` : '?'
  const tab = (active: boolean) =>
    `px-5 py-2 rounded-full font-bold text-sm ${active ? 'bg-rose-500 text-white' : 'bg-white text-rose-600 border border-rose-200'}`

  return (
    <div className="bg-rose-50 min-h-screen" dir="rtl">
      <div className="flex gap-2 justify-center pt-4">
        <Link href={`/draw${base}`} className={tab(!coloring)}>✏️ رسم حر</Link>
        <Link href={`/draw${base}${searchParams.child ? '&' : ''}mode=color`} className={tab(coloring)}>🖍️ تلوين</Link>
      </div>
      {coloring ? (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link href={searchParams.child ? `/kids/${searchParams.child}` : '/parent'} className="text-rose-600 font-bold text-sm">← رجوع</Link>
            <h1 className="text-2xl font-black text-rose-700">🖍️ لوّن</h1>
            <span />
          </div>
          <ColoringBoard />
        </div>
      ) : (
        <DrawingBoard childId={searchParams.child} />
      )}
    </div>
  )
}
