import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Sparkles, Download, Copy, Check, BookOpen,
  ChevronDown, Lightbulb, Target, FileText,
} from 'lucide-react'
import { studyToolsService, type NotesResult } from '../../services/studyTools'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const STYLES = [
  { value: 'detailed',  label: 'Detailed',  desc: 'Full explanation with examples' },
  { value: 'summary',   label: 'Summary',   desc: 'Concise key points only' },
  { value: 'bullet',    label: 'Bullet',    desc: 'Clean bullet-point format' },
  { value: 'mindmap',   label: 'Mind Map',  desc: 'Hierarchical topic breakdown' },
]

const LANGUAGES = ['English', 'Hindi', 'Marathi']

const SAMPLE_TOPICS = [
  'Process Scheduling in Operating Systems',
  'Normalization in Database Management Systems',
  'Linked Lists and their types',
  'Newton\'s Laws of Motion',
  'Photosynthesis process',
  'French Revolution causes and effects',
]

export default function NotesAIPage() {
  const [topic,    setTopic]    = useState('')
  const [style,    setStyle]    = useState('detailed')
  const [language, setLanguage] = useState('English')
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<NotesResult | null>(null)
  const [copied,   setCopied]   = useState(false)

  const generate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await studyToolsService.generateNotes(topic.trim(), style, language)
      setResult(res)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Failed to generate notes')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.notes)
    setCopied(true)
    toast.success('Notes copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!result) return
    const md = `# ${result.title}\n\n${result.notes}`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `${result.title.replace(/\s+/g, '_')}.md`
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Notes AI"
        description="Generate comprehensive, exam-ready notes on any topic in seconds."
        badge={<Badge variant="purple" dot>AI Powered</Badge>}
      />

      {/* Input Card */}
      <Card>
        <div className="space-y-5">
          {/* Topic input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Topic or Paste Text
            </label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. 'Process Scheduling in Operating Systems' or paste your textbook paragraph…"
              rows={4}
              className="input resize-none"
            />
            {/* Sample topics */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SAMPLE_TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Style + Language */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Note Style</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all',
                      style === s.value
                        ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                    )}
                  >
                    <p className={cn('text-sm font-semibold', style === s.value ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300')}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
              <div className="flex flex-col gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all',
                      language === l
                        ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700',
                    )}
                  >
                    <span className={cn('h-4 w-4 rounded-full border-2', language === l ? 'border-brand-500 bg-brand-500' : 'border-slate-300 dark:border-slate-600')} />
                    <span className={cn('text-sm font-medium', language === l ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300')}>
                      {l}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            loading={loading}
            leftIcon={<Sparkles size={17} />}
            onClick={generate}
          >
            {loading ? 'Generating Notes…' : 'Generate Notes'}
          </Button>
        </div>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Title + actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{result.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{result.summary}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="secondary" leftIcon={copied ? <Check size={13} /> : <Copy size={13} />} onClick={handleCopy}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button size="sm" variant="secondary" leftIcon={<Download size={13} />} onClick={handleDownload}>
                  .md
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Main notes */}
              <div className="lg:col-span-2">
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={15} className="text-brand-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notes</h3>
                  </div>
                  <div className="ai-prose max-h-[600px] overflow-y-auto pr-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.notes}</ReactMarkdown>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Key Points */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={15} className="text-emerald-500" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Key Points</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.key_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          {i + 1}
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Important terms */}
                {result.important_terms?.length > 0 && (
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={15} className="text-purple-500" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Key Terms</h3>
                    </div>
                    <div className="space-y-2.5">
                      {result.important_terms.slice(0, 6).map((t, i) => (
                        <div key={i}>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.term}</p>
                          <p className="text-xs text-slate-500">{t.definition}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Exam Tips */}
                {result.exam_tips?.length > 0 && (
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={15} className="text-amber-500" />
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Exam Tips</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.exam_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
