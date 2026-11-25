'use client'

import { useRef, useState } from 'react'

const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#8b5a2b', '#9ca3af', '#111827', '#ffffff']

type Shape =
  | { id: string; kind: 'rect'; x: number; y: number; w: number; h: number; r?: number }
  | { id: string; kind: 'circle'; cx: number; cy: number; r: number }
  | { id: string; kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { id: string; kind: 'path'; d: string }

const TEMPLATES: { key: string; name: string; shapes: Shape[] }[] = [
  {
    key: 'house',
    name: 'البيت',
    shapes: [
      { id: 'sky', kind: 'rect', x: 0, y: 0, w: 400, h: 230 },
      { id: 'ground', kind: 'rect', x: 0, y: 230, w: 400, h: 70 },
      { id: 'sun', kind: 'circle', cx: 340, cy: 55, r: 32 },
      { id: 'body', kind: 'rect', x: 110, y: 130, w: 180, h: 130 },
      { id: 'roof', kind: 'path', d: 'M95 135 L200 55 L305 135 Z' },
      { id: 'door', kind: 'rect', x: 180, y: 190, w: 40, h: 70, r: 4 },
      { id: 'win1', kind: 'rect', x: 128, y: 155, w: 38, h: 34, r: 3 },
      { id: 'win2', kind: 'rect', x: 234, y: 155, w: 38, h: 34, r: 3 },
      { id: 'tree', kind: 'circle', cx: 55, cy: 160, r: 38 },
      { id: 'trunk', kind: 'rect', x: 48, y: 190, w: 14, h: 50 },
    ],
  },
  {
    key: 'fish',
    name: 'السمكة',
    shapes: [
      { id: 'water', kind: 'rect', x: 0, y: 0, w: 400, h: 300 },
      { id: 'sand', kind: 'path', d: 'M0 260 Q100 240 200 260 T400 255 L400 300 L0 300 Z' },
      { id: 'tail', kind: 'path', d: 'M270 150 L350 95 L350 205 Z' },
      { id: 'body', kind: 'ellipse', cx: 190, cy: 150, rx: 100, ry: 62 },
      { id: 'fin', kind: 'path', d: 'M170 92 Q195 50 230 95 Z' },
      { id: 'eye', kind: 'circle', cx: 130, cy: 135, r: 12 },
      { id: 'b1', kind: 'circle', cx: 70, cy: 80, r: 10 },
      { id: 'b2', kind: 'circle', cx: 55, cy: 45, r: 7 },
      { id: 'weed', kind: 'path', d: 'M330 260 Q310 220 335 190 Q355 220 340 260 Z' },
    ],
  },
  {
    key: 'flower',
    name: 'الوردة',
    shapes: [
      { id: 'bg', kind: 'rect', x: 0, y: 0, w: 400, h: 300 },
      { id: 'stem', kind: 'rect', x: 194, y: 140, w: 12, h: 110 },
      { id: 'leaf1', kind: 'ellipse', cx: 165, cy: 200, rx: 30, ry: 12, rot: -30 },
      { id: 'leaf2', kind: 'ellipse', cx: 235, cy: 185, rx: 30, ry: 12, rot: 30 },
      ...[0, 60, 120, 180, 240, 300].map((rot, i) => ({ id: `p${i}`, kind: 'ellipse' as const, cx: 200, cy: 72, rx: 22, ry: 38, rot })),
      { id: 'center', kind: 'circle', cx: 200, cy: 110, r: 24 },
      { id: 'pot', kind: 'path', d: 'M150 245 L250 245 L235 295 L165 295 Z' },
    ],
  },
]

function ShapeEl({ s, fill, onClick }: { s: Shape; fill: string; onClick: () => void }) {
  const common = { fill, stroke: '#1f2937', strokeWidth: 3, onClick, style: { cursor: 'pointer' } }
  if (s.kind === 'rect') return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} {...common} />
  if (s.kind === 'circle') return <circle cx={s.cx} cy={s.cy} r={s.r} {...common} />
  if (s.kind === 'ellipse')
    return (
      <ellipse
        cx={s.cx}
        cy={s.cy}
        rx={s.rx}
        ry={s.ry}
        transform={s.rot ? `rotate(${s.rot} ${s.kind === 'ellipse' && s.id.startsWith('p') ? '200 110' : `${s.cx} ${s.cy}`})` : undefined}
        {...common}
      />
    )
  return <path d={s.d} {...common} />
}

export default function ColoringBoard() {
  const [tpl, setTpl] = useState(TEMPLATES[0].key)
  const [color, setColor] = useState(COLORS[0])
  const [fills, setFills] = useState<Record<string, Record<string, string>>>({})
  const svgRef = useRef<SVGSVGElement>(null)
  const template = TEMPLATES.find((t) => t.key === tpl)!
  const current = fills[tpl] ?? {}

  const paint = (id: string) => setFills((f) => ({ ...f, [tpl]: { ...(f[tpl] ?? {}), [id]: color } }))
  const clear = () => setFills((f) => ({ ...f, [tpl]: {} }))

  const save = () => {
    const svg = new XMLSerializer().serializeToString(svgRef.current!)
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 800
      c.height = 600
      c.getContext('2d')!.drawImage(img, 0, 0, 800, 600)
      const a = document.createElement('a')
      a.download = `تلوين-${template.name}.png`
      a.href = c.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  return (
    <div>
      <div className="flex gap-2 justify-center mb-3 flex-wrap">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTpl(t.key)}
            className={`px-4 py-2 rounded-xl font-bold text-sm ${tpl === t.key ? 'bg-rose-500 text-white' : 'bg-white border text-gray-700'}`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-3 mb-3">
        <div className="flex flex-wrap gap-2 justify-center mb-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full border-2 ${color === c ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
              style={{ background: c }}
              aria-label="لون"
            />
          ))}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={clear} className="rounded-xl px-3 py-2 font-bold text-sm bg-white text-gray-700 border">🗑️ امسح التلوين</button>
          <button onClick={save} className="rounded-xl px-3 py-2 font-bold text-sm bg-green-500 text-white">💾 احفظ رسمتي</button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 400 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full bg-white rounded-3xl border-4 border-rose-200 touch-manipulation"
        role="img"
        aria-label={`صفحة تلوين: ${template.name}`}
      >
        {template.shapes.map((s) => (
          <ShapeEl key={s.id} s={s} fill={current[s.id] ?? '#ffffff'} onClick={() => paint(s.id)} />
        ))}
      </svg>
      <p className="text-center text-sm text-gray-500 mt-2">اختر لونًا، ثم اضغط على أي جزء من الرسمة لتلوينه.</p>
    </div>
  )
}
