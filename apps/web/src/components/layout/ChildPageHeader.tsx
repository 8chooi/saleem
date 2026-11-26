import Link from 'next/link'

export interface ChildPageHeaderProps {
  backHref: string
  title: string
  count?: number
  countLabel?: string
}

export default function ChildPageHeader({
  backHref,
  title,
  count,
  countLabel,
}: ChildPageHeaderProps) {
  return (
    <div
      className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between gap-3"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 2px 20px rgba(92,74,228,0.1)',
      }}
    >
      <Link
        href={backHref}
        className="text-brand-purple font-black text-sm px-3 py-2 rounded-xl shrink-0"
        style={{ background: 'rgba(92,74,228,0.1)' }}
      >
        ← رجوع
      </Link>

      <h1 className="text-lg font-black text-purple-900 truncate">{title}</h1>

      {count !== undefined ? (
        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl shrink-0">
          {count} {countLabel ?? ''}
        </span>
      ) : (
        <span className="w-16" />
      )}
    </div>
  )
}
