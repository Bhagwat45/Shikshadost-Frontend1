import api from './api'

export interface NotesResult {
  title: string
  summary: string
  notes: string
  key_points: string[]
  important_terms: { term: string; definition: string }[]
  exam_tips: string[]
  style: string
  language: string
  generatedAt: string
}

export interface Flashcard {
  id: number
  question: string
  answer: string
  hint: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface FlashcardsResult {
  topic: string
  cards: Flashcard[]
  difficulty: string
  generatedAt: string
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: string
  explanation: string
}

export interface QuizResult {
  title: string
  topic: string
  questions: QuizQuestion[]
  difficulty: string
  generatedAt: string
}

export interface OcrResult {
  extracted_text: string
  summary: string
  key_points: string[]
  notes: string
  action: string
  filename?: string
  generatedAt: string
}

export const studyToolsService = {
  async generateNotes(topic: string, style = 'detailed', language = 'English'): Promise<NotesResult> {
    const { data } = await api.post<NotesResult>('/study/notes', { topic, style, language })
    return data
  },

  async generateFlashcards(topic: string, count = 10, difficulty = 'Medium'): Promise<FlashcardsResult> {
    const { data } = await api.post<FlashcardsResult>('/study/flashcards', { topic, count, difficulty })
    return data
  },

  async generateQuiz(topic: string, count = 10, difficulty = 'Medium'): Promise<QuizResult> {
    const { data } = await api.post<QuizResult>('/study/quiz', { topic, count, difficulty })
    return data
  },

  async processOcr(file: File, action = 'extract'): Promise<OcrResult> {
    const form = new FormData()
    form.append('file', file)
    form.append('action', action)
    const { data } = await api.post<OcrResult>('/study/ocr', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
