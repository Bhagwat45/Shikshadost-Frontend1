import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, MessageSquare, Brain, FileText, ScanText,
  Zap, Shield, Globe, ArrowRight, Star, ChevronRight,
  BookOpen, Users, BarChart2, CheckCircle2,
} from 'lucide-react'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { cn } from '../lib/utils'

/* ─── Animation helpers ─────────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport:   { once: true },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
})

/* ─── Feature cards ─────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <MessageSquare size={22} />, title: 'AI Chat Assistant',
    desc: 'ChatGPT-level conversations. Ask anything about your syllabus, get instant answers with markdown and code.',
    color: 'from-brand-500 to-violet-600', badge: 'Streaming',
  },
  {
    icon: <Sparkles size={22} />, title: 'Notes AI',
    desc: 'Transform any topic into beautiful, exam-ready notes. Supports English, Hindi, and Marathi.',
    color: 'from-pink-500 to-rose-600', badge: 'Multilingual',
  },
  {
    icon: <Brain size={22} />, title: 'Quiz Generator',
    desc: 'Auto-generated MCQ quizzes with timer, scoring, and detailed answer explanations.',
    color: 'from-emerald-500 to-teal-600', badge: 'Timed',
  },
  {
    icon: <Zap size={22} />, title: 'Flashcards',
    desc: 'AI-created flip-card decks. Mark known/unknown, review weak cards, track mastery.',
    color: 'from-amber-500 to-orange-600', badge: 'Spaced Repetition',
  },
  {
    icon: <ScanText size={22} />, title: 'Image AI (OCR)',
    desc: 'Photograph textbook pages or whiteboards. AI extracts text, generates notes and summaries.',
    color: 'from-sky-500 to-blue-600', badge: 'Computer Vision',
  },
  {
    icon: <FileText size={22} />, title: 'Complaint Portal',
    desc: 'AI-powered complaint routing, auto-classification, priority detection, and real-time tracking.',
    color: 'from-indigo-500 to-purple-600', badge: 'AI Routing',
  },
]

const STATS = [
  { value: '10+', label: 'AI Features', icon: <Sparkles size={20} /> },
  { value: '3',   label: 'Languages',   icon: <Globe size={20} /> },
  { value: '100%', label: 'Free',       icon: <Star size={20} /> },
  { value: '∞',   label: 'Possibilities', icon: <Zap size={20} /> },
]

const ROLES = [
  {
    role: 'student', label: 'Student', href: '/register',
    desc: 'Access AI tools, track complaints, manage academics.',
    color: 'from-brand-500 to-violet-600',
    icon: <BookOpen size={20} />,
    perks: ['AI Chat & Notes', 'Quiz & Flashcards', 'Complaint Portal', 'OCR Image AI'],
  },
  {
    role: 'staff', label: 'Staff', href: '/login',
    desc: "Manage your department's complaint queue with AI insights.",
    color: 'from-emerald-500 to-teal-600',
    icon: <Users size={20} />,
    perks: ['Complaint Queue', 'AI Assignment', 'Remarks System', 'Status Tracking'],
  },
  {
    role: 'admin', label: 'Admin', href: '/login',
    desc: 'Full platform control with AI analytics and reporting.',
    color: 'from-amber-500 to-orange-600',
    icon: <BarChart2 size={20} />,
    perks: ['Analytics Dashboard', 'AI Recommendations', 'SLA Tracking', 'User Management'],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-1)] text-slate-900 dark:text-slate-100">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[var(--surface-0)]/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-[var(--surface-1)]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">ShikshaDost</span>
            <span className="hidden rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 sm:inline-flex">
              AI
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 md:flex">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Features</a>
            <a href="#how" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">How it works</a>
            <a href="#roles" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">For you</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login"
              className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors sm:flex">
              Sign in
            </Link>
            <Link to="/register"
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Mesh gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-mesh opacity-60" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />

        <div className="relative mx-auto max-w-5xl px-4 text-center md:px-6">
          <motion.div {...fadeUp(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 dark:border-brand-800/40 dark:bg-brand-500/10 dark:text-brand-300">
              <Sparkles size={13} /> India's smartest campus platform
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl">
            Your AI Study Partner &{' '}
            <span className="bg-gradient-to-r from-brand-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Campus Assistant
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400 text-balance">
            ShikshaDost combines ChatGPT-level AI chat, smart study tools, and an intelligent complaint management system — built specifically for Indian college students.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/register"
              className="group flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all active:scale-[0.98]">
              <Sparkles size={18} />
              Start for Free
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[var(--surface-0)] px-7 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
              Sign in
            </Link>
          </motion.div>

          {/* Hero visual — chat mockup */}
          <motion.div {...fadeUp(0.4)} className="mt-16">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-[var(--surface-0)] shadow-2xl dark:border-slate-800/60 dark:bg-[var(--surface-2)]">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <div className="ml-3 flex-1 rounded-md bg-slate-200 py-1 text-center text-[10px] text-slate-400 dark:bg-slate-800">
                  ShikshaDost AI Chat
                </div>
              </div>
              {/* Mock chat */}
              <div className="space-y-4 p-5 text-left">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 text-xs font-bold dark:bg-slate-700 dark:text-slate-300">S</div>
                  <div className="max-w-xs rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Explain process scheduling in OS with examples
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
                    <Sparkles size={13} />
                  </div>
                  <div className="max-w-sm rounded-2xl rounded-tr-sm border border-slate-200/80 bg-[var(--surface-0)] px-4 py-2.5 text-sm dark:border-slate-700/50 dark:bg-[var(--surface-3)]">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Process Scheduling</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Process scheduling is the activity of the process manager that handles the removal of the running process and selection of another...</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">FCFS</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">SJF</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">Round Robin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200/60 bg-[var(--surface-0)] py-12 dark:border-slate-800/60">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.05)} className="flex flex-col items-center text-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  {s.icon}
                </span>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Features</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
              Everything you need to excel
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              Built for the Indian academic system, powered by cutting-edge AI.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.06)}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-[var(--surface-0)] p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800/60 dark:bg-[var(--surface-2)] shadow-card">
                  {/* Gradient hover overlay */}
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5', f.color)} />

                  <div className="relative">
                    <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm', f.color)}>
                      {f.icon}
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section id="how" className="border-y border-slate-200/60 bg-[var(--surface-0)] py-20 dark:border-slate-800/60">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">How It Works</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">
              Up and running in seconds
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your university email. No credit card needed.', icon: <Shield size={22} /> },
              { step: '02', title: 'Choose Your Tool', desc: 'Pick from AI Chat, Notes, Quiz, Flashcards, or Complaints.', icon: <Sparkles size={22} /> },
              { step: '03', title: 'Learn & Grow', desc: 'Get instant AI-powered help and track your academic progress.', icon: <BarChart2 size={22} /> },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)} className="relative text-center">
                {i < 2 && (
                  <div className="absolute left-full top-8 hidden w-full -translate-y-1/2 border-t-2 border-dashed border-slate-200 dark:border-slate-800 md:block" style={{ width: 'calc(100% - 3rem)', left: '50%' }} />
                )}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm">
                  {s.icon}
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role cards ──────────────────────────────────────────────── */}
      <section id="roles" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <motion.div {...fadeUp()} className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">For Everyone</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100 sm:text-4xl">Built for your role</h2>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <motion.div key={r.role} {...fadeUp(i * 0.1)}>
                <div className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-[var(--surface-0)] p-6 shadow-card dark:border-slate-800/60 dark:bg-[var(--surface-2)]">
                  <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white', r.color)}>
                    {r.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{r.label}</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{r.desc}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {r.perks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="shrink-0 text-emerald-500" /> {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={r.href}
                    className={cn(
                      'mt-6 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]',
                      `bg-gradient-to-r ${r.color}`,
                    )}
                  >
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <motion.div {...fadeUp()} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-10 text-center text-white shadow-2xl">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5" />
            <div className="relative">
              <p className="text-4xl">🎓</p>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">Ready to study smarter?</h2>
              <p className="mt-3 text-brand-100">
                Join thousands of students using ShikshaDost AI to ace their exams and campus life.
              </p>
              <Link
                to="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-brand-700 shadow-lg transition-all hover:bg-brand-50 active:scale-[0.98]"
              >
                <Sparkles size={18} /> Create Free Account <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 py-8 dark:border-slate-800/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">ShikshaDost AI</span>
          </div>
          <p>Built with ❤️ for Indian students · Final Year Project · 2024–2025</p>
          <div className="flex gap-4">
            <Link to="/login"    className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Sign in</Link>
            <Link to="/register" className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
