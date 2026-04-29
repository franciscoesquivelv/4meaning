import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted"
          >
            {label}
            {props.required && <span className="text-ink/50 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-surface2 border border-border rounded px-3 py-2.5',
            'text-ink text-[13px] font-normal placeholder:text-border-hi',
            'outline-none transition-colors',
            'focus:border-border-hi',
            error && 'border-error focus:border-error',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[10px] text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-[10px] text-error">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
export { Input }
