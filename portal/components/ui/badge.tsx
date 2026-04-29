import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/8 text-ink',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error:   'bg-error/10 text-error',
  info:    'bg-info/10 text-info',
  muted:   'bg-white/4 text-muted',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.14em]',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  )
}

// Agreement status → badge variant
export function agreementStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    draft:    'muted',
    sent:     'info',
    viewed:   'warning',
    signed:   'success',
    approved: 'success',
    rejected: 'error',
  }
  return map[status] ?? 'muted'
}
