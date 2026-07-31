import api from './api'

export interface Conversation {
  id: string
  title: string
  pinned: boolean
  messageCount: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export const chatService = {
  async createConversation(title = 'New Chat'): Promise<Conversation> {
    const { data } = await api.post<Conversation>('/chat/conversations', { title })
    return data
  },

  async listConversations(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>('/chat/conversations')
    return data
  },

  async getConversation(id: string): Promise<Conversation> {
    const { data } = await api.get<Conversation>(`/chat/conversations/${id}`)
    return data
  },

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const { data } = await api.patch<Conversation>(`/chat/conversations/${id}`, { title })
    return data
  },

  async pinConversation(id: string, pinned: boolean): Promise<Conversation> {
    const { data } = await api.patch<Conversation>(`/chat/conversations/${id}`, { pinned })
    return data
  },

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/chat/conversations/${id}`)
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`)
    return data
  },

  /**
   * Send a message and return an EventSource-compatible SSE stream URL.
   * We use fetch directly (not axios) to consume SSE streams.
   */
  async streamMessage(
    conversationId: string,
    content: string,
    token: string,
    onChunk: (text: string) => void,
    onDone: () => void,
    onError: (msg: string) => void,
  ): Promise<void> {
    const baseUrl = import.meta.env.VITE_API_URL ?? 'https://shikshadost-backend.onrender.com/api'
    const url = `${baseUrl}/chat/conversations/${conversationId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Request failed' }))
      onError(err.detail ?? 'Failed to send message')
      return
    }

    const reader = response.body?.getReader()
    if (!reader) { onError('Stream unavailable'); return }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''   // keep incomplete last line

      let i = 0
      while (i < lines.length) {
        const line = lines[i].trim()
        if (line.startsWith('event:')) {
          const event = line.replace('event:', '').trim()
          const dataLine = lines[i + 1]?.trim() ?? ''
          const raw = dataLine.replace('data:', '').trim()

          if (event === 'chunk') {
            try { onChunk(JSON.parse(raw).content ?? '') } catch {}
          } else if (event === 'done') {
            onDone()
          } else if (event === 'error') {
            try { onError(JSON.parse(raw).message ?? 'Unknown error') } catch { onError('Stream error') }
          }
          i += 2
        } else {
          i++
        }
      }
    }
  },
}
