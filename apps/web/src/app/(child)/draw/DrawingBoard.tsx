'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const COLORS = ['#111827', '#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#8b5a2b', '#ffffff']
const SIZES = [4, 10, 22]
const STAMPS = ['⭐', '❤️', '🌸', '🐱', '🐶', '🌳', '☀️', '🚗', '🦋', '🏠']

type Tool = { kind: 'brush' } | { kind: 'eraser' } | { kind: 'stamp'; emoji: string }

export default function DrawingBoard({ childId }: { childId?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const history = useRef<ImageData[]>([])
  const [color, setColor] = useState(COLORS[1])
  const [size, setSize] = useState(SIZES[1])
  const [tool, setTool] = useState<Tool>({ kind: 'brush' })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ratio = window.devicePixelRatio || 1
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * ratio
    canvas.height = height * ratio
    const ctx = canvas.getContext('2d')!
    ctx.scale(ratio, ratio)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }, [])

  const ctx = () => canvasRef.current!.getContext('2d')!

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const snapshot = () => {
    const c = canvasRef.current!
    history.current.push(ctx().getImageData(0, 0, c.width, c.height))
    if (history.current.length > 30) history.current.shift()
  }

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    snapshot()
    const p = pos(e)
    if (tool.kind === 'stamp') {
      const c = ctx()
      c.font = `${size * 4}px serif`
      c.textAlign = 'center'
      c.textBaseline = 'middle'
      c.fillText(tool.emoji, p.x, p.y)
      return
    }
    drawing.current = true
    last.current = p
    stroke(p)
  }

  const stroke = (p: { x: number; y: number }) => {
    const c = ctx()
    c.strokeStyle = tool.kind === 'eraser' ? '#ffffff' : color
    c.lineWidth = tool.kind === 'eraser' ? size * 2 : size
    c.lineCap = 'round'
    c.lineJoin = 'round'
    c.beginPath()
    c.moveTo(last.current!.x, last.current!.y)
    c.lineTo(p.x + 0.01, p.y)
    c.stroke()
    last.current = p
  }

  const onMove = (e: React.PointerEvent) => {
    if (drawing.current) stroke(pos(e))
  }

  const onUp = () => {
    drawing.current = false
    last.current = null
  }

  const undo = () => {
    const img = history.current.pop()
    if (img) ctx().putImageData(img, 0, 0)
  }

  const clear = () => {
    snapshot()
    const c = canvasRef.current!
    const r = c.getBoundingClientRect()
    ctx().fillStyle = '#ffffff'
    ctx().fillRect(0, 0, r.width, r.height)
  }

  const save = () => {
    const a = document.createElement('a')
    a.download = 'رسمتي-سليم.png'
    a.href = canvasRef.current!.toDataURL('image/png')
    a.click()
  }

  const btn = (active: boolean) =>
    `rounded-xl px-3 py-2 font-bold text-sm transition-all ${active ? 'bg-rose-500 text-white scale-105' : 'bg-white text-gray-700 border'}`

  return (
    <div className="min-h-screen bg-rose-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <Link href={childId ? `/kids/${childId}` : '/parent'} className="text-rose-600 font-bold text-sm">
            ← رجوع
          </Link>
          <h1 className="text-2xl font-black text-rose-700">🎨 ارسم</h1>
          <span />
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-3 mb-3 space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool({ kind: 'brush' }) }}
                className={`w-9 h-9 rounded-full border-2 ${color === c && tool.kind === 'brush' ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                style={{ background: c }}
                aria-label="لون"
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={btn(size === s)} aria-label="حجم الفرشاة">
                <span className="inline-block rounded-full bg-current align-middle" style={{ width: s, height: s }} />
              </button>
            ))}
            <button onClick={() => setTool({ kind: 'brush' })} className={btn(tool.kind === 'brush')}>🖌️ فرشاة</button>
            <button onClick={() => setTool({ kind: 'eraser' })} className={btn(tool.kind === 'eraser')}>🧽 ممحاة</button>
            <button onClick={undo} className={btn(false)}>↩️ تراجع</button>
            <button onClick={clear} className={btn(false)}>🗑️ مسح</button>
            <button onClick={save} className="rounded-xl px-3 py-2 font-bold text-sm bg-green-500 text-white">💾 احفظ رسمتي</button>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {STAMPS.map((s) => (
              <button
                key={s}
                onClick={() => setTool({ kind: 'stamp', emoji: s })}
                className={`text-2xl w-11 h-11 rounded-xl ${tool.kind === 'stamp' && tool.emoji === s ? 'bg-rose-100 ring-2 ring-rose-400' : 'bg-gray-50'}`}
                aria-label="ملصق"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="w-full aspect-[4/3] bg-white rounded-3xl shadow-inner border-4 border-rose-200 touch-none cursor-crosshair"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        />
      </div>
    </div>
  )
}
