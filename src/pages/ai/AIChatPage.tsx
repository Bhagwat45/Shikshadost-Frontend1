import {
  useCallback, useEffect, useRef, useState,
} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import {
  Plus, Send, Trash2, Pin, PinOff, Pencil, Check, X,
  MessageSquare, Sparkles, Copy, ThumbsUp, ThumbsDown,
  RotateCcw, ChevronLeft, Menu, Bot, User,
  BookOpen, Code2, FileQuestion, Lightbulb,
} from 'lucide-react'
import { chatService, type Conversation, type ChatMessage } from '../../services/chat'
import { useAuth } from '../../context/AuthContext'
import { cn, timeAgo } from '../../lib/utils'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Tooltip } from '../../components/ui/Tooltip'
import toast from 'react-hot-toast'

// ─── Suggested prompts ───────────────────────────────────────────────────────
const SUGGESTED = [
  { icon: <BookOpen size={15} />, label: 'Explain a concept', prompt: 'Explain the concept of Operating System process scheduling in simple terms with examples.' },
  { icon: <Code2 size={15} />,    label: 'Debug my code',     prompt: 'Help me debug this Python code and explain what is wrong:' },
  { icon: <FileQuestion size={15} />, label: 'Exam prep',     prompt: 'Give me 10 important questions for my Data Structures exam with brief answers.' },
  { icon: <Lightbulb size={15} />, label: 'Study plan',       prompt: 'Create a 7-day study plan for my upcoming semester exams in Computer Science.' },
]

