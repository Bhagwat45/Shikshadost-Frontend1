import api from './api'

export interface CareerInput {
  interests: string[]
  skills: string[]
  education: string
  career_goal: string
}

export interface CareerReport {
  id?: string
  target_role: string
  expected_salary: {
    entry_level: string
    mid_level: string
    senior_level: string
  }
  career_suggestions: Array<{
    title: string
    match_pct: number
    reason: string
    top_companies: string[]
  }>
  higher_studies: Array<{
    exam: string
    degree: string
    details: string
    top_colleges: string[]
  }>
  government_exams: Array<{
    exam_name: string
    eligibility: string
    role: string
  }>
  internships_and_jobs: Array<{
    role: string
    type: string
    key_skills: string[]
  }>
  certifications: Array<{
    name: string
    provider: string
    level: string
  }>
  skill_gap_analysis: Array<{
    skill: string
    current_level: string
    target_level: string
    action: string
  }>
  learning_roadmap: Array<{
    phase: number
    title: string
    milestones: string[]
    projects: string[]
  }>
  daily_learning_plan: Array<{
    day: number
    topic: string
    task: string
  }>
}

export const careerService = {
  generate: async (data: CareerInput) => {
    const res = await api.post<{ id: string; report: CareerReport }>('/career/generate', data)
    return res.data
  },

  getMyRoadmaps: async () => {
    const res = await api.get<Array<{ id: string; careerGoal: string; createdAt: string; report: CareerReport }>>(
      '/career/my-roadmaps'
    )
    return res.data
  },

  getRoadmap: async (id: string) => {
    const res = await api.get<{ id: string; report: CareerReport }>(`/career/roadmaps/${id}`)
    return res.data
  },
}
