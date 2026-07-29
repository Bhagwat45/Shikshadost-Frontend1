import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MessageSquare, FileText, Brain, Zap, Clock, CalendarCheck,
  TrendingUp, ArrowRight, Sparkles, BookOpen, ChevronRight,
  AlertCircle, CheckCircle2, Loader2, Bell,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { complaintService } from '../../services/complaints'
import { Card, StatCard, Badge, SkeletonCard, ProgressBar } from '../../components/ui'
import { cn, formatDate, timeAgo } from '../../lib/utils'

/* ─── Motivation quotes ──────────────────────────────────────────────────── */
const QUOTES = [
  { text: 'Success is the sum of small efforts repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Education is the passport to the future.', author: 'Malcolm X' },
  { text: 'Learning never exhausts the mind.', author: 'Leonardo da Vinci' },
  { text: 'The beautiful thing about learning is that no one can take it away.', author: 'B.B. King' },
]

/* ─── Today's timetable (static demo — real data via API later) ──────────── */
const TIMETABLE = [
  { time: '09:00', subject: 'Data Structures', room: 'Lab 3', type: 'Lab', color: 'blue' },
  { time: '11:00', subject: 'Operating Systems', room: 'Room 201', type: 'Lecture', color: 'purple' },
  { time: '14:00', subject: 'Database Systems', room: 'Room 105', type: 'Lecture', color: 'green' },
  { time: '16:00', subject: 'Project Meeting', room: 'Seminar Hall', type: 'Project', color: 'amber' },
]

/* ─── Quick actions ──────────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: 'Voice AI',       desc: 'ChatGPT voice assistant',icon: <Sparkles size={20} />,       to: '/student/voice',     color: 'from-brand-500 to-violet-600' },
  { label: 'Smart Syllabus', desc: 'Semester & unit topics', icon: <BookOpen size={20} />,       to: '/student/syllabus',  color: 'from-blue-500 to-indigo-600' },
  { label: 'Digital Library',desc: 'Books, notes & QA',      icon: <FileText size={20} />,       to: '/student/library',   color: 'from-sky-500 to-cyan-600' },
  { label: 'Career AI',      desc: 'Roadmaps & salary stats',icon: <TrendingUp size={20} />,     to: '/student/career',    color: 'from-purple-500 to-pink-600' },
  { label: 'Placement Prep', desc: 'ATS, Mock & Coding',     icon: <Brain size={20} />,          to: '/student/placement', color: 'from-amber-500 to-orange-600' },
  { label: 'Ask AI Chat',    desc: 'Chat & doubt solver',   icon: <MessageSquare size={20} />,  to: '/student/chat',      color: 'from-emerald-500 to-teal-600' },
]

/* ─── Greeting helper ────────────────────────────────────────────────────── */
function greeting(name: string) {
  const h = new Date().getHours()
  const salutation = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const first = name.split(' ')[0]
  return `${salutation}, ${first} 👋`
}

/* ─── Status chip colours ────────────────────────────────────────────────── */
const STATUS_COLOR: Record<string, string> = {
  Pending:      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  Assigned:     'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'In Progress':'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  Resolved:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Rejected:     'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
}

const CLASS_COLOR: Record<string, string> = {
  blue:   'border-l-blue-500   bg-blue-50   dark:bg-blue-500/10',
  purple: 'border-l-purple-500 bg-purple-50 dark:bg-purple-500/10',
  green:  'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  amber:  'border-l-amber-500  bg-amber-50  dark:bg-amber-500/10',
}

