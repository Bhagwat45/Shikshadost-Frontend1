import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Timer, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, Sparkles } from 'lucide-react'
import { studyToolsService, type QuizQuestion, type QuizResult } from '../../services/studyTools'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
const COUNTS = [5, 10, 15, 20]

type Phase = 'setup' | 'quiz' | 'result'

function getScoreGrade(pct: number) {
  if (pct >= 90) return { label: 'Excellent!',   color: 'text-emerald-600', emoji: '🏆' }
  if (pct >= 75) return { label: 'Good Job!',     color: 'text-brand-600',   emoji: '🎯' }
  if (pct >= 50) return { label: 'Keep Going!',   color: 'text-amber-600',   emoji: '📚' }
  return                { label: 'Need Practice', color: 'text-red-600',     emoji: '💪' }
}

export default function QuizPage() {
  const [topic,      setTopic]      = useState('')
  const [count,      setCount]      = useState(10)
  const [difficulty, setDifficulty] = useState('Medium')
  const [loading,    setLoading]    = useState(false)
  const [quiz,       setQuiz]       = useState<QuizResult | null>(null)
  const [phase,      setPhase]      = useState<Phase>('setup')

  // Quiz state
  const [currentQ,  setCurrentQ]  = useState(0)
  const [selected,  setSelected]  = useState<string | null>(null)
  const [answered,  setAnswered]  = useState(false)
  const [answers,   setAnswers]   = useState<Record<number, string>>({})
  const [timeLeft,  setTimeLeft]  = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Timer
  useEffect(() => {
    if (phase !== 'quiz' || answered) return
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          autoAnswer()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [currentQ, phase, answered])

  const autoAnswer = () => {
    if (!answered && quiz) {
      const q = quiz.questions[currentQ]
      setAnswers(a => ({ ...a, [q.id]: '' }))
      setAnswered(true)
    }
  }

  const generate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return }
    setLoading(true)
    try {
      const res = await studyToolsService.generateQuiz(topic.trim(), count, difficulty)
      setQuiz(res)
      setPhase('setup')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setCurrentQ(0); setSelected(null); setAnswered(false)
    setAnswers({}); setPhase('quiz')
  }

  const handleSelect = (opt: string) => {
    if (answered) return
    clearInterval(timerRef.current!)
    setSelected(opt)
    setAnswered(true)
    const q = quiz!.questions[currentQ]
    setAnswers(a => ({ ...a, [q.id]: opt }))
  }

  const handleNext = () => {
    if (currentQ + 1 >= (quiz?.questions.length ?? 0)) {
      setPhase('result')
    } else {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const restart = () => {
    setCurrentQ(0); setSelected(null); setAnswered(false)
    setAnswers({}); setPhase('quiz')
  }

  // ── Score
  const correctCount = quiz
    ? quiz.questions.filter(q => answers[q.id] === q.correct).length
    : 0
  const scorePct = quiz ? Math.round((correctCount / quiz.questions.length) * 100) : 0
  const grade = getScoreGrade(scorePct)

  // ── Option letter parsing
  const optionLetter = (opt: string) => opt.charAt(0)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Quiz Generator"
        description="AI-generated MCQ quizzes with timer, scoring, and explanations."
        badge={<Badge variant="indigo" dot>AI Powered</Badge>}
      />

      {/* Setup */}
      {phase === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Card>
            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Topic</label>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()}
                  placeholder="e.g. 'Stack and Queue', 'Thermodynamics', 'Indian History'…"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Questions</label>
                  <div className="flex gap-2">
                    {COUNTS.map(c => (
                      <button key={c} onClick={() => setCount(c)}
                        className={cn('flex-1 rounded-xl border py-2 text-sm font-semibold transition-all',
                          count === c ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400')}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTIES.map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={cn('flex-1 rounded-xl border py-2 text-sm font-semibold transition-all',
                          difficulty === d ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400')}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full" size="lg" loading={loading} leftIcon={<Brain size={17} />} onClick={generate}>
                {loading ? 'Generating Quiz…' : 'Generate Quiz'}
              </Button>
            </div>
          </Card>

          {quiz && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="!p-0 overflow-hidden">
                <div className="border-b border-slate-100 bg-gradient-to-r from-brand-50 to-violet-50 p-5 dark:border-slate-800 dark:from-brand-950/30 dark:to-violet-950/30">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{quiz.title}</h3>
                  <p className="text-sm text-slate-500">{quiz.questions.length} questions · {quiz.difficulty} · 30s per question</p>
                </div>
                <div className="p-5">
                  <Button className="w-full" size="lg" leftIcon={<Sparkles size={16} />} onClick={startQuiz}>
                    Start Quiz Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Quiz in progress */}
      {phase === 'quiz' && quiz && (
        <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {/* Progress bar + timer */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <ProgressBar
                value={Math.round((currentQ / quiz.questions.length) * 100)}
                size="sm" color="brand"
              />
            </div>
            <div className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold tabular-nums transition-colors',
              timeLeft <= 10
                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-500/10 dark:text-red-400'
                : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400',
            )}>
              <Timer size={14} />
              {timeLeft}s
            </div>
          </div>

          <p className="text-xs text-slate-400">Question {currentQ + 1} of {quiz.questions.length}</p>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}>
              <Card className="!p-6">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  {quiz.questions[currentQ].question}
                </p>

                <div className="mt-5 space-y-3">
                  {quiz.questions[currentQ].options.map(opt => {
                    const letter = optionLetter(opt)
                    const isCorrect = letter === quiz.questions[currentQ].correct
                    const isSelected = selected === letter || answers[quiz.questions[currentQ].id] === letter

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(letter)}
                        disabled={answered}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition-all',
                          !answered && 'hover:border-brand-300 hover:bg-brand-50 dark:hover:border-brand-600 dark:hover:bg-brand-500/10',
                          answered && isCorrect && 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200',
                          answered && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-500/15 dark:text-red-300',
                          !answered && 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
                          answered && !isSelected && !isCorrect && 'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500',
                        )}
                      >
                        <span className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                          answered && isCorrect  && 'border-emerald-500 bg-emerald-500 text-white',
                          answered && isSelected && !isCorrect && 'border-red-500 bg-red-500 text-white',
                          !answered && 'border-slate-300 dark:border-slate-600',
                          answered && !isSelected && !isCorrect && 'border-slate-200 dark:border-slate-700',
                        )}>
                          {answered && isCorrect  ? <CheckCircle2 size={13} /> :
                           answered && isSelected ? <XCircle size={13} /> : letter}
                        </span>
                        {opt.slice(3)}
                      </button>
                    )
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {answered && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 overflow-hidden rounded-xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800/30 dark:bg-brand-500/10">
                      <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-1">Explanation</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{quiz.questions[currentQ].explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </AnimatePresence>

          {answered && (
            <Button className="w-full" onClick={handleNext} rightIcon={<ChevronRight size={15} />}>
              {currentQ + 1 >= quiz.questions.length ? 'See Results' : 'Next Question'}
            </Button>
          )}
        </motion.div>
      )}

      {/* Results */}
      {phase === 'result' && quiz && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          {/* Score card */}
          <Card className="!p-8 text-center">
            <p className="text-5xl">{grade.emoji}</p>
            <p className={cn('mt-3 text-2xl font-bold', grade.color)}>{grade.label}</p>
            <p className="mt-1 text-5xl font-black text-slate-900 dark:text-slate-100">{scorePct}%</p>
            <p className="mt-2 text-sm text-slate-500">{correctCount} of {quiz.questions.length} correct</p>

            <div className="mx-auto mt-6 max-w-xs">
              <ProgressBar value={scorePct} size="lg"
                color={scorePct >= 75 ? 'green' : scorePct >= 50 ? 'brand' : 'amber'}
              />
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" leftIcon={<RotateCcw size={14} />} onClick={restart}>Retake</Button>
              <Button variant="secondary" onClick={() => { setQuiz(null); setPhase('setup'); setTopic('') }}>New Quiz</Button>
            </div>
          </Card>

          {/* Answer review */}
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Review Answers</h3>
          <div className="space-y-3">
            {quiz.questions.map((q, i) => {
              const userAns = answers[q.id]
              const correct = userAns === q.correct
              return (
                <Card key={q.id} className={cn(
                  '!p-4 border-l-4',
                  correct ? 'border-l-emerald-500' : 'border-l-red-500',
                )}>
                  <div className="flex items-start gap-3">
                    <span className={cn('mt-0.5 shrink-0', correct ? 'text-emerald-500' : 'text-red-500')}>
                      {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        <span className="text-slate-400 mr-1.5">Q{i + 1}.</span>{q.question}
                      </p>
                      {!correct && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          Your answer: {q.options.find(o => o.startsWith(userAns)) ?? 'Not answered'}
                        </p>
                      )}
                      <p className={cn('mt-0.5 text-xs font-medium', correct ? 'text-emerald-600' : 'text-emerald-600')}>
                        Correct: {q.options.find(o => o.startsWith(q.correct))}
                      </p>
                      <p className="mt-1.5 text-xs text-slate-500">{q.explanation}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
