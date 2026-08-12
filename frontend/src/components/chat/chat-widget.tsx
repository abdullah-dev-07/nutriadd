import { Loader2, Send, X } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { useLocation } from 'react-router-dom'

import chatbotIcon from '@/assets/chatbot_icon.png'
import { sendChatMessage, type ChatMessage } from '@/lib/api/chat'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const GREETING =
  'Hi! 👋 I’m the NutriAdd assistant. Ask me about our products, the company, or anything nutrition-related.'

/**
 * Turns the current route into a short human-readable context string sent to the
 * backend so answers are page-aware (e.g. "Product page: magtein").
 */
function describePage(pathname: string): string {
  if (pathname === '/') return 'Home page'
  const segments = pathname.split('/').filter(Boolean)
  const [first, second] = segments

  const titleize = (s: string) =>
    s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  switch (first) {
    case 'products':
      return second ? `Product page: ${titleize(second)}` : 'Products listing page'
    case 'blog':
      return second ? `Blog article: ${titleize(second)}` : 'Blog listing page'
    case 'about':
      return 'About page'
    case 'contact':
      return 'Contact page'
    case 'cart':
      return 'Shopping cart page'
    case 'checkout':
      return 'Checkout page'
    case 'account':
      return 'Account page'
    default:
      return titleize(first ?? 'a page') + ' page'
  }
}

type UiMessage = ChatMessage & { error?: boolean }

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const location = useLocation()
  const pageContext = useMemo(
    () => describePage(location.pathname),
    [location.pathname]
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, open])

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending) return

    const history: ChatMessage[] = messages
      .filter((m) => !m.error)
      .map(({ role, content }) => ({ role, content }))

    const userMessage: UiMessage = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      const { reply } = await sendChatMessage({
        message: trimmed,
        history,
        page_context: pageContext,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      let content =
        'I couldn’t reach the assistant. Please check your connection and try again.'
      if (err instanceof ApiError) {
        content =
          err.status === 429
            ? 'You’re sending messages a bit too fast. Please wait a moment and try again.'
            : 'Sorry, something went wrong. Please try again in a moment.'
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content, error: true },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        aria-expanded={open}
        className={cn(
          'fixed right-4 bottom-4 z-60 flex items-center justify-center transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 sm:bottom-6',
          open
            ? 'bg-brand-blue size-14 rounded-full shadow-lg'
            : '<size-24></size-24> rounded-full drop-shadow-lg'
        )}
      >
        {open ? (
          <X className="size-6 text-white" aria-hidden="true" />
        ) : (
          <img
            src={chatbotIcon}
            alt=""
            width={80}
            height={80}
            className="size-20 object-contain"
          />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="NutriAdd chat assistant"
          className="border-border bg-card fixed right-4 bottom-20 z-60 flex h-[70vh] max-h-140 w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border shadow-2xl sm:right-6 sm:bottom-24"
        >
          {/* Header */}
          <div className="bg-gradient-brand flex items-center gap-3 px-4 py-3 text-white">
            <img
              src={chatbotIcon}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full bg-white/90 object-contain p-0.5"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold">NutriAdd Assistant</p>
              <p className="text-xs text-white/80">Ask about products & more</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="ml-auto rounded-md p-1 text-white/90 transition-colors hover:bg-white/15"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            <Bubble role="assistant" content={GREETING} />
            {messages.map((m, i) => (
              <Bubble
                key={i}
                role={m.role}
                content={m.content}
                error={m.error}
              />
            ))}
            {sending && (
              <div className="text-slate flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Thinking…
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-border flex items-center gap-2 border-t p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              maxLength={1000}
              className="border-input text-charcoal placeholder:text-slate/60 focus-visible:border-brand-blue focus-visible:ring-ring/30 h-11 w-full rounded-lg border bg-background px-3.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send message"
              className="bg-brand-blue flex size-11 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="size-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function Bubble({
  role,
  content,
  error,
}: {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}) {
  const isUser = role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
          isUser
            ? 'bg-brand-blue rounded-br-sm text-white'
            : error
              ? 'bg-destructive/10 text-destructive rounded-bl-sm'
              : 'bg-mist text-charcoal rounded-bl-sm'
        )}
      >
        {content}
      </div>
    </div>
  )
}
