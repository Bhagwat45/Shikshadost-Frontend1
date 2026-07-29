import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TabsContextValue {
  value: string
  onChange: (v: string) => void
}
const TabsCtx = createContext<TabsContextValue>({ value: '', onChange: () => {} })

export function Tabs({ value, onChange, children, className }: {
  value: string; onChange: (v: string) => void; children: ReactNode; className?: string
}) {
  return (
    <TabsCtx.Provider value={{ value, onChange }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  )
}

export function TabList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60',
      className,
    )}>
      {children}
    </div>
  )
}

export function Tab({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx)
  const active = ctx.value === value
  return (
    <button
      onClick={() => ctx.onChange(value)}
      className={cn(
        'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-[var(--surface-0)] text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100'
          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function TabPanel({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx)
  if (ctx.value !== value) return null
  return <div className={cn('animate-fade-in', className)}>{children}</div>
}