/* ─── Card wrapper ───────────────────────────────────────────────────────── */
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function StudentDashboardPage() {
  const { user } = useAuth()
  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['complaint-stats'],
    queryFn: () => complaintService.getStats(),
    staleTime: 60_000,
  })

  const { data: myComplaints, isLoading: listLoading } = useQuery({
    queryKey: ['my-complaints-recent'],
    queryFn: () => complaintService.getMyComplaints({ pageSize: 4, sort: 'newest' }),
    staleTime: 30_000,
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* ── Hero greeting ──────────────────────────────────────────── */}
      <Section delay={0}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-6 text-white md:p-8">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 right-32 h-40 w-40 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-200">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                {greeting(user?.name ?? 'Student')}
              </h1>
              <p className="mt-2 max-w-md text-sm text-brand-100">
                "{quote.text}"
                <span className="ml-1 text-brand-300">— {quote.author}</span>
              </p>
            </div>

            <Link
              to="/student/chat"
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Sparkles size={16} />
              Ask AI anything
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Stats row ──────────────────────────────────────────────── */}
      <Section delay={0.05}>
        {statsLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Complaints" value={stats?.total ?? 0}        icon={<FileText size={18} />} color="indigo" />
            <StatCard label="Pending"          value={stats?.pending ?? 0}      icon={<AlertCircle size={18} />} color="amber" />
            <StatCard label="In Progress"      value={stats?.inProgress ?? 0}   icon={<Loader2 size={18} />}  color="blue" />
            <StatCard label="Resolved"         value={stats?.resolved ?? 0}     icon={<CheckCircle2 size={18} />} color="green" />
          </div>
        )}
      </Section>

      {/* ── Main 2-col grid ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left 2/3 */}
        <div className="space-y-6 lg:col-span-2">

          {/* Quick actions */}
          <Section delay={0.1}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
                <span className="text-xs text-slate-400">Powered by AI</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUICK_ACTIONS.map(a => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="group relative overflow-hidden rounded-2xl p-4 transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {/* gradient bg */}
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-15 transition-opacity', a.color)} />
                    <div className="relative">
                      <span className={cn('mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white', a.color)}>
                        {a.icon}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </Section>

          {/* Today's timetable */}
          <Section delay={0.15}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Today's Schedule</h2>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock size={13} />
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
                </span>
              </div>
              <div className="space-y-2.5">
                {TIMETABLE.map((cls, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border-l-4 px-4 py-3',
                      CLASS_COLOR[cls.color],
                    )}
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cls.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{cls.subject}</p>
                      <p className="text-xs text-slate-500">{cls.room}</p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {cls.type}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* Recent complaints */}
          <Section delay={0.2}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Recent Complaints</h2>
                <Link to="/student/complaints" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                  View all <ChevronRight size={13} />
                </Link>
              </div>

              {listLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 skeleton rounded-xl" />
                  ))}
                </div>
              ) : myComplaints?.items.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No complaints yet.{' '}
                  <Link to="/student/complaints/new" className="text-brand-600 hover:underline">File one now</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {myComplaints?.items.map(c => (
                    <Link
                      key={c.id}
                      to={`/student/complaints/${c.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-1 px-1 rounded-lg transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{c.title}</p>
                        <p className="text-xs text-slate-400">{c.ticketId} · {timeAgo(c.createdAt)}</p>
                      </div>
                      <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_COLOR[c.status])}>
                        {c.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </Section>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">

          {/* Attendance widget */}
          <Section delay={0.1}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Attendance</h2>
                <Link to="/student/attendance" className="text-xs text-brand-600 hover:underline dark:text-brand-400">Details</Link>
              </div>
              <div className="flex flex-col items-center py-2">
                {/* Circular progress */}
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#attendGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.78)}`}
                    />
                    <defs>
                      <linearGradient id="attendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">78%</p>
                    <p className="text-[10px] text-slate-400">Overall</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2.5">
                {[
                  { subject: 'Data Structures', pct: 85 },
                  { subject: 'OS',              pct: 72 },
                  { subject: 'DBMS',            pct: 90 },
                ].map(s => (
                  <ProgressBar key={s.subject} label={s.subject} value={s.pct} showValue size="sm"
                    color={s.pct >= 75 ? 'green' : 'amber'} />
                ))}
              </div>
            </Card>
          </Section>

          {/* AI Usage this week */}
          <Section delay={0.15}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">AI Activity</h2>
                <TrendingUp size={15} className="text-brand-500" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Chat sessions',  value: '12', icon: <MessageSquare size={14} />, color: 'text-brand-600' },
                  { label: 'Notes generated',value: '5',  icon: <Sparkles size={14} />,     color: 'text-pink-600' },
                  { label: 'Quizzes taken',  value: '3',  icon: <Brain size={14} />,         color: 'text-emerald-600' },
                  { label: 'Flashcards',     value: '24', icon: <Zap size={14} />,           color: 'text-amber-600' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className={cn('flex items-center gap-2 text-sm', stat.color)}>
                      {stat.icon}
                      <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{stat.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {/* Upcoming */}
          <Section delay={0.2}>
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">Upcoming</h2>
                <Bell size={15} className="text-slate-400" />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'OS Mid-term Exam',      date: 'Aug 2', type: 'Exam',       color: 'red' },
                  { label: 'DBMS Assignment due',   date: 'Aug 5', type: 'Assignment', color: 'amber' },
                  { label: 'Lab Record submission', date: 'Aug 8', type: 'Lab',        color: 'blue' },
                ].map(e => (
                  <div key={e.label} className="flex items-start gap-3">
                    <span className={cn(
                      'mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase',
                      e.color === 'red'   && 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
                      e.color === 'amber' && 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
                      e.color === 'blue'  && 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
                    )}>
                      {e.type}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{e.label}</p>
                      <p className="text-xs text-slate-400">{e.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

        </div>
      </div>
    </div>
  )
}
