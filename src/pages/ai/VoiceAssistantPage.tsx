/**
 * Voice AI Assistant Page — ChatGPT Voice Style
 *
 * Features:
 *  - Voice Input (MediaRecorder)
 *  - Speech-To-Text (Whisper / Gemini)
 *  - Gemini AI Response streaming
 *  - Text-To-Speech (Web Speech API)
 *  - Interruption handling (User speaking cancels active TTS immediately)
 *  - Dynamic visual soundwave spectrum animation
 *  - Multi-language support (English, Hindi, Marathi)
 *  - Conversation History drawer with persistence
 *  - Glassmorphic Apple/OpenAI inspired interface
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, StopCircle, Volume2, VolumeX,
  Languages, Sparkles, Trash2, Bot, User, History, X, RefreshCw, MessageSquare
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: Date
}

interface HistoryItem {
  id: string
  transcript: string
  language: string
  createdAt: string
}

const LANGUAGES = [
  { code: 'en-IN', label: 'English', voice: 'en-IN', whisper: 'en' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', voice: 'hi-IN', whisper: 'hi' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', voice: 'mr-IN', whisper: 'mr' },
]

function SoundwaveVisualizer({ active, color = 'brand' }: { active: boolean; color?: 'brand' | 'red' | 'green' }) {
  const colorClass = {
    brand: 'bg-gradient-to-t from-brand-600 to-indigo-400 dark:from-brand-500 dark:to-indigo-300 shadow-brand-500/50',
    red: 'bg-gradient-to-t from-rose-600 to-red-400 dark:from-rose-500 dark:to-red-300 shadow-red-500/50',
    green: 'bg-gradient-to-t from-emerald-600 to-teal-400 dark:from-emerald-500 dark:to-teal-300 shadow-emerald-500/50',
  }[color]

  return (
    <div className="flex items-center justify-center gap-1 h-14 px-4 py-2 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/40 shadow-inner">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('w-1 rounded-full shadow-sm', colorClass)}
          animate={active ? {
            height: ['6px', `${12 + Math.random() * 32}px`, '6px'],
          } : { height: '6px' }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: active ? Infinity : 0,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function VoiceAssistantPage() {
  const { user } = useAuth()
  const token = localStorage.getItem('shikshadost_token') ?? ''
  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

  const [state, setState] = useState<'idle' | 'recording' | 'processing' | 'speaking'>('idle')
  const [langIdx, setLangIdx] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [aiText, setAiText] = useState('')
  const [muted, setMuted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [mode, setMode] = useState<'hold' | 'tap'>('tap')

  const lang = LANGUAGES[langIdx]
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamTextRef = useRef<string>('')

  // ── Auto scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, aiText])

  // ── Cleanup speech on unmount ─────────────────────────────────────────────
  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  // ── Load history logs ────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/voice-ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setHistoryItems(data)
      }
    } catch {
      // ignore
    }
  }, [baseUrl, token])

  useEffect(() => {
    if (showHistory) fetchHistory()
  }, [showHistory, fetchHistory])

  // ── Speak helper ─────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (muted || !text.trim() || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = lang.voice
    utt.rate = 1.05
    utt.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const match = voices.find(v => v.lang.startsWith(lang.voice.split('-')[0]))
    if (match) utt.voice = match

    utt.onend = () => setState('idle')
    utt.onerror = () => setState('idle')

    setState('speaking')
    window.speechSynthesis.speak(utt)
  }, [muted, lang.voice])

  // ── Interrupt AI ──────────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setState('idle')
  }, [])

  // ── Start recording ───────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    // If AI is currently speaking, user action interrupts AI immediately
    if (state === 'speaking') {
      stopSpeaking()
    }
    if (state === 'processing') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.start(200)
      mediaRef.current = recorder
      setState('recording')
    } catch {
      toast.error('Microphone access denied. Please check permissions.')
    }
  }, [state, stopSpeaking])

  // ── Stop recording & send to backend ──────────────────────────────────────
  const stopRecording = useCallback(() => {
    if (!mediaRef.current || state !== 'recording') return
    const recorder = mediaRef.current
    mediaRef.current = null

    recorder.stop()
    recorder.stream.getTracks().forEach(t => t.stop())
    setState('processing')

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
      chunksRef.current = []

      if (blob.size < 100) {
        toast.error('Recording too short. Please speak clearly.')
        setState('idle')
        return
      }

      const history = messages.slice(-10).map(m => ({
        role: m.role, content: m.text,
      }))

      const form = new FormData()
      form.append('file', blob, 'audio.webm')
      form.append('language', lang.whisper)
      form.append('history_json', JSON.stringify(history))

      try {
        const res = await fetch(`${baseUrl}/voice-ai/chat`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Voice request failed' }))
          throw new Error(err.detail ?? 'Voice error')
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let userText = ''
        let aiChunks = ''

        streamTextRef.current = ''
        setAiText('')

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          let i = 0
          while (i < lines.length) {
            const line = lines[i].trim()
            if (line.startsWith('event:')) {
              const event = line.replace('event:', '').trim()
              const dataLine = lines[i + 1]?.trim() ?? ''
              const raw = dataLine.replace('data:', '').trim()

              try {
                const parsed = JSON.parse(raw)
                if (event === 'transcript') {
                  userText = parsed.text ?? ''
                  setMessages(prev => [...prev, {
                    id: `u-${Date.now()}`, role: 'user',
                    text: userText, createdAt: new Date(),
                  }])
                } else if (event === 'chunk') {
                  aiChunks += parsed.content ?? ''
                  streamTextRef.current = aiChunks
                  setAiText(aiChunks)
                } else if (event === 'done') {
                  const finalText = streamTextRef.current
                  setMessages(prev => [...prev, {
                    id: `a-${Date.now()}`, role: 'assistant',
                    text: finalText, createdAt: new Date(),
                  }])
                  setAiText('')
                  if (!muted) speak(finalText)
                  else setState('idle')
                } else if (event === 'error') {
                  throw new Error(parsed.message ?? 'Stream error')
                }
              } catch {
                // skip bad chunk parse
              }
              i += 2
            } else {
              i++
            }
          }
        }
      } catch (err: any) {
        toast.error(err.message ?? 'Voice AI error')
        setState('idle')
      }
    }
  }, [state, messages, lang.whisper, token, baseUrl, muted, speak])

  const toggleMic = () => {
    if (state === 'idle') startRecording()
    else if (state === 'recording') stopRecording()
    else if (state === 'speaking') stopSpeaking()
  }

  const clearChat = async () => {
    stopSpeaking()
    setMessages([])
    setAiText('')
    try {
      await fetch(`${baseUrl}/voice-ai/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
      // best-effort
    }
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-80px)] max-w-4xl flex-col">
      {/* ── Glassmorphic Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white shadow-md shadow-brand-500/25">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Gemini Voice AI
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                ChatGPT Style
              </span>
            </h1>
            <p className="text-xs text-slate-500">Natural voice assistant in your native language</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <button
            onClick={() => { stopSpeaking(); setLangIdx(i => (i + 1) % LANGUAGES.length) }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 transition-all shadow-sm"
          >
            <Languages size={14} />
            {lang.label}
          </button>

          {/* Mode Switcher */}
          <button
            onClick={() => setMode(m => m === 'tap' ? 'hold' : 'tap')}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 transition-all shadow-sm"
            title="Toggle Tap vs Hold to Speak"
          >
            {mode === 'tap' ? 'Tap Mode' : 'Hold Mode'}
          </button>

          {/* Mute TTS */}
          <button
            onClick={() => setMuted(m => !m)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all shadow-sm',
              muted
                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800/40 dark:bg-red-500/10 dark:text-red-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
            )}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* History drawer toggle */}
          <button
            onClick={() => setShowHistory(h => !h)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all shadow-sm"
            title="History"
          >
            <History size={16} />
          </button>

          {/* Clear */}
          <button
            onClick={clearChat}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 transition-all shadow-sm"
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Main Chat Canvas ─────────────────────────────────────────────── */}
      <div className="relative mt-4 flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60 shadow-xl">

        {/* History Slide-over */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 z-20 w-80 border-l border-slate-200 bg-white/95 p-4 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <History size={16} /> Voice History
                </h3>
                <button onClick={() => setShowHistory(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 space-y-2 overflow-y-auto max-h-[calc(100%-50px)]">
                {historyItems.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">No past voice logs recorded.</p>
                ) : (
                  historyItems.map(item => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.transcript}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 && !aiText ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 via-violet-600 to-indigo-500 shadow-2xl shadow-brand-500/40"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
                <Mic size={48} className="relative text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hi, {user?.name?.split(' ')[0]}! Ready to talk?
              </h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Tap the microphone below to ask any doubt. I can explain concepts, solve homework, or discuss study strategies in {lang.label}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map(m => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-md',
                      m.role === 'user' ? 'bg-brand-600' : 'bg-gradient-to-tr from-violet-600 to-indigo-600'
                    )}>
                      {m.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                    </div>
                    <div className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-tr-xs'
                        : 'border border-slate-200/80 bg-white text-slate-800 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200 rounded-tl-xs'
                    )}>
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {aiText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                    <Bot size={15} />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-xs border border-slate-200/80 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200 shadow-sm">
                    {aiText}
                    <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-brand-500 align-middle" />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Control Footer ───────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 border-t border-slate-100 bg-white/50 p-4 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/50">
          <SoundwaveVisualizer
            active={state === 'recording' || state === 'speaking'}
            color={state === 'recording' ? 'red' : state === 'speaking' ? 'green' : 'brand'}
          />

          <div className="flex items-center gap-4">
            {/* Mic trigger button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onMouseDown={mode === 'hold' ? startRecording : undefined}
              onMouseUp={mode === 'hold' ? stopRecording : undefined}
              onClick={mode === 'tap' ? toggleMic : undefined}
              className={cn(
                'relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300',
                state === 'idle'       && 'bg-gradient-to-tr from-brand-600 to-violet-600 hover:shadow-brand-500/40',
                state === 'recording'  && 'bg-red-500 ring-4 ring-red-300 dark:ring-red-900/60 animate-pulse',
                state === 'processing' && 'bg-amber-500 ring-4 ring-amber-300 dark:ring-amber-900/60 cursor-wait',
                state === 'speaking'   && 'bg-emerald-600 ring-4 ring-emerald-300 dark:ring-emerald-900/60 hover:bg-emerald-700',
              )}
            >
              {state === 'idle'       && <Mic size={32} />}
              {state === 'recording'  && <MicOff size={32} />}
              {state === 'processing' && <Sparkles size={32} className="animate-spin" />}
              {state === 'speaking'   && <Volume2 size={32} />}
            </motion.button>

            {state === 'speaking' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={stopSpeaking}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-400 transition-all shadow-sm"
              >
                <StopCircle size={16} /> Interrupt AI
              </motion.button>
            )}
          </div>

          <p className="text-center text-[11px] font-medium text-slate-400">
            {state === 'idle' && (mode === 'tap' ? 'Tap mic to speak' : 'Hold mic to speak')}
            {state === 'recording' && 'Listening… Release/Tap to finish'}
            {state === 'processing' && 'Gemini is processing your question…'}
            {state === 'speaking' && 'AI is speaking. Tap mic or Intercept button to pause'}
          </p>
        </div>
      </div>
    </div>
  )
}
