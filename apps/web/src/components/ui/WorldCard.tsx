import Link from 'next/link'

export interface WorldCardProps {
  href: string
  emoji: string
  nameAr: string
  color: string
  done?: number
  total?: number
  onClick?: () => void
}

export default function WorldCard({ href, emoji, nameAr, color, done = 0, total = 0, onClick }: WorldCardProps) {
  const pct = total > 0 ? Math.min(done / total, 1) : 0

  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-2xl p-4 text-white active:translate-y-1 transition-transform"
      style={{
        background: `linear-gradient(135deg,${color},${color}cc)`,
        boxShadow: `0 6px 0 ${color}88`,
      }}
    >
      <div className="flex items-center gap-2 font-black text-base mb-3">
        <span className="text-3xl">{emoji}</span>
        {nameAr}
      </div>
      {total > 0 && (
        <>
          <div className="h-2.5 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{ width: `${pct * 100}%`, transition: 'width 0.6s ease' }}
            />
          </div>
          <span className="text-xs text-white/80 mt-1 block">{done} من {total} دروس</span>
        </>
      )}
    </Link>
  )
}
