import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'
import { getNav, type UserRole } from './navConfig'
import type { User } from '../../types/auth'

interface SidebarProps {
  user: User
  mobileOpen: boolean
  onMobileClose: () => void
  collapsed: boolean
}

export function Sidebar({ user, mobileOpen, onMobileClose, collapsed }: SidebarProps) {
  const role = user.role as UserRole
  const nav  = getNav(role)

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={cn(
          /* Desktop: always visible, width animates */
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'border-r border-slate-200/80 bg-[var(--surface-0)]',
          'dark:border-slate-800/60 dark:bg-[var(--surface-1)]',
          'transition-all duration-300 ease-in-out',
          /* Desktop width */
          collapsed ? 'w-[70px]' : 'w-[260px]',
          /* Mobile: slide in/out */
          'translate-x-[-100%] md:translate-x-0',
          mobileOpen && '!translate-x-0 !w-[260px]',
        )}
      >
        {/* Logo row */}
        <div className={cn(
          'flex h-[60px] shrink-0 items-center border-b border-slate-100 dark:border-slate-800/60',
          collapsed ? 'justify-center px-0' : 'gap-2.5 px-5',
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-sm">
            <Sparkles size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                ShikshaDost
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                {role} portal
              </p>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none py-3">
          {nav.map((section, si) => (
            <div key={si}>
              {/* Section label — hidden when collapsed */}
              {section.title && !collapsed && (
                <p className="sidebar-section">{section.title}</p>
              )}
              {collapsed && section.title && <div className="my-1 mx-3 border-t border-slate-100 dark:border-slate-800" />}

              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.endsWith('dashboard')}
                  className={({ isActive }) =>
                    cn(
                      'mx-2 my-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                      'transition-all duration-150',
                      collapsed ? 'justify-center px-0 mx-1' : '',
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100',
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                          item.badgeColor === 'purple' && 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
                          item.badgeColor === 'green'  && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
                          item.badgeColor === 'amber'  && 'bg-amber-100 text-amber-600',
                          !item.badgeColor && 'bg-brand-100 text-brand-600',
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className={cn(
          'shrink-0 border-t border-slate-100 p-3 dark:border-slate-800/60',
          collapsed ? 'flex justify-center' : '',
        )}>
          {collapsed ? (
            <Avatar name={user.name} size="sm" />
          ) : (
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <Avatar name={user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
