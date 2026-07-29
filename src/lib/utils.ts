type ClassValue = string | undefined | null | false | ClassValue[]

export function cn(...classes: ClassValue[]): string {
  const result: string[] = []
  for (const c of classes.flat(Infinity as 1)) {
    if (c && typeof c === 'string') result.push(c)
  }
  return result.join(' ')
}

/** Format a date to a readable string */
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...opts,
  }).format(new Date(date))
}

/** Format relative time ("2 hours ago") */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60)  return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7)      return `${days}d ago`
  return formatDate(date)
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  return text.length <= length ? text : text.slice(0, length) + '…'
}

/** Get initials from a name */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** Generate a consistent hue from a string */
export function stringToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

/** Sleep */
export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
