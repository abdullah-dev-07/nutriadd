import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  showText?: boolean
  theme?: 'dark' | 'light'
}

export function Logo({
  className,
  showText = true,
  theme = 'dark',
}: LogoProps) {
  const isLight = theme === 'light'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 40 40"
        className="h-9 w-9 shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7AC043" />
            <stop offset="1" stopColor="#0072BC" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#logo-gradient)" />
        <path d="M17 10h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#ffffff" />
      </svg>

      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-xl font-bold tracking-tight">
            <span className={isLight ? 'text-white' : 'text-charcoal'}>
              Nutri
            </span>
            <span className={isLight ? 'text-brand-green' : 'text-brand-blue'}>
              Add
            </span>
          </span>
          <span
            className={cn(
              'mt-1 text-[0.62rem] font-medium tracking-[0.22em] uppercase',
              isLight ? 'text-white/60' : 'text-slate'
            )}
          >
            Life Care
          </span>
        </span>
      )}
    </span>
  )
}
