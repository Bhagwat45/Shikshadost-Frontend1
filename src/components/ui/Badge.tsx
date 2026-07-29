import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate' | 'indigo' | 'pink'

const variantMap: Record<BadgeVariant, string> = {
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red:    'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  slate:  'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  indigo: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  pink:   'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
}

const dotColorMap: Record<BadgeVariant, string> = {
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
  purple: 'bg-purple-500',
  slate:  'bg-slate-500',
  indigo: 'bg-brand-500',
  pink:   'bg-pink-500',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  size?: 'sm' | 'md'
}

export function Badge({ variant = 'slate', dot, size = 'md', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        variantMap[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColorMap[variant])} />
      )}
      {children}
    </span>
  )
}

/** Map complaint status to badge variant */
export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Pending:        'amber',
    Assigned:       'blue',
    'In Progress':  'indigo',
    Resolved:       'green',
    Closed:         'slate',
    Rejected:       'red',
  }
  return map[status] ?? 'slate'
}

export function priorityVariant(priority: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    Low:      'green',
    Medium:   'amber',
    High:     'red',
    Critical: 'red',
    Urgent:   'red',
  }
  return map[priority] ?? 'slate'
}
