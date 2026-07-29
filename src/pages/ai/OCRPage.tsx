import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ScanText, Upload, X, FileImage, Sparkles,
  Copy, Check, FileText, List, BookOpen, MessageSquare,
} from 'lucide-react'
import { studyToolsService, type OcrResult } from '../../services/studyTools'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui/Tabs'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const ACTIONS = [
  { value: 'extract',   label: 'Extract Text',   icon: <FileText size={15} />,   desc: 'Clean raw text from image' },
  { value: 'summarize', label: 'Summarize',       icon: <List size={15} />,       desc: 'Brief summary of content' },
  { value: 'notes',     label: 'Convert to Notes',icon: <BookOpen size={15} />,   desc: 'Structured study notes' },
  { value: 'explain',   label: 'Explain',         icon: <MessageSquare size={15} />, desc: 'Detailed explanation' },
]

export default function OCRPage() {
  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState<string | null>(null)
  const [action,    setAction]    = useState('extract')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<OcrResult | null>(null)
  const [activeTab, setActiveTab] = useState('extracted')
  const [copied,    setCopied]    = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10 MB.')
      return
    }
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(f)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const process = async () => {
    if (!file) { toast.error('Please upload an image first'); return }
    setLoading(true); setResult(null)
    try {
      const res = await studyToolsService.processOcr(file, action)
      setResult(res)
      setActiveTab(action === 'extract' ? 'extracted' : action === 'notes' ? 'notes' : 'summary')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'OCR processing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true); toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Image AI"
        description="Upload any image — textbook page, whiteboard, handwritten notes — and extract or convert the content."
        badge={<Badge variant="blue" dot>OCR + AI</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: upload + settings ── */}
        <div className="space-y-4">
          {/* Drop zone */}
          <Card
            className={cn(
              '!p-0 overflow-hidden transition-all cursor-pointer',
              dragging && 'border-brand-400 ring-2 ring-brand-400/30',
            )}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input
              ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="h-64 w-full object-contain bg-slate-100 dark:bg-slate-800" />
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null) }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="border-t border-slate-100 bg-[var(--surface-0)] p-3 dark:border-slate-800 dark:bg-[var(--surface-2)]">
                  <div className="flex items-center gap-2">
                    <FileImage size={14} className="text-slate-400" />
                    <p className="text-xs text-slate-500 truncate">{file?.name}</p>
                    <p className="ml-auto text-xs text-slate-400">
                      {file ? (file.size / 1024).toFixed(0) + ' KB' : ''}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className={cn(
                  'mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors',
                  dragging ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                )}>
                  <Upload size={28} />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {dragging ? 'Drop your image here' : 'Upload an image'}
                </p>
                <p className="mt-1 text-sm text-slate-400">Drag & drop or click to browse</p>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, GIF · Max 10 MB</p>
              </div>
            )}
          </Card>

          {/* Action selector */}
          <Card>
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">What should AI do?</p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAction(a.value)}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all',
                    action === a.value
                      ? 'border-brand-400 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
                  )}
                >
                  <span className={cn('mt-0.5', action === a.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')}>
                    {a.icon}
                  </span>
                  <div>
                    <p className={cn('text-xs font-semibold', action === a.value ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300')}>
                      {a.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button
              className="mt-4 w-full"
              size="lg"
              loading={loading}
              disabled={!file}
              leftIcon={<ScanText size={17} />}
              onClick={process}
            >
              {loading ? 'Processing…' : 'Process Image'}
            </Button>
          </Card>
        </div>

        {/* ── Right: results ── */}
        <div>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-center dark:border-slate-800"
              >
                <ScanText size={36} className="mb-3 text-slate-300 dark:text-slate-700" />
                <p className="font-medium text-slate-400">Results will appear here</p>
                <p className="mt-1 text-sm text-slate-400">Upload an image and click Process</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10">
                  <Sparkles size={28} className="animate-pulse text-brand-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">AI is reading your image…</p>
                  <p className="mt-1 text-sm text-slate-400">This may take a few seconds</p>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="h-2 w-2 rounded-full bg-brand-400"
                      style={{ animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="!p-0 overflow-hidden h-full">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ScanText size={15} className="text-brand-500" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Results</span>
                    </div>
                    <Button
                      size="sm" variant="ghost"
                      leftIcon={copied ? <Check size={12} /> : <Copy size={12} />}
                      onClick={() => handleCopy(result.extracted_text || result.notes || result.summary)}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <Tabs value={activeTab} onChange={setActiveTab} className="p-4">
                    <TabList className="mb-4">
                      {result.extracted_text && <Tab value="extracted">Text</Tab>}
                      {result.summary && <Tab value="summary">Summary</Tab>}
                      {result.notes && <Tab value="notes">Notes</Tab>}
                      {result.key_points?.length > 0 && <Tab value="points">Key Points</Tab>}
                    </TabList>

                    <div className="max-h-[500px] overflow-y-auto">
                      <TabPanel value="extracted">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {result.extracted_text || 'No text found in image.'}
                        </pre>
                      </TabPanel>

                      <TabPanel value="summary">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                      </TabPanel>

                      <TabPanel value="notes">
                        <div className="ai-prose">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.notes}</ReactMarkdown>
                        </div>
                      </TabPanel>

                      <TabPanel value="points">
                        <ul className="space-y-2">
                          {result.key_points?.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                                {i + 1}
                              </span>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </TabPanel>
                    </div>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
