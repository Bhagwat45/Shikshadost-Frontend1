import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Sidebar } from '../components/layout/Sidebar'
import { Header } from '../components/layout/Header'
import type { UserRole } from '../components/layout/navConfig'

const COLLAPSED_KEY = 'sd_sidebar_collapsed'
const SIDEBAR_W = 260
const COLLAPSED_W = 70

export default function DashboardLayout() {
  const { user, logout } = useAuth()

  const [mobileOpen, setMobileOpen]     = useState(false)
  const [collapsed,  setCollapsed]      = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === '1' } catch { return false }
  })

  // Persist collapsed state
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0') } catch {}
  }, [collapsed])

  // Close mobile sidebar on route change / resize
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  if (!user) return null

  const sidebarWidth = collapsed ? COLLAPSED_W : SIDEBAR_W

  return (
    <div className="min-h-screen bg-[var(--surface-1)]">
      {/* Sidebar */}
      <Sidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
      />

      {/* Header — fixed, left offset matches sidebar */}
      <Header
        user={user}
        onMobileMenuOpen={() => setMobileOpen(true)}
        onSidebarToggle={() => setCollapsed(c => !c)}
        sidebarCollapsed={collapsed}
        sidebarWidth={sidebarWidth}
        onLogout={logout}
      />

      {/* Main content — margin-left tracks sidebar width on desktop */}
      <motion.main
        className="min-h-screen pt-[60px] transition-all duration-300 md:ml-[var(--sidebar-offset)]"
        style={{ '--sidebar-offset': `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Bottom mobile nav — shown on mobile only */}
        <MobileBottomNav role={user.role as UserRole} />

        <div className="p-4 pb-24 md:p-6 md:pb-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}

/* ─── Mobile bottom tab bar ──────────────────────────────────────────────── */
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, MessageCircleWarning, Bell, UserCircle,
} from 'lucide-react'
import { cn } from '../lib/utils'

function MobileBottomNav({ role }: { role: UserRole }) {
  const tabs = role === 'admin'
    ? [
        { to: '/admin/dashboard',  label: 'Home',       icon: <LayoutDashboard size={20} /> },
        { to: '/admin/complaints', label: 'Complaints', icon: <MessageCircleWarning size={20} /> },
        { to: '/admin/analytics',  label: 'Analytics',  icon: <Bell size={20} /> },
        { to: '/admin/chat',       label: 'AI',         icon: <MessageSquare size={20} /> },
        { to: '/admin/settings',   label: 'Settings',   icon: <UserCircle size={20} /> },
      ]
    : role === 'staff'
    ? [
        { to: '/staff/dashboard',  label: 'Home',       icon: <LayoutDashboard size={20} /> },
        { to: '/staff/complaints', label: 'Queue',      icon: <MessageCircleWarning size={20} /> },
        { to: '/staff/chat',       label: 'AI',         icon: <MessageSquare size={20} /> },
        { to: '/staff/profile',    label: 'Profile',    icon: <UserCircle size={20} /> },
      ]
    : [
        { to: '/student/dashboard',  label: 'Home',       icon: <LayoutDashboard size={20} /> },
        { to: '/student/chat',       label: 'AI',         icon: <MessageSquare size={20} /> },
        { to: '/student/complaints', label: 'Complaints', icon: <MessageCircleWarning size={20} /> },
        { to: '/student/notifications', label: 'Alerts', icon: <Bell size={20} /> },
        { to: '/student/profile',    label: 'Profile',   icon: <UserCircle size={20} /> },
      ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-[var(--surface-0)]/95 backdrop-blur-md dark:border-slate-800 dark:bg-[var(--surface-1)]/95 md:hidden">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to.endsWith('dashboard')}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-500',
            )
          }
        >
          {tab.icon}
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
