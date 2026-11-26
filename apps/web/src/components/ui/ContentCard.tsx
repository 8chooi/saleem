import Link from 'next/link'

export interface ContentCardProps {
  href: string
  emoji: string
  titleAr: string
  subtitleAr?: string
  badge?: string
  isRead?: boolean
  onClick?: () => void
}

export default function ContentCard({
  href,
  emoji,
  titleAr,
  subtitleAr,
  badge,
  isRead,
  onClick,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="bg-white rounded-2xl border border-purple-100 p-4 clay-card hover:border-purple-300 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-black text-gray-800 group-hover:text-purple-700 transition-colors leading-snug">
              {titleAr}
            </h3>
            {isRead && <span className="text-green-500 text-sm shrink-0">✓</span>}
          </div>
          {subtitleAr && (
            <p className="text-xs text-gray-500 line-clamp-2">{subtitleAr}</p>
          )}
          {badge && (
            <span className="mt-1.5 inline-block text-xs font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              {badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
