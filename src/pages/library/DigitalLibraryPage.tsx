import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Library, Search, Filter, Star, Bookmark, Download, ExternalLink,
  Sparkles, FileText, BookOpen, Layers, Plus, Eye, Languages,
  MessageSquare, ChevronRight, X, ThumbsUp, Send, Check
} from 'lucide-react'
import { libraryService, type LibraryDocument } from '../../services/library'
import { Card, PageHeader, Badge, Button, Modal, Skeleton, EmptyState } from '../../components/ui'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

const CATEGORIES = ['All', 'Books', 'Notes', 'Question Papers', 'Assignments', 'Lab Manuals']
const FORMATS = ['All', 'PDF', 'DOCX', 'PPT', 'Book']
const LANGUAGES = ['English', 'Hindi', 'Marathi']

export default function DigitalLibraryPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [fileType, setFileType] = useState('All')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular')

  // Modals & Drawers
  const [previewDoc, setPreviewDoc] = useState<LibraryDocument | null>(null)
  const [aiDoc, setAiDoc] = useState<LibraryDocument | null>(null)
  const [aiAction, setAiAction] = useState('summary')
  const [aiLanguage, setAiLanguage] = useState('English')
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addForm, setAddForm] = useState({
    title: '',
    category: 'Notes',
    file_type: 'PDF',
    subject: '',
    branch: 'All',
    semester: 1,
    description: '',
    file_url: '',
    author: 'Student Contributor',
  })

  // Queries
  const { data: listData, isLoading } = useQuery({
    queryKey: ['library-docs', search, category, fileType, sortBy],
    queryFn: () => libraryService.list({
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      file_type: fileType !== 'All' ? fileType : undefined,
      sort_by: sortBy,
      page_size: 50,
    }),
  })

  const { data: recs = [] } = useQuery({
    queryKey: ['library-recs'],
    queryFn: () => libraryService.recommendations(),
  })

  const bookmarkMutation = useMutation({
    mutationFn: (id: string) => libraryService.toggleBookmark(id),
    onSuccess: (res, id) => {
      toast.success(res.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks')
      queryClient.invalidateQueries({ queryKey: ['library-docs'] })
    },
  })

  const downloadMutation = useMutation({
    mutationFn: (id: string) => libraryService.download(id),
  })

  const addDocMutation = useMutation({
    mutationFn: (data: any) => libraryService.create(data),
    onSuccess: () => {
      toast.success('Document uploaded to library!')
      queryClient.invalidateQueries({ queryKey: ['library-docs'] })
      setAddModalOpen(false)
      setAddForm({
        title: '', category: 'Notes', file_type: 'PDF', subject: '', branch: 'All', semester: 1, description: '', file_url: '', author: 'Student Contributor'
      })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to upload document'),
  })

  const handleDownload = (doc: LibraryDocument) => {
    downloadMutation.mutate(doc.id)
    window.open(doc.fileUrl || '#', '_blank')
  }

  const runAiAction = async (action: string) => {
    if (!aiDoc) return
    setAiAction(action)
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await libraryService.aiAction(aiDoc.id, action, aiLanguage, userQuestion)
      setAiResult(res)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'AI processing failed')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── Glassmorphic Hero ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-6 text-white shadow-2xl md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={14} /> AI-Powered Digital Library
            </div>
            <h1 className="mt-3 text-2xl font-black tracking-tight md:text-4xl">
              Access Smart Study Materials
            </h1>
            <p className="mt-2 text-sm text-brand-100">
              Explore thousands of verified textbooks, notes, past exam question papers, lab manuals, and assignments with instant Gemini AI summary & Q&A.
            </p>
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="shrink-0 bg-white text-brand-700 hover:bg-brand-50 shadow-lg"
          >
            <Plus size={16} className="mr-1.5" /> Upload Document
          </Button>
        </div>

        {/* Search bar inside hero */}
        <div className="relative mt-6 max-w-3xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents by title, subject, branch, or keywords..."
            className="w-full rounded-2xl border-0 bg-white/95 py-3.5 pl-11 pr-4 text-sm text-slate-900 shadow-xl placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/30 dark:bg-slate-900/90 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all',
                category === cat
                  ? 'bg-white text-brand-700 shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Secondary Filter Bar ────────────────────────────────────────── */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400">Format:</span>
            {FORMATS.map(fmt => (
              <button
                key={fmt}
                onClick={() => setFileType(fmt)}
                className={cn(
                  'rounded-lg px-2.5 py-1 transition-colors',
                  fileType === fmt
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ── Document Grid ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
        </div>
      ) : listData?.items.length === 0 ? (
        <EmptyState
          icon={<Library size={32} />}
          title="No documents found"
          description="Try clearing your filters or search keywords."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listData?.items.map(doc => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-brand-300 hover:shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 uppercase tracking-wide">
                      {doc.fileType}
                    </span>
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                      {doc.category}
                    </span>
                  </div>

                  <button
                    onClick={() => bookmarkMutation.mutate(doc.id)}
                    className={cn(
                      'rounded-lg p-1.5 transition-colors',
                      doc.isBookmarked
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Bookmark size={16} fill={doc.isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <h3 className="mt-3 font-bold text-base text-slate-900 line-clamp-2 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {doc.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {doc.description || 'Verified academic resource for university curriculum.'}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{doc.subject}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star size={13} fill="currentColor" /> {doc.avgRating} ({doc.ratingsCount})
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setAiDoc(doc); setAiAction('summary'); runAiAction('summary') }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/50 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:border-brand-800/40 dark:bg-brand-500/10 dark:text-brand-300 transition-all"
                >
                  <Sparkles size={14} /> Ask AI
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── AI Assistant Drawer ─────────────────────────────────────────────── */}
      <Modal
        open={!!aiDoc}
        onClose={() => { setAiDoc(null); setAiResult(null) }}
        title={`AI Document Assistant: ${aiDoc?.title ?? ''}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Action pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            {[
              { id: 'summary', label: 'AI Summary', icon: <FileText size={14} /> },
              { id: 'explain', label: 'Explain Concepts', icon: <BookOpen size={14} /> },
              { id: 'translate', label: 'Translate', icon: <Languages size={14} /> },
              { id: 'notes', label: 'Generate Notes', icon: <Sparkles size={14} /> },
              { id: 'ask_question', label: 'Ask Document', icon: <MessageSquare size={14} /> },
            ].map(a => (
              <button
                key={a.id}
                onClick={() => { runAiAction(a.id) }}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                  aiAction === a.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {a.icon} {a.label}
              </button>
            ))}

            <select
              value={aiLanguage}
              onChange={e => setAiLanguage(e.target.value)}
              className="ml-auto rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Ask question input */}
          {aiAction === 'ask_question' && (
            <div className="flex gap-2">
              <input
                value={userQuestion}
                onChange={e => setUserQuestion(e.target.value)}
                placeholder="Ask any question about this document..."
                className="input flex-1 text-xs"
              />
              <Button onClick={() => runAiAction('ask_question')} loading={aiLoading}>
                <Send size={14} /> Ask
              </Button>
            </div>
          )}

          {/* AI Result canvas */}
          <div className="min-h-[250px] max-h-[60vh] overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            {aiLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Sparkles size={28} className="animate-spin text-brand-600" />
                <p className="text-xs text-slate-500">Gemini is analyzing document...</p>
              </div>
            ) : aiResult ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {aiResult.result && (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult.result}</ReactMarkdown>
                )}
                {aiResult.answer && (
                  <div>
                    <p className="font-bold text-xs text-brand-600 mb-1">Question: {aiResult.question}</p>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult.answer}</ReactMarkdown>
                  </div>
                )}
                {aiResult.notes && (
                  <div>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult.notes}</ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-slate-400">Select an AI action above.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* ── Add Document Modal ────────────────────────────────────────────── */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Upload Study Material to Library"
      >
        <form onSubmit={e => { e.preventDefault(); addDocMutation.mutate(addForm) }} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Title</label>
            <input value={addForm.title} onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Data Structures & Algorithms Complete Notes" className="input mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Category</label>
              <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} className="input mt-1">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Format</label>
              <select value={addForm.file_type} onChange={e => setAddForm(f => ({ ...f, file_type: e.target.value }))} className="input mt-1">
                {FORMATS.filter(f => f !== 'All').map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject</label>
              <input value={addForm.subject} onChange={e => setAddForm(f => ({ ...f, subject: e.target.value }))} required placeholder="e.g. Computer Networks" className="input mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Branch</label>
              <input value={addForm.branch} onChange={e => setAddForm(f => ({ ...f, branch: e.target.value }))} placeholder="All or CSE" className="input mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Document PDF/URL Link</label>
            <input value={addForm.file_url} onChange={e => setAddForm(f => ({ ...f, file_url: e.target.value }))} required placeholder="https://..." className="input mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Description</label>
            <textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief summary of document content..." className="input mt-1" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={addDocMutation.isPending}>Upload Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
