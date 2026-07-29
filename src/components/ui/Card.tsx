import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const padMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6 md:p-8' }

export function Card({ hover, glass, padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-[var(--surface-0)] dark:border-slate-800/60 dark:bg-[var(--surface-2)]',
        'shadow-card transition-all duration-200',
        hover && 'hover:shadow-card-hover hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
        glass && 'border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70',
        padMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-semibold text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mt-1 text-sm text-slate-500 dark:text-slate-400', className)} {...props}>
      {children}
    </p>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: { value: number; label?: string }
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'indigo'
  className?: string
}

const colorMap = {
  blue:   { icon: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400', trend: 'text-blue-600' },
  green:  { icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400', trend: 'text-emerald-600' },
  amber:  { icon: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400', trend: 'text-amber-600' },
  red:    { icon: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400', trend: 'text-red-600' },
  purple: { icon: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400', trend: 'text-purple-600' },
  indigo: { icon: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400', trend: 'text-brand-600' },
}

export function StatCard({ label, value, icon, trend, color = 'indigo', className }: StatCardProps) {
  const c = colorMap[color]
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-lg', c.icon)}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
      {trend && (
        <p className={cn('text-xs font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-red-500')}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          {trend.label && <span className="ml-1 text-slate-400">{trend.label}</span>}
        </p>
      )}
    </Card>
  )
}
