import api from './api'

export interface ATSResult {
  ats_score: number
  summary: string
  strengths: string[]
  missing_keywords: string[]
  formatting_issues: string[]
  actionable_fixes: string[]
  quantifiable_metrics_check: string
  contact_info_check: string
}

export interface LinkedInReviewResult {
  headline_score: number
  optimized_headline: string
  about_summary_critique: string
  optimized_about: string
  key_improvements: string[]
}

export interface MockQuestion {
  id: number
  question: string
  category: string
  difficulty: string
  hint: string
}

export interface MockEvaluationResult {
  score: number
  confidence_rating: string
  feedback: string
  key_points_missed: string[]
  model_answer: string
}

export interface CodeEvaluationResult {
  status: string
  passed_test_cases: string
  time_complexity: string
  space_complexity: string
  code_feedback: string
  optimized_code: string
}

export const placementService = {
  checkATS: async (resume_text: string, target_role = 'Software Engineer', job_description = '') => {
    const res = await api.post<ATSResult>('/placement/resume-ats-check', {
      resume_text, target_role, job_description,
    })
    return res.data
  },

  generateCoverLetter: async (data: { candidate_name: string; target_role: string; company_name: string; key_skills: string[]; experience: string }) => {
    const res = await api.post<{ cover_letter: string }>('/placement/cover-letter', data)
    return res.data
  },

  reviewLinkedIn: async (profile_text: string, target_industry = 'Software Engineering') => {
    const res = await api.post<LinkedInReviewResult>('/placement/linkedin-review', {
      profile_text, target_industry,
    })
    return res.data
  },

  getMockQuestions: async (interview_type = 'technical', target_role = 'Software Engineer', target_company = 'General') => {
    const res = await api.post<{ questions: MockQuestion[] }>('/placement/mock-interview/questions', {
      interview_type, target_role, target_company,
    })
    return res.data
  },

  evaluateMockAnswer: async (question: string, answer: string, interview_type = 'technical') => {
    const res = await api.post<MockEvaluationResult>('/placement/mock-interview/evaluate', {
      question, answer, interview_type,
    })
    return res.data
  },

  runCode: async (code: string, language = 'python', problem_title = 'Two Sum') => {
    const res = await api.post<CodeEvaluationResult>('/placement/code-run', {
      code, language, problem_title,
    })
    return res.data
  },

  getCompanyQuestions: async (company = 'TCS', category = 'All') => {
    const res = await api.get<any[]>('/placement/company-questions', {
      params: { company, category },
    })
    return res.data
  },

  getLeaderboard: async () => {
    const res = await api.get<any[]>('/placement/leaderboard')
    return res.data
  },

  getDailyChallenge: async () => {
    const res = await api.get<any>('/placement/daily-challenge')
    return res.data
  },
}
