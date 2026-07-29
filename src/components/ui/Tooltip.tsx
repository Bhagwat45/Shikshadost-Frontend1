import { useState, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface TooltipProps {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const sideMap = {
  top:    'bottom-full left-1/2 mb-2 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
  left:   'right-full top-1/2 mr-2 -translate-y-1/2',
  right:  'left-full top-1/2 ml-2 -translate-y-1/2',
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg',
            'bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-slate-700',
            'animate-fade-in',
            sideMap[side],
            className,
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
