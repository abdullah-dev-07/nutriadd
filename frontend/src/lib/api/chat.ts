import { apiFetch } from '@/lib/api/client'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

type ChatRequest = {
  message: string
  history: ChatMessage[]
  page_context?: string
}

type ChatResponse = {
  reply: string
}

export function sendChatMessage(payload: ChatRequest) {
  return apiFetch<ChatResponse>('/chat', { method: 'POST', body: payload })
}
