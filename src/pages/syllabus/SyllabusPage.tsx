import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BookMarked, Search, ChevronRight, ChevronDown, Sparkles,
  FileText, Brain, Zap, MessageSquare, Download, X,
  BookOpen, List, Layers, Filter, Globe,
} from 'lucide-react'
import { syllabusService, type SyllabusItem, type AIResult } from '../../services/syllabus'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

// ── Constants ─────────────────────────────────────────────────────────────────
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const LANGUAGES = ['English', 'Hindi', 'Marathi']

const AI_ACTIONS = [
  { value: 'explain',    label: 'Explain',    icon: <MessageSquare size={14} />, color: 'text-blue-600' },
  { value: 'summary',   label: 'Summary',    icon: <List size={14} />,          color: 'text-purple-600' },
  { value: 'notes',     label: 'Notes',      icon: <FileText size={14} />,      color: 'text-green-600' },
  { value: 'mcq',       label: 'MCQ Quiz',   icon: <Brain size={14} />,         color: 'text-amber-600' },
  { value: 'flashcards',label: 'Flashcards', icon: <Zap size={14} />,           color: 'text-pink-600' },
]

// ── Tree node for grouping ─────────────────────────────────────────────────────
interface TreeUnit { name: string; topics: SyllabusItem[] }
interface TreeSubject { name: string; units: TreeUnit[] }
interface TreeSemester { semester: number; subjects: TreeSubject[] }

function buildTree(items: SyllabusItem[]): TreeSemester[] {
  const map = new Map<number, Map<string, Map<string, SyllabusItem[]>>>()
  for (const item of items) {
    if (!map.has(item.semester)) map.set(item.semester, new Map())
    const semMap = map.get(item.semester)!
    if (!semMap.has(item.subject)) semMap.set(item.subject, new Map())
    const subjMap = semMap.get(item.subject)!
    if (!subjMap.has(item.unit)) subjMap.set(item.unit, [])
    subjMap.get(item.unit)!.push(item)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([semester, subjects]) => ({
      semester,
      subjects: Array.from(subjects.entries()).map(([name, units]) => ({
        name,
        units: Array.from(units.entries()).map(([unitName, topics]) => ({
          name: unitName, topics,
        })),
      })),
    }))
}

