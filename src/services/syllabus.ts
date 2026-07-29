import api from './api'

export interface SyllabusItem {
  id:          string
  semester:    number
  branch:      string
  subject:     string
  unit:        string
  topic:       string
  description: string
  tags:        string[]
  pdfUrl:      string | null
  version:     string
  isActive:    boolean
  createdAt:   string
  updatedAt:   string
}

export interface SyllabusListResponse {
  items:    SyllabusItem[]
  total:    number
  page:     number
  pageSize: number
}

export interface AIResult {
  action:    string
  topic:     string
  content?:  string          // explain / summary
  notes?:    string          // notes action
  key_points?: string[]
  exam_tips?:  string[]
  questions?:  any[]         // mcq
  cards?:      any[]         // flashcards
}

export interface SyllabusCreate {
  semester:    number
  branch:      string
  subject:     string
  unit:        string
  topic:       string
  description: string
  tags:        string[]
  pdf_url?:    string | null
  version:     string
  is_active:   boolean
}

export const syllabusService = {
  async list(params?: {
    semester?: number; branch?: string; subject?: string
    unit?: string; search?: string; page?: number; page_size?: number
  }): Promise<SyllabusListResponse> {
    const { data } = await api.get<SyllabusListResponse>('/syllabus', { params })
    return data
  },

  async get(id: string): Promise<SyllabusItem> {
    const { data } = await api.get<SyllabusItem>(`/syllabus/${id}`)
    return data
  },

  async branches(): Promise<string[]> {
    const { data } = await api.get<string[]>('/syllabus/branches')
    return data
  },

  async subjects(semester?: number, branch?: string): Promise<string[]> {
    const { data } = await api.get<string[]>('/syllabus/subjects', { params: { semester, branch } })
    return data
  },

  async aiAction(id: string, action: string, language = 'English'): Promise<AIResult> {
    const { data } = await api.post<AIResult>(`/syllabus/${id}/ai`, { action, language })
    return data
  },

  async create(body: SyllabusCreate): Promise<SyllabusItem> {
    const { data } = await api.post<SyllabusItem>('/syllabus', body)
    return data
  },

  async update(id: string, body: Partial<SyllabusCreate>): Promise<SyllabusItem> {
    const { data } = await api.put<SyllabusItem>(`/syllabus/${id}`, body)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/syllabus/${id}`)
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/syllabus/${id}`)
  },

  async bulkUpsert(items: any[]): Promise<{ inserted: number; updated: number }> {
    const { data } = await api.post<{ inserted: number; updated: number }>('/syllabus/bulk', items)
    return data
  },
}
