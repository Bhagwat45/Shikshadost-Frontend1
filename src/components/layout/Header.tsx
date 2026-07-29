import { Menu, Bell, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { ThemeToggle } from './ThemeToggle'
import { Avatar } from '../ui/Avatar'
import { Tooltip } from '../ui/Tooltip'
import type { User } from '../../types/auth'

interface HeaderProps {
  user: User
  onMobileMenuOpen: () => void
  onSidebarToggle: () => void
  sidebarCollapsed: boolean
  onLogout: () => void
  sidebarWidth: number
}

export function Header({ user, onMobileMenuOpen, onSidebarToggle, onLogout, sidebarWidth }: HeaderProps) {
  const navigate = useNavigate()
  const role = user.role

  const notifPath = `/${role}/notifications`
  const profilePath = `/${role}/profile`

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-[60px] items-center justify-between',
        'border-b border-slate-200/80 bg-[var(--surface-0)]/95 backdrop-blur-md',
        'dark:border-slate-800/60 dark:bg-[var(--surface-1)]/95',
        'px-4 transition-all duration-300',
      )}
      style={{ left: `${sidebarWidth}px` }}
    >
      {/* Left: hamburger (mobile) + collapse toggle (desktop) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMobileMenuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={onSidebarToggle}
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:flex"
          title="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        {/* Quick search hint */}
        <button
          className={cn(
            'hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50',
            'px-3 py-2 text-sm text-slate-400 transition-colors',
            'hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50',
            'dark:text-slate-500 dark:hover:bg-slate-800 sm:flex',
          )}
          onClick={() => {/* future: open command palette */}}
        >
          <Search size={14} />
          <span className="hidden lg:inline">Search anything…</span>
          <kbd className="ml-1 hidden rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-slate-700 dark:text-slate-400 lg:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <ThemeToggle />

        <Tooltip content="Notifications">
          <button
            onClick={() => navigate(notifPath)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <Bell size={17} />
          </button>
        </Tooltip>

        {/* Avatar → profile */}
        <Tooltip content="Profile">
          <button
            onClick={() => navigate(profilePath)}
            className="ml-1"
          >
            <Avatar name={user.name} size="sm" ring />
          </button>
        </Tooltip>

        <Tooltip content="Sign out">
          <button
            onClick={onLogout}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={17} />
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
