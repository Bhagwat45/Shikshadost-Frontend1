import { cn, initials, stringToHue } from '../../lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  ring?: boolean
}

const sizeMap = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
}

export function Avatar({ name, src, size = 'md', className, ring }: AvatarProps) {
  const hue = stringToHue(name)
  const bg  = `hsl(${hue}, 65%, 88%)`
  const fg  = `hsl(${hue}, 65%, 30%)`

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover shrink-0',
          sizeMap[size],
          ring && 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900',
          className,
        )}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold shrink-0',
        sizeMap[size],
        ring && 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900',
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials(name)}
    </span>
  )
}
