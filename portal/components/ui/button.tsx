import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-sans font-bold uppercase tracking-[0.14em] rounded transition-opacity select-none',
          // Sizes
          size === 'sm' && 'text-[10px] px-4 py-2',
          size === 'md' && 'text-[11px] px-6 py-3',
          size === 'lg' && 'text-[12px] px-8 py-4',
          // Variants
          variant === 'primary' && 'bg-ink text-bg hover:opacity-90 active:opacity-80',
          variant === 'ghost'   && 'bg-transparent border border-border text-muted hover:border-border-hi hover:text-ink',
          variant === 'danger'  && 'bg-error/10 border border-error/30 text-error hover:bg-error/20',
          variant === 'outline' && 'bg-transparent border border-ink/20 text-ink hover:border-ink/50',
          // Disabled
          (disabled || loading) && 'opacity-35 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export { Button }
