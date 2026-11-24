import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'world'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-gray-100 text-gray-700',
  primary:  'bg-primary-light text-primary-dark',
  success:  'bg-green-100 text-green-700',
  warning:  'bg-yellow-100 text-yellow-700',
  error:    'bg-red-100 text-red-700',
  info:     'bg-blue-100 text-blue-700',
  world:    'bg-gradient-to-r from-primary to-secondary text-white',
}

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded-full',
  md: 'text-sm px-3 py-1 rounded-full',
}

function Badge({ variant = 'default', size = 'md', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center font-medium', variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