// ─── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
          style={{ animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

// ─── Markdown renderer ───────────────────────────────────────────────────────
function AIMarkdown({ content }: { content: string }) {
  return (
    <div className="ai-prose">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const inline = !match
          if (inline) {
            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-brand-700 dark:bg-slate-800 dark:text-brand-300" {...props}>
                {children}
              </code>
            )
          }
          return (
            <div className="my-3 overflow-hidden rounded-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2">
                <span className="text-xs font-mono text-slate-400">{match[1]}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark as any}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0, background: 'rgb(2, 6, 23)' }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}

// ─── Single message bubble ────────────────────────────────────────────────────
function MessageBubble({
  message,
  isStreaming,
}: {
  message: ChatMessage & { streaming?: boolean }
  isStreaming?: boolean
}) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('group flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white',
        isUser
          ? 'bg-brand-600 dark:bg-brand-500'
          : 'bg-gradient-to-br from-violet-500 to-brand-600',
      )}>
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div className={cn('flex max-w-[80%] flex-col gap-1.5', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'rounded-tr-sm bg-brand-600 text-white dark:bg-brand-500'
            : 'rounded-tl-sm bg-[var(--surface-0)] border border-slate-200/80 text-slate-800 dark:border-slate-700/50 dark:bg-[var(--surface-2)] dark:text-slate-200',
        )}>
          {isStreaming && message.content === '' ? (
            <TypingDots />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <AIMarkdown content={message.content} />
          )}
        </div>

        {/* Action bar — AI messages only */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip content={copied ? 'Copied!' : 'Copy'}>
              <button onClick={handleCopy} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors">
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </Tooltip>
            <Tooltip content="Good response">
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 transition-colors">
                <ThumbsUp size={13} />
              </button>
            </Tooltip>
            <Tooltip content="Bad response">
              <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 transition-colors">
                <ThumbsDown size={13} />
              </button>
            </Tooltip>
            <span className="ml-1 text-[10px] text-slate-400">{timeAgo(message.createdAt)}</span>
          </div>
        )}
        {isUser && (
          <span className="text-[10px] text-slate-400">{timeAgo(message.createdAt)}</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Conversation list item ──────────────────────────────────────────────────
function ConvItem({
  conv,
  active,
  onSelect,
  onRename,
  onPin,
  onDelete,
}: {
  conv: Conversation
  active: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onPin: () => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conv.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDraft(conv.title)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 50)
  }

  const commit = () => {
    if (draft.trim()) onRename(draft.trim())
    setEditing(false)
  }

  return (
    <div
      onClick={!editing ? onSelect : undefined}
      className={cn(
        'group relative flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-all',
        active
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
          : 'hover:bg-slate-100 text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/60',
      )}
    >
      {conv.pinned && <Pin size={10} className="mt-1.5 shrink-0 text-brand-400" />}

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            onBlur={commit}
            onClick={e => e.stopPropagation()}
            className="w-full rounded bg-white px-1 py-0.5 text-sm text-slate-900 outline-none ring-1 ring-brand-400 dark:bg-slate-700 dark:text-slate-100"
            autoFocus
          />
        ) : (
          <>
            <p className="truncate text-sm font-medium">{conv.title}</p>
            <p className="text-[11px] text-slate-400">{timeAgo(conv.updatedAt)}</p>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={startEdit} className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Rename">
            <Pencil size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onPin() }} className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title={conv.pinned ? 'Unpin' : 'Pin'}>
            {conv.pinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete() }} className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Delete">
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AIChatPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const token = localStorage.getItem('shikshadost_token') ?? ''

  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages]         = useState<(ChatMessage & { streaming?: boolean })[]>([])
  const [input, setInput]               = useState('')
  const [streaming, setStreaming]       = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Fetch conversation list
  const { data: conversations = [], refetch: refetchConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
    staleTime: 10_000,
  })

  // ── Load messages when conversation changes
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return }
    chatService.getMessages(activeConvId).then(setMessages).catch(() => setMessages([]))
  }, [activeConvId])

  // ── Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  // ── Create new conversation
  const handleNewChat = useCallback(async () => {
    const conv = await chatService.createConversation()
    await refetchConvs()
    setActiveConvId(conv.id)
    setMessages([])
    setInput('')
  }, [refetchConvs])

  // ── Send message
  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || streaming) return

    // Ensure we have a conversation
    let convId = activeConvId
    if (!convId) {
      const conv = await chatService.createConversation()
      await refetchConvs()
      setActiveConvId(conv.id)
      convId = conv.id
    }

    const now = new Date().toISOString()
    const userMsg: ChatMessage = {
      id:             `tmp-user-${Date.now()}`,
      conversationId: convId,
      role:           'user',
      content,
      createdAt:      now,
    }
    const aiPlaceholder: ChatMessage & { streaming: boolean } = {
      id:             `tmp-ai-${Date.now()}`,
      conversationId: convId,
      role:           'assistant',
      content:        '',
      createdAt:      now,
      streaming:      true,
    }

    setMessages(prev => [...prev, userMsg, aiPlaceholder])
    setInput('')
    setStreaming(true)

    let accumulated = ''

    await chatService.streamMessage(
      convId,
      content,
      token,
      (chunk) => {
        accumulated += chunk
        setMessages(prev =>
          prev.map(m =>
            m.id === aiPlaceholder.id ? { ...m, content: accumulated } : m,
          ),
        )
      },
      () => {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiPlaceholder.id ? { ...m, streaming: false } : m,
          ),
        )
        setStreaming(false)
        refetchConvs()
      },
      (errMsg) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === aiPlaceholder.id
              ? { ...m, content: `⚠️ ${errMsg}`, streaming: false }
              : m,
          ),
        )
        setStreaming(false)
        toast.error(errMsg)
      },
    )
  }, [input, streaming, activeConvId, token, refetchConvs])

  // ── Key handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ── Rename
  const handleRename = async (id: string, title: string) => {
    await chatService.renameConversation(id, title)
    refetchConvs()
  }

  // ── Pin
  const handlePin = async (conv: Conversation) => {
    await chatService.pinConversation(conv.id, !conv.pinned)
    refetchConvs()
  }

  // ── Delete
  const handleDelete = async (id: string) => {
    await chatService.deleteConversation(id)
    if (activeConvId === id) { setActiveConvId(null); setMessages([]) }
    refetchConvs()
  }

  const isEmpty = messages.length === 0

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  const Sidebar = (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-200/80 bg-[var(--surface-0)]',
        'dark:border-slate-800/60 dark:bg-[var(--surface-1)]',
        'transition-all duration-300 overflow-hidden',
        sidebarOpen ? 'w-64 min-w-[256px]' : 'w-0 min-w-0',
      )}
    >
      {sidebarOpen && (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-brand-500" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Conversations</span>
            </div>
            <Button size="icon" variant="ghost" onClick={handleNewChat} title="New chat">
              <Plus size={15} />
            </Button>
          </div>

          {/* Search — future */}
          <div className="px-3 pt-3 pb-2">
            <input
              placeholder="Search chats…"
              className="input input-sm w-full text-xs"
            />
          </div>

          {/* Conv list */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-none">
            {conversations.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-slate-400">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={conv.id === activeConvId}
                  onSelect={() => setActiveConvId(conv.id)}
                  onRename={(title) => handleRename(conv.id, title)}
                  onPin={() => handlePin(conv)}
                  onDelete={() => handleDelete(conv.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  )

  // ─── Main chat area ───────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden rounded-2xl border border-slate-200/80 bg-[var(--surface-0)] shadow-card dark:border-slate-800/60 dark:bg-[var(--surface-2)] -m-4 md:-m-6 lg:-m-8">

      {/* Sidebar */}
      {Sidebar}

      {/* Chat column */}
      <div className="relative flex flex-1 flex-col overflow-hidden">

        {/* Top bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-100 px-4 dark:border-slate-800">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Menu size={17} />
          </button>

          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Bot size={17} className="shrink-0 text-brand-500" />
            <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              {activeConvId
                ? (conversations.find(c => c.id === activeConvId)?.title ?? 'Chat')
                : 'ShikshaDost AI'}
            </span>
          </div>

          {activeConvId && (
            <button
              onClick={() => { setActiveConvId(null); setMessages([]) }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Plus size={13} /> New
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            // Empty state / welcome
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 shadow-lg">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">How can I help you today?</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Ask me anything — concepts, exam prep, coding problems, career advice, or college life.
              </p>

              {/* Suggested prompts */}
              <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTED.map(s => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-[var(--surface-1)] p-4 text-left transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-[var(--surface-3)] dark:hover:border-brand-600 dark:hover:bg-brand-500/10"
                  >
                    <span className="mt-0.5 shrink-0 text-brand-500">{s.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{s.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isStreaming={msg.streaming && streaming}
                  />
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-slate-100 bg-[var(--surface-0)] px-4 py-3 dark:border-slate-800 dark:bg-[var(--surface-2)]">
          <div className="mx-auto max-w-3xl">
            <div className={cn(
              'relative flex items-end gap-2 rounded-2xl border bg-[var(--surface-1)] px-4 py-3 transition-all',
              'border-slate-200 dark:border-slate-700',
              'focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/20',
            )}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 outline-none"
                style={{ maxHeight: '200px' }}
                disabled={streaming}
              />
              <Button
                size="icon"
                variant="primary"
                onClick={() => handleSend()}
                disabled={!input.trim() || streaming}
                className="shrink-0 rounded-xl"
              >
                {streaming
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <Send size={15} />
                }
              </Button>
            </div>

            <p className="mt-2 text-center text-[10px] text-slate-400">
              ShikshaDost AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
