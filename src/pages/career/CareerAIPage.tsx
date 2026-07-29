import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Sparkles, Target, Compass, Award, TrendingUp, CheckCircle2,
  Briefcase, GraduationCap, Building2, BookOpen, Layers, ArrowRight,
  RefreshCw, Check, Calendar, ChevronRight, Zap
} from 'lucide-react'
import { careerService, type CareerReport } from '../../services/career'
import { Card, PageHeader, Badge, Button, Skeleton } from '../../components/ui'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

export default function CareerAIPage() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'jobs' | 'studies' | 'skills' | 'plan'>('roadmap')

  // Form input state
  const [education, setEducation] = useState('B.Tech Computer Science, 3rd Year')
  const [careerGoal, setCareerGoal] = useState('AI & Full Stack Software Engineer')
  const [interestTag, setInterestTag] = useState('')
  const [interests, setInterests] = useState<string[]>(['Artificial Intelligence', 'Web Development', 'Cloud Computing'])
  const [skillTag, setSkillTag] = useState('')
  const [skills, setSkills] = useState<string[]>(['Python', 'JavaScript', 'React', 'Git', 'SQL'])

  const [activeReport, setActiveReport] = useState<CareerReport | null>(null)

  // My saved roadmaps
  const { data: savedRoadmaps = [], refetch: refetchHistory } = useQuery({
    queryKey: ['my-career-roadmaps'],
    queryFn: () => careerService.getMyRoadmaps(),
  })

  const generateMutation = useMutation({
    mutationFn: () => careerService.generate({
      education,
      career_goal: careerGoal,
      interests,
      skills,
    }),
    onSuccess: (data) => {
      toast.success('Career AI Roadmap generated!')
      setActiveReport(data.report)
      refetchHistory()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Generation failed'),
  })

  const addInterest = () => {
    if (interestTag.trim() && !interests.includes(interestTag.trim())) {
      setInterests([...interests, interestTag.trim()])
      setInterestTag('')
    }
  }

  const addSkill = () => {
    if (skillTag.trim() && !skills.includes(skillTag.trim())) {
      setSkills([...skills, skillTag.trim()])
      setSkillTag('')
    }
  }

  const report = activeReport || (savedRoadmaps.length > 0 ? savedRoadmaps[0].report : null)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Career AI Mentor & Roadmap Generator"
        description="Receive personalized industry insights, skill gap analysis, higher study guides, salary benchmarks, and step-by-step career roadmaps."
        badge={<Badge variant="purple" dot>Gemini Powered</Badge>}
      />

      {/* ── Input Profile Setup Wizard ─────────────────────────────── */}
      <Card className="border-brand-200/80 bg-gradient-to-br from-white via-slate-50/50 to-brand-50/30 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/90 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-base mb-4">
          <Compass className="text-brand-600" size={20} /> Customize Your Career Target
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Education / Degree</label>
            <input
              value={education}
              onChange={e => setEducation(e.target.value)}
              placeholder="e.g. B.Tech CSE, 3rd Year"
              className="input mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Target Career Goal / Role</label>
            <input
              value={careerGoal}
              onChange={e => setCareerGoal(e.target.value)}
              placeholder="e.g. Full Stack AI Engineer, Data Scientist"
              className="input mt-1"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Interests */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Interests & Specializations</label>
            <div className="mt-1 flex gap-2">
              <input
                value={interestTag}
                onChange={e => setInterestTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                placeholder="Add interest (press Enter)"
                className="input text-xs"
              />
              <Button type="button" variant="secondary" onClick={addInterest}>Add</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {interests.map(item => (
                <span key={item} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {item}
                  <button onClick={() => setInterests(interests.filter(i => i !== item))} className="ml-1 text-brand-500 hover:text-brand-800">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Existing Skills</label>
            <div className="mt-1 flex gap-2">
              <input
                value={skillTag}
                onChange={e => setSkillTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add skill (press Enter)"
                className="input text-xs"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map(item => (
                <span key={item} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
                  {item}
                  <button onClick={() => setSkills(skills.filter(s => s !== item))} className="ml-1 text-purple-500 hover:text-purple-800">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          {savedRoadmaps.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Saved Roadmaps:</span>
              <select
                onChange={e => {
                  const found = savedRoadmaps.find(r => r.id === e.target.value)
                  if (found) setActiveReport(found.report)
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none dark:border-slate-700 dark:bg-slate-800"
              >
                {savedRoadmaps.map(r => (
                  <option key={r.id} value={r.id}>{r.careerGoal} ({new Date(r.createdAt).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={() => generateMutation.mutate()}
            loading={generateMutation.isPending}
            className="ml-auto bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg"
          >
            <Sparkles size={16} className="mr-1.5" /> Generate AI Career Plan
          </Button>
        </div>
      </Card>

      {/* ── Generated Dashboard Results ───────────────────────────── */}
      {generateMutation.isPending ? (
        <div className="space-y-4 py-8">
          <div className="flex flex-col items-center gap-3">
            <Sparkles size={36} className="animate-spin text-brand-600" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Generating personalized career guidance report with Gemini AI...</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      ) : !report ? (
        <Card className="py-12 text-center text-slate-400">
          Fill your interests & target goal above and click "Generate AI Career Plan" to get started.
        </Card>
      ) : (
        <div className="space-y-6">

          {/* Top Target Salary Banner */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="md:col-span-1 bg-gradient-to-br from-brand-600 to-violet-700 text-white shadow-xl">
              <p className="text-xs text-brand-200 uppercase tracking-wide font-bold">Target Role</p>
              <h2 className="mt-1 text-xl font-bold">{report.target_role}</h2>
            </Card>

            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Entry Level Salary</p>
              <p className="mt-1 text-lg font-extrabold text-emerald-800 dark:text-emerald-200">{report.expected_salary?.entry_level ?? '₹6-10 LPA'}</p>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Mid Level Salary</p>
              <p className="mt-1 text-lg font-extrabold text-blue-800 dark:text-blue-200">{report.expected_salary?.mid_level ?? '₹15-25 LPA'}</p>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300">Senior Level Salary</p>
              <p className="mt-1 text-lg font-extrabold text-purple-800 dark:text-purple-200">{report.expected_salary?.senior_level ?? '₹35-60 LPA'}</p>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            {[
              { id: 'roadmap', label: '🗺️ Interactive Roadmap', icon: <Layers size={15} /> },
              { id: 'jobs', label: '💼 Jobs & Internships', icon: <Briefcase size={15} /> },
              { id: 'studies', label: '🎓 Higher Studies & Exams', icon: <GraduationCap size={15} /> },
              { id: 'skills', label: '📊 Skill Gap Analysis', icon: <TrendingUp size={15} /> },
              { id: 'plan', label: '📅 30-Day Action Plan', icon: <Calendar size={15} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── TAB 1: ROADMAP ──────────────────────────────────────── */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              {report.learning_roadmap?.map((phase, idx) => (
                <Card key={idx} className="relative overflow-hidden border-l-4 border-l-brand-600">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 uppercase">
                      Phase {phase.phase}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">Step {idx + 1} of {report.learning_roadmap.length}</span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">{phase.title}</h3>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Key Milestones</p>
                      <ul className="space-y-1.5">
                        {phase.milestones?.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Recommended Projects</p>
                      <ul className="space-y-1.5">
                        {phase.projects?.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <Zap size={14} className="mt-0.5 shrink-0 text-amber-500" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── TAB 2: JOBS & INTERNSHIPS ────────────────────────────── */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Top Matching Career Suggestions</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {report.career_suggestions?.map((item, i) => (
                    <Card key={i} className="hover:border-brand-300 transition-all">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.title}</h4>
                        <Badge variant="green">{item.match_pct}% Match</Badge>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{item.reason}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.top_companies?.map(c => (
                          <span key={c} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {c}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Recommended Certifications</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {report.certifications?.map((c, i) => (
                    <Card key={i} padding="sm">
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.name}</p>
                      <p className="text-[11px] text-brand-600 font-semibold">{c.provider} · {c.level}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: HIGHER STUDIES & EXAMS ───────────────────────── */}
          {activeTab === 'studies' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="text-brand-600" size={18} /> Higher Studies Programs
                </h3>
                <div className="space-y-3">
                  {report.higher_studies?.map((hs, i) => (
                    <Card key={i} padding="sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{hs.degree}</span>
                        <Badge variant="purple">{hs.exam}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{hs.details}</p>
                      <p className="mt-2 text-[10px] text-slate-400 font-semibold">Top Institutes: {hs.top_colleges?.join(', ')}</p>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                  <Building2 className="text-indigo-600" size={18} /> Government Exams & PSUs
                </h3>
                <div className="space-y-3">
                  {report.government_exams?.map((gov, i) => (
                    <Card key={i} padding="sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{gov.exam_name}</span>
                        <Badge variant="blue">{gov.role}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Eligibility: {gov.eligibility}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: SKILL GAP ────────────────────────────────────── */}
          {activeTab === 'skills' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Skill Gap Analysis & Recommendations</h3>
              <div className="space-y-3">
                {report.skill_gap_analysis?.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.skill}</p>
                      <p className="text-slate-500 mt-0.5">Action Plan: {item.action}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                        {item.current_level}
                      </span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        {item.target_level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── TAB 5: DAILY PLAN ────────────────────────────────────── */}
          {activeTab === 'plan' && (
            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">30-Day Accelerated Learning Plan</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {report.daily_learning_plan?.map((plan, i) => (
                  <div key={i} className="rounded-xl border border-slate-200/80 p-3 text-xs dark:border-slate-800">
                    <span className="font-bold text-brand-600">Day {plan.day}</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">{plan.topic}</p>
                    <p className="text-slate-500 mt-1">{plan.task}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

        </div>
      )}
    </div>
  )
}
