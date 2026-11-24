import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      {icon && (
        <div className="mb-4 text-5xl opacity-50">{icon}</div>
      )}
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-base max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export { EmptyState }
