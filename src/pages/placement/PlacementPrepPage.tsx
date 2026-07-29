import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Briefcase, FileText, CheckCircle2, AlertTriangle, Sparkles, Brain,
  Code, Trophy, Send, Play, RefreshCw, Star, Layers, ShieldCheck,
  Building, Search, Filter, MessageSquare, UserCheck, Flame, ChevronRight
} from 'lucide-react'
import { placementService, type ATSResult, type MockQuestion, type MockEvaluationResult } from '../../services/placement'
import { Card, PageHeader, Badge, Button, Modal, Skeleton, ProgressBar } from '../../components/ui'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Google', 'Amazon', 'Accenture', 'Cognizant']
const CATEGORIES = ['All', 'Coding', 'Aptitude', 'Reasoning', 'HR', 'Behavioral']

export default function PlacementPrepPage() {
  const [tab, setTab] = useState<'ats' | 'mock' | 'questions' | 'coding' | 'leaderboard'>('ats')

  // ── Sub-tab 1: ATS & Resume ────────────────────────────────────────────────
  const [atsRole, setAtsRole] = useState('Full Stack Software Engineer')
  const [resumeText, setResumeText] = useState(`BHAGWAT PATIL
Email: bhagwat@example.com | Phone: +91 9876543210 | Location: Pune, India
LinkedIn: linkedin.com/in/bhagwatpatil | GitHub: github.com/bhagwat

EDUCATION:
B.Tech in Computer Engineering | SGBAU University | CGPA: 8.9 (2022 - 2026)

SKILLS:
Programming: Python, JavaScript, TypeScript, C++, SQL
Frameworks: React.js, FastAPI, Node.js, Express, Tailwind CSS
Databases & Tools: MongoDB, Redis, PostgreSQL, Git, Docker, AWS

PROJECTS:
1. ShikshaDost AI - Student Success Platform
- Developed AI voice assistant & digital library using FastAPI, Gemini API, and React.
- Integrated MongoDB, JWT auth, and live streaming SSE for instant student query resolution.

2. AgriSathi - Smart Farming Advisory System
- Built crop disease detection model using Computer Vision and PyTorch.

EXPERIENCE / LEADERSHIP:
Technical Lead - Computer Society Student Chapter (2024 - Present)`)

  const [atsResult, setAtsResult] = useState<ATSResult | null>(null)

  const atsMutation = useMutation({
    mutationFn: () => placementService.checkATS(resumeText, atsRole),
    onSuccess: (data) => {
      setAtsResult(data)
      toast.success('Resume ATS analysis complete!')
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'ATS scan failed'),
  })

  // Cover Letter state
  const [clCompany, setClCompany] = useState('Google')
  const [clRole, setClRole] = useState('Software Engineer')
  const [clResult, setClResult] = useState('')

  const clMutation = useMutation({
    mutationFn: () => placementService.generateCoverLetter({
      candidate_name: 'Bhagwat Patil',
      target_role: clRole,
      company_name: clCompany,
      key_skills: ['React', 'FastAPI', 'Python', 'AI'],
      experience: 'Fresher / Final Year',
    }),
    onSuccess: (data) => setClResult(data.cover_letter),
  })

  // ── Sub-tab 2: Mock Interview ─────────────────────────────────────────────
  const [mockType, setMockType] = useState('technical')
  const [mockTargetRole, setMockTargetRole] = useState('Software Engineer')
  const [mockCompany, setMockCompany] = useState('General')
  const [mockQuestions, setMockQuestions] = useState<MockQuestion[]>([])
  const [currQIdx, setCurrQIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [evalResult, setEvalResult] = useState<MockEvaluationResult | null>(null)

  const mockQuestionsMutation = useMutation({
    mutationFn: () => placementService.getMockQuestions(mockType, mockTargetRole, mockCompany),
    onSuccess: (data) => {
      setMockQuestions(data.questions)
      setCurrQIdx(0)
      setUserAnswer('')
      setEvalResult(null)
      toast.success('Mock Interview session started!')
    },
  })

  const evalAnswerMutation = useMutation({
    mutationFn: () => placementService.evaluateMockAnswer(mockQuestions[currQIdx].question, userAnswer, mockType),
    onSuccess: (data) => setEvalResult(data),
  })

  // ── Sub-tab 3: Question Bank ──────────────────────────────────────────────
  const [selectedCompany, setSelectedCompany] = useState('TCS')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const { data: qBank = [] } = useQuery({
    queryKey: ['company-questions', selectedCompany, selectedCategory],
    queryFn: () => placementService.getCompanyQuestions(selectedCompany, selectedCategory),
  })

  // ── Sub-tab 4: Coding Playground ──────────────────────────────────────────
  const [codeLang, setCodeLang] = useState('python')
  const [codeSnippet, setCodeSnippet] = useState(`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test call
print(two_sum([2, 7, 11, 15], 9))`)

  const [codeEval, setCodeEval] = useState<any>(null)

  const runCodeMutation = useMutation({
    mutationFn: () => placementService.runCode(codeSnippet, codeLang, 'Two Sum'),
    onSuccess: (data) => setCodeEval(data),
  })

  // ── Sub-tab 5: Leaderboard & Challenge ─────────────────────────────────────
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['placement-leaderboard'],
    queryFn: () => placementService.getLeaderboard(),
  })

  const { data: dailyChallenge } = useQuery({
    queryKey: ['daily-challenge'],
    queryFn: () => placementService.getDailyChallenge(),
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="AI Placement Portal & Career Prep"
        description="Master tech company interviews with instant Resume ATS Checker, AI Mock Interview room, Coding Playground, and Company Question Bank."
        badge={<Badge variant="amber" dot>Placement Ready</Badge>}
      />

      {/* ── Main Sub-Navigation Tabs ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {[
          { id: 'ats', label: '📄 Resume ATS & Builder', icon: <FileText size={15} /> },
          { id: 'mock', label: '🎙️ AI Mock Interview', icon: <Brain size={15} /> },
          { id: 'questions', label: '🏢 Question Bank & Companies', icon: <Building size={15} /> },
          { id: 'coding', label: '💻 Coding Playground', icon: <Code size={15} /> },
          { id: 'leaderboard', label: '🏆 Leaderboard & Daily Challenge', icon: <Trophy size={15} /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all',
              tab === item.id
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: ATS & RESUME ────────────────────────────────────────── */}
      {tab === 'ats' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Form */}
            <Card>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                <FileText className="text-brand-600" size={18} /> Live Resume ATS Checker
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Role Title</label>
                  <input
                    value={atsRole}
                    onChange={e => setAtsRole(e.target.value)}
                    className="input mt-1 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Paste Your Resume Content / Plaintext</label>
                  <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    rows={12}
                    className="input mt-1 font-mono text-xs"
                  />
                </div>

                <Button
                  onClick={() => atsMutation.mutate()}
                  loading={atsMutation.isPending}
                  className="w-full bg-brand-600 text-white"
                >
                  <Sparkles size={16} className="mr-1.5" /> Run ATS Scanner & Score
                </Button>
              </div>
            </Card>

            {/* ATS Score Results */}
            <Card>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">ATS Match Report</h3>
              {atsMutation.isPending ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Sparkles size={32} className="animate-spin text-brand-600" />
                  <p className="text-xs text-slate-500">Evaluating formatting, keywords, and ATS parsability...</p>
                </div>
              ) : !atsResult ? (
                <p className="py-16 text-center text-xs text-slate-400">Click "Run ATS Scanner" to view your score breakdown.</p>
              ) : (
                <div className="space-y-4">
                  {/* Score meter */}
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 p-4 dark:from-brand-950/40 dark:to-indigo-950/40 border border-brand-200 dark:border-brand-800">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">ATS Match Score</p>
                      <p className="text-3xl font-black text-brand-700 dark:text-brand-300">{atsResult.ats_score} / 100</p>
                    </div>
                    <span className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold',
                      atsResult.ats_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {atsResult.ats_score >= 80 ? 'Excellent Match' : 'Optimization Needed'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{atsResult.summary}</p>

                  {/* Strengths & Missing keywords */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                      <p className="font-bold text-[11px] uppercase text-emerald-700 dark:text-emerald-300 mb-1">Key Strengths</p>
                      <ul className="space-y-1">
                        {atsResult.strengths?.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                      <p className="font-bold text-[11px] uppercase text-amber-700 dark:text-amber-300 mb-1">Missing Keywords</p>
                      <ul className="space-y-1">
                        {atsResult.missing_keywords?.map((k, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1">
                            <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" /> {k}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Cover Letter Generator section */}
          <Card>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <FileText className="text-purple-600" size={18} /> AI Cover Letter Generator
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <input value={clCompany} onChange={e => setClCompany(e.target.value)} placeholder="Company Name" className="input text-xs" />
              <input value={clRole} onChange={e => setClRole(e.target.value)} placeholder="Target Role" className="input text-xs" />
              <Button onClick={() => clMutation.mutate()} loading={clMutation.isPending} variant="secondary">
                Generate Cover Letter
              </Button>
            </div>

            {clResult && (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-xs font-mono text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                {clResult}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 2: MOCK INTERVIEW ──────────────────────────────────────── */}
      {tab === 'mock' && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">AI Mock Interview Simulator</h3>
                <p className="text-xs text-slate-500">Select round type and role to generate questions with live feedback.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select value={mockType} onChange={e => setMockType(e.target.value)} className="input w-auto text-xs">
                  <option value="technical">Technical Round</option>
                  <option value="hr">HR Round</option>
                  <option value="behavioral">Behavioral (STAR Method)</option>
                </select>
                <input value={mockTargetRole} onChange={e => setMockTargetRole(e.target.value)} placeholder="Target Role" className="input w-auto text-xs" />
                <Button onClick={() => mockQuestionsMutation.mutate()} loading={mockQuestionsMutation.isPending}>
                  Start Interview
                </Button>
              </div>
            </div>
          </Card>

          {mockQuestions.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Question & Answer Input */}
              <Card>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Question {currQIdx + 1} of {mockQuestions.length}</span>
                  <Badge variant="purple">{mockQuestions[currQIdx].difficulty}</Badge>
                </div>

                <h4 className="mt-3 font-bold text-base text-slate-900 dark:text-slate-100">
                  {mockQuestions[currQIdx].question}
                </h4>

                {mockQuestions[currQIdx].hint && (
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg dark:bg-slate-800">
                    💡 Hint: {mockQuestions[currQIdx].hint}
                  </p>
                )}

                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Your Answer / Response</label>
                  <textarea
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    rows={6}
                    placeholder="Type your response here..."
                    className="input mt-1 text-xs"
                  />
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="secondary"
                    disabled={currQIdx === 0}
                    onClick={() => { setCurrQIdx(i => i - 1); setEvalResult(null) }}
                  >
                    Previous
                  </Button>

                  <Button onClick={() => evalAnswerMutation.mutate()} loading={evalAnswerMutation.isPending}>
                    Submit Answer & Evaluate
                  </Button>

                  <Button
                    variant="secondary"
                    disabled={currQIdx === mockQuestions.length - 1}
                    onClick={() => { setCurrQIdx(i => i + 1); setEvalResult(null) }}
                  >
                    Next Question
                  </Button>
                </div>
              </Card>

              {/* Evaluation Results */}
              <Card>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">AI Interview Feedback</h3>
                {evalAnswerMutation.isPending ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Sparkles size={32} className="animate-spin text-brand-600" />
                    <p className="text-xs text-slate-500">Analyzing answer clarity, depth, and correctness...</p>
                  </div>
                ) : !evalResult ? (
                  <p className="py-16 text-center text-xs text-slate-400">Submit your answer to get instant score and model response.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <span className="font-bold text-xs">Rating Score</span>
                      <span className="text-lg font-black text-brand-600">{evalResult.score} / 10</span>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                      <p className="font-bold text-[11px] text-emerald-700 dark:text-emerald-300">Feedback</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{evalResult.feedback}</p>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-3 dark:bg-purple-950/30">
                      <p className="font-bold text-[11px] text-purple-700 dark:text-purple-300 mb-1">Model Answer / Key Points</p>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{evalResult.model_answer}</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: QUESTION BANK ───────────────────────────────────────── */}
      {tab === 'questions' && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-400 align-middle self-center">Company:</span>
                {COMPANIES.map(comp => (
                  <button
                    key={comp}
                    onClick={() => setSelectedCompany(comp)}
                    className={cn(
                      'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all',
                      selectedCompany === comp
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {comp}
                  </button>
                ))}
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="input w-auto text-xs"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {qBank.map((q: any) => (
              <Card key={q.id} className="hover:border-brand-300 transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="blue">{q.company}</Badge>
                  <Badge variant="purple">{q.category}</Badge>
                </div>
                <h4 className="mt-2 font-bold text-sm text-slate-900 dark:text-slate-100">{q.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{q.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: CODING PLAYGROUND ────────────────────────────────────── */}
      {tab === 'coding' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Code Runner & AI Evaluator</h3>
              <select value={codeLang} onChange={e => setCodeLang(e.target.value)} className="input w-auto text-xs">
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node)</option>
              </select>
            </div>

            <textarea
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              rows={14}
              className="input font-mono text-xs"
            />

            <Button
              onClick={() => runCodeMutation.mutate()}
              loading={runCodeMutation.isPending}
              className="mt-3 w-full bg-emerald-600 text-white"
            >
              <Play size={16} className="mr-1.5" /> Run Code & Check Complexity
            </Button>
          </Card>

          <Card>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">Evaluation Results</h3>
            {runCodeMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Sparkles size={32} className="animate-spin text-emerald-600" />
                <p className="text-xs text-slate-500">Executing code and calculating complexity...</p>
              </div>
            ) : !codeEval ? (
              <p className="py-16 text-center text-xs text-slate-400">Click "Run Code" to view performance metrics.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
                  <span className="font-bold text-xs text-emerald-700">Status</span>
                  <Badge variant="green">{codeEval.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-slate-400">Time Complexity</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{codeEval.time_complexity}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-slate-400">Space Complexity</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{codeEval.space_complexity}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800">
                  <p className="font-bold text-slate-700 dark:text-slate-300">Feedback</p>
                  <p className="text-slate-500 mt-1">{codeEval.code_feedback}</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 5: LEADERBOARD & DAILY CHALLENGE ────────────────────────── */}
      {tab === 'leaderboard' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Daily Challenge */}
          <Card className="md:col-span-1 bg-gradient-to-br from-brand-600 to-indigo-700 text-white">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-200">
              <Flame size={16} /> Daily Challenge
            </div>
            <h3 className="mt-2 text-lg font-extrabold">{dailyChallenge?.title ?? "Kadane's Algorithm"}</h3>
            <p className="mt-2 text-xs text-brand-100">{dailyChallenge?.description}</p>
            <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs backdrop-blur-md">
              <p className="font-mono text-[11px]">{dailyChallenge?.input_example}</p>
            </div>
            <Button className="mt-4 w-full bg-white text-brand-700 font-bold hover:bg-brand-50">
              Solve Daily Challenge (+50 Pts)
            </Button>
          </Card>

          {/* Leaderboard Table */}
          <Card className="md:col-span-2" padding="none">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Placement Leaderboard Ranks
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {leaderboard.map((user: any) => (
                <div key={user.rank} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs',
                      user.rank === 1 ? 'bg-amber-400 text-amber-950' : user.rank === 2 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                    )}>
                      #{user.rank}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">{user.questionsAnswered} Solved</span>
                    <Badge variant="green">{user.totalScore} Pts</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
