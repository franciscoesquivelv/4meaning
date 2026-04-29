import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface border border-border rounded-lg p-5',
        onClick && 'cursor-pointer transition-colors hover:border-border-hi hover:bg-surface2',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[9px] font-bold uppercase tracking-[0.24em] text-muted mb-4 pb-3 border-b border-border', className)}>
      {children}
    </p>
  )
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="text-2xl font-bold text-ink leading-none">{value}</p>
      {sub && <p className="text-[11px] text-muted">{sub}</p>}
    </div>
  )
}
