import {
  LayoutDashboard, MessageSquare, BookOpen, Library, FileText,
  BookMarked, ClipboardList, FileQuestion, Sparkles, Zap,
  Calendar, Briefcase, Mic, Image, ScanText, MessageCircleWarning,
  CalendarCheck, BarChart2, Bell, UserCircle, Settings,
  Users, Building2, ShieldCheck, Activity, FileBarChart,
  ChevronRight, Brain, Trophy, Globe,
} from 'lucide-react'
import type { ReactNode } from 'react'

export interface NavItem {
  to: string
  label: string
  icon: ReactNode
  badge?: string
  badgeColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple'
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

/* ─── Student navigation ─────────────────────────────────────────────────── */
export const studentNav: NavSection[] = [
  {
    items: [
      { to: '/student/dashboard',  label: 'Dashboard',   icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'AI Assistant',
    items: [
      { to: '/student/chat',       label: 'Ask AI',       icon: <MessageSquare size={17} />, badge: 'NEW', badgeColor: 'purple' },
      { to: '/student/ask-pdf',    label: 'Ask PDF',      icon: <FileText size={17} /> },
      { to: '/student/ocr',        label: 'Image AI',     icon: <ScanText size={17} /> },
      { to: '/student/voice',      label: 'Voice AI',     icon: <Mic size={17} /> },
    ],
  },
  {
    title: 'Study Tools',
    items: [
      { to: '/student/notes',      label: 'Notes AI',      icon: <Sparkles size={17} /> },
      { to: '/student/flashcards', label: 'Flashcards',    icon: <Zap size={17} /> },
      { to: '/student/quiz',       label: 'Quiz Generator',icon: <Brain size={17} /> },
      { to: '/student/planner',    label: 'Study Planner', icon: <Calendar size={17} /> },
    ],
  },
  {
    title: 'Library',
    items: [
      { to: '/student/library',    label: 'Library',       icon: <Library size={17} /> },
      { to: '/student/syllabus',   label: 'Syllabus',      icon: <BookMarked size={17} /> },
      { to: '/student/papers',     label: 'Question Papers',icon: <FileQuestion size={17} /> },
    ],
  },
  {
    title: 'Career',
    items: [
      { to: '/student/placement',  label: 'Placement Prep',icon: <Briefcase size={17} /> },
      { to: '/student/career',     label: 'Career AI',     icon: <Globe size={17} /> },
    ],
  },
  {
    title: 'Campus',
    items: [
      { to: '/student/complaints', label: 'Complaints',    icon: <MessageCircleWarning size={17} /> },
      { to: '/student/attendance', label: 'Attendance',    icon: <CalendarCheck size={17} /> },
      { to: '/student/results',    label: 'Results',       icon: <BarChart2 size={17} /> },
      { to: '/student/notifications', label: 'Notifications', icon: <Bell size={17} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/student/profile',    label: 'Profile',       icon: <UserCircle size={17} /> },
      { to: '/student/settings',   label: 'Settings',      icon: <Settings size={17} /> },
    ],
  },
]

/* ─── Staff navigation ───────────────────────────────────────────────────── */
export const staffNav: NavSection[] = [
  {
    items: [
      { to: '/staff/dashboard',    label: 'Dashboard',     icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'Work Queue',
    items: [
      { to: '/staff/complaints',   label: 'Complaints',    icon: <ClipboardList size={17} /> },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { to: '/staff/chat',         label: 'Ask AI',        icon: <MessageSquare size={17} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/staff/profile',      label: 'Profile',       icon: <UserCircle size={17} /> },
      { to: '/staff/settings',     label: 'Settings',      icon: <Settings size={17} /> },
    ],
  },
]

/* ─── Admin navigation ───────────────────────────────────────────────────── */
export const adminNav: NavSection[] = [
  {
    items: [
      { to: '/admin/dashboard',     label: 'Dashboard',    icon: <LayoutDashboard size={17} /> },
    ],
  },
  {
    title: 'Manage',
    items: [
      { to: '/admin/complaints',    label: 'Complaints',   icon: <ClipboardList size={17} /> },
      { to: '/admin/syllabus',      label: 'Syllabus Manager', icon: <BookMarked size={17} /> },
      { to: '/admin/departments',   label: 'Departments',  icon: <Building2 size={17} /> },
      { to: '/admin/staff',         label: 'Staff',        icon: <ShieldCheck size={17} /> },
      { to: '/admin/students',      label: 'Students',     icon: <Users size={17} /> },
      { to: '/admin/notifications', label: 'Notifications',icon: <Bell size={17} /> },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/admin/analytics',     label: 'Analytics',    icon: <BarChart2 size={17} /> },
      { to: '/admin/reports',       label: 'Reports',      icon: <FileBarChart size={17} /> },
      { to: '/admin/heatmap',       label: 'Heatmap',      icon: <Trophy size={17} /> },
      { to: '/admin/sla',           label: 'SLA',          icon: <CalendarCheck size={17} /> },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { to: '/admin/chat',          label: 'Ask AI',       icon: <MessageSquare size={17} /> },
      { to: '/admin/recommendations', label: 'AI Insights',icon: <Sparkles size={17} /> },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/logs',          label: 'Activity Logs',icon: <Activity size={17} /> },
      { to: '/admin/settings',      label: 'Settings',     icon: <Settings size={17} /> },
    ],
  },
]

export type UserRole = 'student' | 'staff' | 'admin'

export function getNav(role: UserRole): NavSection[] {
  return role === 'admin' ? adminNav : role === 'staff' ? staffNav : studentNav
}

export { ChevronRight }
