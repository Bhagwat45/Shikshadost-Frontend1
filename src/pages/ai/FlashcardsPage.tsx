import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Check, X, Sparkles } from 'lucide-react'
import { studyToolsService, type Flashcard, type FlashcardsResult } from '../../services/studyTools'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const COUNTS = [5, 10, 15, 20]

const DIFF_COLOR: Record<string, string> = {
  Easy:   'badge-green',
  Medium: 'badge-amber',
  Hard:   'badge-red',
}

/* ─── Flip card ─────────────────────────────────────────────────────────────── */
function FlipCard({ card, flipped, onFlip }: { card: Flashcard; flipped: boolean; onFlip: () => void }) {
  return (
    <div
      className="relative h-64 w-full cursor-pointer select-none"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Front — Question */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-8 text-center',
            'border border-slate-200/80 bg-[var(--surface-0)] shadow-card dark:border-slate-700/50 dark:bg-[var(--surface-2)]',
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-brand-500">Question</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{card.question}</p>
          {card.hint && (
            <p className="mt-4 text-xs text-slate-400">💡 Hint: {card.hint}</p>
          )}
          <p className="mt-6 text-xs text-slate-400">Tap to reveal answer</p>
        </div>

        {/* Back — Answer */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-8 text-center',
            'border border-brand-200 bg-gradient-to-br from-brand-50 to-violet-50',
            'dark:border-brand-700/40 dark:from-brand-950 dark:to-violet-950/50',
          )}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-emerald-500">Answer</p>
          <p className="text-base font-medium text-slate-800 dark:text-slate-100">{card.answer}</p>
          <span className={cn('mt-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase', DIFF_COLOR[card.difficulty])}>
            {card.difficulty}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────────── */
export default function FlashcardsPage() {
  const [topic,      setTopic]      = useState('')
  const [count,      setCount]      = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState<FlashcardsResult | null>(null)

  // Study mode
  const [cards,       setCards]       = useState<Flashcard[]>([])
  const [current,     setCurrent]     = useState(0)
  const [flipped,     setFlipped]     = useState(false)
  const [known,       setKnown]       = useState<Set<number>>(new Set())
  const [unknown,     setUnknown]     = useState<Set<number>>(new Set())
  const [studyMode,   setStudyMode]   = useState(false)

  const generate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return }
    setLoading(true)
    setResult(null)
    setStudyMode(false)
    try {
      const res = await studyToolsService.generateFlashcards(topic.trim(), count, difficulty)
      setResult(res)
      setCards(res.cards)
      setCurrent(0)
      setFlipped(false)
      setKnown(new Set())
      setUnknown(new Set())
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to generate flashcards')
    } finally {
      setLoading(false)
    }
  }

  const startStudy = () => { setStudyMode(true); setCurrent(0); setFlipped(false) }

  const next = () => { setCurrent(c => Math.min(c + 1, cards.length - 1)); setFlipped(false) }
  const prev = () => { setCurrent(c => Math.max(c - 1, 0)); setFlipped(false) }

  const markKnown = () => {
    setKnown(s => new Set(s).add(cards[current].id))
    setUnknown(s => { const n = new Set(s); n.delete(cards[current].id); return n })
    next()
  }

  const markUnknown = () => {
    setUnknown(s => new Set(s).add(cards[current].id))
    setKnown(s => { const n = new Set(s); n.delete(cards[current].id); return n })
    next()
  }

  const shuffle = () => {
    setCards(c => [...c].sort(() => Math.random() - 0.5))
    setCurrent(0); setFlipped(false)
  }

  const progress = cards.length ? Math.round(((known.size + unknown.size) / cards.length) * 100) : 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Flashcards"
        description="AI-generated flashcards for rapid revision. Flip, mark, and master."
        badge={<Badge variant="amber" dot>Study Mode</Badge>}
      />

      {/* Setup form */}
      {!studyMode && (
        <Card>
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Topic</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                placeholder="e.g. 'Binary Trees', 'Photosynthesis', 'World War II'…"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Cards</label>
                <div className="flex gap-2">
                  {COUNTS.map(c => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-sm font-semibold transition-all',
                        count === c
                          ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'flex-1 rounded-xl border py-2 text-sm font-semibold transition-all',
                        difficulty === d
                          ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" loading={loading} leftIcon={<Zap size={17} />} onClick={generate}>
              {loading ? 'Generating…' : 'Generate Flashcards'}
            </Button>
          </div>
        </Card>
      )}

      {/* Results — card grid preview */}
      {result && !studyMode && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">{result.topic}</h2>
              <p className="text-sm text-slate-500">{result.cards.length} cards · {result.difficulty}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" leftIcon={<Shuffle size={13} />} onClick={shuffle}>Shuffle</Button>
              <Button size="sm" leftIcon={<Zap size={13} />} onClick={startStudy}>Start Study</Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {cards.slice(0, 6).map(card => (
              <Card key={card.id} className="!p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{card.question}</p>
                  <Badge variant={card.difficulty === 'Hard' ? 'red' : card.difficulty === 'Easy' ? 'green' : 'amber'} size="sm">
                    {card.difficulty}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{card.answer}</p>
              </Card>
            ))}
          </div>
          {cards.length > 6 && (
            <p className="text-center text-sm text-slate-400">+{cards.length - 6} more cards in study mode</p>
          )}
        </motion.div>
      )}

      {/* Study mode */}
      {studyMode && cards.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{current + 1} / {cards.length}</span>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-600">✓ {known.size} known</span>
              <span className="text-red-500">✗ {unknown.size} unknown</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setStudyMode(false)}>
              ← Back
            </Button>
          </div>

          <ProgressBar value={progress} color="brand" size="sm" />

          {/* Flip card */}
          <FlipCard card={cards[current]} flipped={flipped} onFlip={() => setFlipped(f => !f)} />

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary" onClick={prev} disabled={current === 0}>
              <ChevronLeft size={16} />
            </Button>

            <div className="flex flex-1 gap-3">
              <button
                onClick={markUnknown}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/40 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <X size={16} /> Still Learning
              </button>
              <button
                onClick={markKnown}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              >
                <Check size={16} /> Got It
              </button>
            </div>

            <Button size="icon" variant="secondary" onClick={next} disabled={current === cards.length - 1}>
              <ChevronRight size={16} />
            </Button>
          </div>

          {/* Completion */}
          {known.size + unknown.size === cards.length && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 p-6 text-center dark:from-brand-950/50 dark:to-emerald-950/50 border border-brand-100 dark:border-brand-800/30">
              <p className="text-2xl">🎉</p>
              <h3 className="mt-2 font-bold text-slate-900 dark:text-slate-100">
                {Math.round((known.size / cards.length) * 100)}% Mastery
              </h3>
              <p className="mt-1 text-sm text-slate-500">{known.size} known · {unknown.size} to review</p>
              <div className="mt-4 flex justify-center gap-3">
                <Button size="sm" variant="secondary" onClick={() => { setFlipped(false); setCurrent(0); setKnown(new Set()); setUnknown(new Set()) }}>
                  <RotateCcw size={13} /> Restart
                </Button>
                {unknown.size > 0 && (
                  <Button size="sm" onClick={() => {
                    setCards(cards.filter(c => unknown.has(c.id)))
                    setCurrent(0); setFlipped(false); setKnown(new Set()); setUnknown(new Set())
                  }}>
                    Review {unknown.size} weak cards
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
