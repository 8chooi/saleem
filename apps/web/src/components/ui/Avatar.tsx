import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-sm',
  md:  'w-10 h-10 text-base',
  lg:  'w-12 h-12 text-lg',
  xl:  'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
}

const sizePixels: Record<AvatarSize, number> = {
  xs: 24, sm: 32, md: 40, lg: 48, xl: 64, '2xl': 80,
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function Avatar({ src, name = '', size = 'md', className }: AvatarProps) {
  const px = sizePixels[size]

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizeClasses[size], className)}>
        <Image src={src} alt={name} width={px} height={px} className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white',
        getColorFromName(name || 'U'),
        sizeClasses[size],
        className
      )}
    >
      {name ? getInitials(name) : '؟'}
    </div>
  )
}

export { Avatar }
