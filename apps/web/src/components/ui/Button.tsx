'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-dark active:scale-95 shadow-sm hover:shadow-md',
  secondary:
    'bg-secondary text-white hover:bg-purple-700 active:scale-95 shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-primary hover:bg-primary-light active:scale-95',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm',
  outline:
    'border-2 border-primary text-primary bg-transparent hover:bg-primary-light active:scale-95',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
  md:  'px-5 py-2.5 text-base rounded-xl min-h-[44px]',
  lg:  'px-7 py-3 text-lg rounded-xl min-h-[52px]',
  xl:  'px-8 py-4 text-xl rounded-2xl min-h-[60px]',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-semibold transition-all duration-150',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>جاري التحميل...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, ButtonVariant, ButtonSize }
