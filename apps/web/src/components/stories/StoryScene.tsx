'use client'

import { motion, type TargetAndTransition } from 'framer-motion'
import type { Scene, SceneAnim, SceneBg } from '@/lib/stories/pages'

const BACKGROUNDS: Record<SceneBg, { sky: string; ground?: string; groundHeight?: string; deco: { e: string; x: number; y: number; size: number; drift?: boolean }[] }> = {
  meadow: { sky: 'linear-gradient(#bae6fd, #e0f2fe)', ground: 'linear-gradient(#86efac, #4ade80)', groundHeight: '32%', deco: [{ e: '☀️', x: 86, y: 14, size: 70 }, { e: '☁️', x: 22, y: 16, size: 60, drift: true }] },
  night: { sky: 'linear-gradient(#1e1b4b, #4338ca)', ground: 'linear-gradient(#1e3a8a, #172554)', groundHeight: '25%', deco: [{ e: '🌙', x: 84, y: 16, size: 64 }, { e: '✨', x: 20, y: 14, size: 26 }, { e: '⭐', x: 42, y: 24, size: 22 }, { e: '✨', x: 64, y: 10, size: 20 }] },
  sea: { sky: 'linear-gradient(#bae6fd, #f0f9ff)', ground: 'linear-gradient(#38bdf8, #0369a1)', groundHeight: '42%', deco: [{ e: '☀️', x: 14, y: 14, size: 60 }, { e: '🌊', x: 80, y: 60, size: 46, drift: true }] },
  forest: { sky: 'linear-gradient(#d9f99d, #ecfccb)', ground: 'linear-gradient(#65a30d, #3f6212)', groundHeight: '30%', deco: [{ e: '🌲', x: 8, y: 52, size: 90 }, { e: '🌳', x: 90, y: 50, size: 96 }, { e: '🌲', x: 76, y: 56, size: 70 }] },
  village: { sky: 'linear-gradient(#bfdbfe, #eff6ff)', ground: 'linear-gradient(#fde68a, #f59e0b)', groundHeight: '28%', deco: [{ e: '🏠', x: 10, y: 60, size: 70 }, { e: '🏡', x: 88, y: 60, size: 70 }, { e: '☁️', x: 50, y: 12, size: 54, drift: true }] },
  desert: { sky: 'linear-gradient(#fed7aa, #fff7ed)', ground: 'linear-gradient(#fcd34d, #d97706)', groundHeight: '34%', deco: [{ e: '☀️', x: 82, y: 14, size: 70 }, { e: '🌵', x: 12, y: 58, size: 70 }, { e: '🐪', x: 86, y: 64, size: 60 }] },
  mountain: { sky: 'linear-gradient(#e0e7ff, #f8fafc)', ground: 'linear-gradient(#a3a3a3, #57534e)', groundHeight: '22%', deco: [{ e: '⛰️', x: 20, y: 52, size: 130 }, { e: '🏔️', x: 80, y: 48, size: 140 }, { e: '☁️', x: 48, y: 14, size: 50, drift: true }] },
  home: { sky: 'linear-gradient(#fef3c7, #fffbeb)', ground: 'linear-gradient(#d6a77a, #a16207)', groundHeight: '26%', deco: [{ e: '🕰️', x: 82, y: 26, size: 56 }, { e: '🖼️', x: 18, y: 24, size: 50 }] },
  sky: { sky: 'linear-gradient(#7dd3fc, #e0f2fe)', deco: [{ e: '☁️', x: 16, y: 20, size: 64, drift: true }, { e: '☁️', x: 78, y: 70, size: 72, drift: true }, { e: '☀️', x: 86, y: 14, size: 56 }] },
  garden: { sky: 'linear-gradient(#bae6fd, #f0f9ff)', ground: 'linear-gradient(#4ade80, #16a34a)', groundHeight: '30%', deco: [{ e: '🌷', x: 8, y: 78, size: 40 }, { e: '🌼', x: 20, y: 84, size: 36 }, { e: '🌻', x: 92, y: 70, size: 56 }, { e: '🦋', x: 70, y: 22, size: 32, drift: true }] },
}

function motionFor(anim: SceneAnim | undefined, i: number): { animate: TargetAndTransition } {
  const t = { repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' as const }
  switch (anim) {
    case 'bounce': return { animate: { y: [0, -18, 0], transition: { ...t, duration: 1.2 } } }
    case 'float': return { animate: { y: [0, -10, 0], x: [0, 6, 0], transition: { ...t, duration: 3 } } }
    case 'sway': return { animate: { rotate: [-8, 8, -8], transition: { ...t, duration: 2 } } }
    case 'walk': return { animate: { x: ['-30%', '30%', '-30%'], scaleX: [1, 1, -1, -1, 1], transition: { ...t, duration: 6 } } }
    case 'spin': return { animate: { rotate: [0, 360], transition: { ...t, duration: 4, ease: 'linear' } } }
    case 'pulse': return { animate: { scale: [1, 1.15, 1], transition: { ...t, duration: 1.6 } } }
    default: return { animate: {} }
  }
}

const size = (px: number) => `${(px / 600) * 100}cqw`

export default function StoryScene({ scene }: { scene: Scene }) {
  const bg = BACKGROUNDS[scene.bg] ?? BACKGROUNDS.meadow

  return (
    <div
      className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl select-none"
      style={{ background: bg.sky, containerType: 'inline-size' }}
      aria-hidden
    >
      {bg.ground && (
        <div
          className="absolute inset-x-[-10%] bottom-0 rounded-t-[50%]"
          style={{ height: bg.groundHeight, background: bg.ground }}
        />
      )}

      {bg.deco.map((d, i) => (
        <motion.span
          key={`d${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 leading-none"
          style={{ left: `${d.x}%`, top: `${d.y}%`, fontSize: size(d.size) }}
          animate={d.drift ? { x: [0, 20, 0] } : undefined}
          transition={d.drift ? { repeat: Infinity, duration: 8, ease: 'easeInOut' } : undefined}
        >
          {d.e}
        </motion.span>
      ))}

      {scene.items.map((item, i) => (
        <motion.span
          key={`${item.e}${i}`}
          className="absolute leading-none drop-shadow-md"
          style={{ left: `${item.x}%`, top: `${item.y}%`, fontSize: size(item.size ?? 72), translate: '-50% -50%' }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 180, damping: 14 }}
        >
          <motion.span className="inline-block" {...motionFor(item.anim, i)}>
            {item.e}
          </motion.span>
        </motion.span>
      ))}
    </div>
  )
}
