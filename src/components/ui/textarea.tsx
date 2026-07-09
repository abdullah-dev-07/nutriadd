import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'border-input text-charcoal placeholder:text-slate/60 focus-visible:border-brand-blue focus-visible:ring-ring/30 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30 flex min-h-32 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