// ── AI Result Renderer ────────────────────────────────────────────────────────
function AIResultPanel({ result, onClose }: { result: AIResult; onClose: () => void }) {
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [revealed,   setRevealed]    = useState<Set<number>>(new Set())
  const [flipped,    setFlipped]     = useState<Set<number>>(new Set())

  if (result.action === 'explain' || result.action === 'summary') {
    return (
      <div className="ai-prose max-h-[70vh] overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content ?? ''}</ReactMarkdown>
      </div>
    )
  }

  if (result.action === 'notes') {
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="ai-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.notes ?? ''}</ReactMarkdown>
        </div>
        {result.key_points?.length ? (
          <div className="rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">Key Points</p>
            <ul className="space-y-1.5">
              {result.key_points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {result.exam_tips?.length ? (
          <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Exam Tips</p>
            <ul className="space-y-1.5">
              {result.exam_tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    )
  }

  if (result.action === 'mcq') {
    const qs = result.questions ?? []
    return (
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {qs.map((q: any) => {
          const sel = quizAnswers[q.id]
          const rev = revealed.has(q.id)
          return (
            <div key={q.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="text-slate-400 mr-1.5">Q{q.id}.</span>{q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt: string) => {
                  const letter = opt.charAt(0)
                  const isCorrect = letter === q.correct
                  const isSelected = sel === letter
                  return (
                    <button key={opt}
                      onClick={() => !rev && setQuizAnswers(a => ({ ...a, [q.id]: letter }))}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-all',
                        rev && isCorrect  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200' :
                        rev && isSelected ? 'border-red-400 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' :
                        isSelected        ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10' :
                        'border-slate-200 hover:border-slate-300 dark:border-slate-700',
                      )}
                    >
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                        rev && isCorrect  ? 'border-emerald-500 bg-emerald-500 text-white' :
                        rev && isSelected ? 'border-red-500 bg-red-500 text-white' :
                        isSelected        ? 'border-brand-500 bg-brand-500 text-white' :
                        'border-slate-300 dark:border-slate-600'
                      )}>{letter}</span>
                      {opt.slice(3)}
                    </button>
                  )
                })}
              </div>
              {!rev ? (
                <button onClick={() => setRevealed(s => new Set(s).add(q.id))}
                  className="mt-2 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  disabled={!sel}>Reveal answer</button>
              ) : (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">{q.explanation}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (result.action === 'flashcards') {
    const cards = result.cards ?? []
    return (
      <div className="max-h-[70vh] overflow-y-auto grid gap-3 sm:grid-cols-2">
        {cards.map((c: any) => (
          <button key={c.id} onClick={() => setFlipped(s => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n })}
            className="rounded-2xl border border-slate-200 p-5 text-left transition-all hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-600"
          >
            {flipped.has(c.id) ? (
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">Answer</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{c.answer}</p>
              </div>
            ) : (
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-brand-600">Question</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.question}</p>
                {c.hint && <p className="mt-2 text-xs text-slate-400">💡 {c.hint}</p>}
              </div>
            )}
          </button>
        ))}
      </div>
    )
  }

  return null
}

// ── Topic row ─────────────────────────────────────────────────────────────────
function TopicRow({
  item, language, onAI,
}: { item: SyllabusItem; language: string; onAI: (item: SyllabusItem, action: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">{item.topic}</span>
        {item.tags.slice(0, 2).map(t => (
          <span key={t} className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">{t}</span>
        ))}
        {item.pdfUrl && (
          <a href={item.pdfUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10">
            <Download size={11} /> PDF
          </a>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
              {item.description && (
                <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {AI_ACTIONS.map(a => (
                  <button key={a.value} onClick={() => onAI(item, a.value)}
                    className={cn('flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition-all hover:border-brand-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600', a.color)}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SyllabusPage() {
  const [semester,  setSemester]  = useState<number | ''>('')
  const [branch,    setBranch]    = useState('')
  const [search,    setSearch]    = useState('')
  const [language,  setLanguage]  = useState('English')
  const [openSems,  setOpenSems]  = useState<Set<number>>(new Set([1]))
  const [openSubjs, setOpenSubjs] = useState<Set<string>>(new Set())
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set())
  const [aiModal,   setAiModal]   = useState<{ item: SyllabusItem; action: string } | null>(null)
  const [aiResult,  setAiResult]  = useState<AIResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const { data: branches = [] } = useQuery({ queryKey: ['syllabus-branches'], queryFn: () => syllabusService.branches() })

  const { data: listData, isLoading } = useQuery({
    queryKey: ['syllabus', semester, branch, search],
    queryFn: () => syllabusService.list({
      semester: semester || undefined,
      branch:   branch   || undefined,
      search:   search   || undefined,
      page_size: 500,
    }),
    staleTime: 30_000,
  })

  const tree = useMemo(() => buildTree(listData?.items ?? []), [listData?.items])

  const handleAI = async (item: SyllabusItem, action: string) => {
    setAiModal({ item, action })
    setAiResult(null)
    setAiLoading(true)
    try {
      const res = await syllabusService.aiAction(item.id, action, language)
      setAiResult(res)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'AI request failed')
      setAiModal(null)
    } finally {
      setAiLoading(false)
    }
  }

  const toggleSem  = (s: number) => setOpenSems(p  => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n })
  const toggleSubj = (k: string) => setOpenSubjs(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const toggleUnit = (k: string) => setOpenUnits(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })

  const actionLabel = AI_ACTIONS.find(a => a.value === aiModal?.action)?.label ?? ''

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Smart Syllabus"
        description="Explore your course syllabus by semester, subject, and unit — with AI-powered explanations for every topic."
        badge={<Badge variant="green" dot>AI Enhanced</Badge>}
      />

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics, subjects, units…"
              className="input pl-9"
            />
          </div>
          {/* Semester */}
          <select value={semester} onChange={e => setSemester(e.target.value ? Number(e.target.value) : '')}
            className="input w-auto min-w-[140px]">
            <option value="">All Semesters</option>
            {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          {/* Branch */}
          <select value={branch} onChange={e => setBranch(e.target.value)} className="input w-auto min-w-[160px]">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {/* Language */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
            <Globe size={14} className="text-slate-400" />
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none dark:text-slate-300">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* ── Tree ────────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : tree.length === 0 ? (
        <EmptyState
          icon={<BookMarked size={28} />}
          title="No syllabus found"
          description="No topics match your filters. Try adjusting the semester or branch, or ask your admin to upload the syllabus."
        />
      ) : (
        <div className="space-y-3">
          {tree.map(sem => (
            <Card key={sem.semester} padding="none" className="overflow-hidden">
              {/* Semester header */}
              <button
                onClick={() => toggleSem(sem.semester)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {sem.semester}
                </span>
                <span className="flex-1 font-semibold text-slate-900 dark:text-slate-100">Semester {sem.semester}</span>
                <span className="text-xs text-slate-400">{sem.subjects.length} subject{sem.subjects.length !== 1 ? 's' : ''}</span>
                {openSems.has(sem.semester) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>

              <AnimatePresence initial={false}>
                {openSems.has(sem.semester) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="border-t border-slate-100 px-3 pb-3 dark:border-slate-800">
                      {sem.subjects.map(subj => {
                        const subjKey = `${sem.semester}-${subj.name}`
                        return (
                          <div key={subj.name} className="mt-3">
                            {/* Subject */}
                            <button
                              onClick={() => toggleSubj(subjKey)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                              <BookOpen size={15} className="shrink-0 text-purple-500" />
                              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{subj.name}</span>
                              <span className="text-xs text-slate-400">{subj.units.length} unit{subj.units.length !== 1 ? 's' : ''}</span>
                              {openSubjs.has(subjKey) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                            </button>

                            <AnimatePresence initial={false}>
                              {openSubjs.has(subjKey) && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                  <div className="ml-4 mt-2 space-y-2">
                                    {subj.units.map(unit => {
                                      const unitKey = `${subjKey}-${unit.name}`
                                      return (
                                        <div key={unit.name}>
                                          {/* Unit */}
                                          <button
                                            onClick={() => toggleUnit(unitKey)}
                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                          >
                                            <Layers size={13} className="shrink-0 text-emerald-500" />
                                            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{unit.name}</span>
                                            <span className="text-xs text-slate-400">{unit.topics.length} topic{unit.topics.length !== 1 ? 's' : ''}</span>
                                            {openUnits.has(unitKey) ? <ChevronDown size={13} className="text-slate-400" /> : <ChevronRight size={13} className="text-slate-400" />}
                                          </button>

                                          <AnimatePresence initial={false}>
                                            {openUnits.has(unitKey) && (
                                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                                                <div className="ml-5 mt-2 space-y-2 pb-2">
                                                  {unit.topics.map(topic => (
                                                    <TopicRow key={topic.id} item={topic} language={language} onAI={handleAI} />
                                                  ))}
                                                </div>
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {/* ── AI Modal ────────────────────────────────────────────────────────── */}
      <Modal
        open={!!aiModal}
        onClose={() => { setAiModal(null); setAiResult(null) }}
        title={`${actionLabel}: ${aiModal?.item.topic ?? ''}`}
        description={`${aiModal?.item.subject} · ${aiModal?.item.unit}`}
        size="xl"
      >
        {aiLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
              <Sparkles size={26} className="animate-pulse text-brand-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Generating {actionLabel.toLowerCase()}…</p>
          </div>
        ) : aiResult ? (
          <AIResultPanel result={aiResult} onClose={() => { setAiModal(null); setAiResult(null) }} />
        ) : null}
      </Modal>
    </div>
  )
}
