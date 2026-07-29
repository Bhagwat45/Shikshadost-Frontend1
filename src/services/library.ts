import api from './api'

export interface LibraryDocument {
  id: string
  title: string
  category: string
  fileType: string
  subject: string
  branch: string
  semester: number
  description: string
  fileUrl: string
  author: string
  tags: string[]
  downloadsCount: number
  avgRating: number
  ratingsCount: number
  isBookmarked: boolean
  createdAt?: string
}

export interface LibraryFilterParams {
  search?: string
  category?: string
  file_type?: string
  branch?: string
  semester?: number
  sort_by?: 'popular' | 'recent' | 'rating'
  page?: number
  page_size?: number
}

export const libraryService = {
  list: async (params?: LibraryFilterParams) => {
    const res = await api.get<{ items: LibraryDocument[]; total: number; page: number; pageSize: number }>(
      '/library/documents',
      { params }
    )
    return res.data
  },

  get: async (id: string) => {
    const res = await api.get<LibraryDocument>(`/library/documents/${id}`)
    return res.data
  },

  create: async (data: Partial<LibraryDocument>) => {
    const res = await api.post<LibraryDocument>('/library/documents', data)
    return res.data
  },

  toggleBookmark: async (id: string) => {
    const res = await api.post<{ bookmarked: boolean }>(`/library/documents/${id}/bookmark`)
    return res.data
  },

  rate: async (id: string, rating: number, review = '') => {
    const res = await api.post<{ avgRating: number; ratingsCount: number }>(
      `/library/documents/${id}/rate`,
      { rating, review }
    )
    return res.data
  },

  download: async (id: string) => {
    const res = await api.post(`/library/documents/${id}/download`)
    return res.data
  },

  aiAction: async (id: string, action: string, language = 'English', question = '') => {
    const res = await api.post(`/library/documents/${id}/ai-action`, {
      action,
      language,
      question,
    })
    return res.data
  },

  recommendations: async () => {
    const res = await api.get<LibraryDocument[]>('/library/recommendations')
    return res.data
  },
}
