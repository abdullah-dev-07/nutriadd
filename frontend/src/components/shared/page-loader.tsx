import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
    >
      <Loader2
        className="text-brand-blue size-8 animate-spin"
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
