import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number          // 0–100
  label?: string
  showValue?: boolean
  color?: 'brand' | 'green' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

const colorMap = {
  brand: 'bg-brand-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red:   'bg-red-500',
}

const sizeMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

export function ProgressBar({ value, label, showValue, color = 'brand', size = 'md', className, animated }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          {label && <span>{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', sizeMap[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700', colorMap[color], animated && 'animate-pulse-soft')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
