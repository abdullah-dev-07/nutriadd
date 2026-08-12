import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type SectionProps = ComponentProps<'section'> & {
  tone?: 'default' | 'muted' | 'dark'
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  default: 'bg-background',
  muted: 'bg-mist',
  // Fixed dark band — stays dark in BOTH themes (bg-charcoal would flip to a
  // light surface in dark mode, hiding the white text).
  dark: 'bg-surface-dark text-surface-dark-foreground',
}

export function Section({
  tone = 'default',
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn('py-20 md:py-28', toneClasses[tone], className)}
      {...props}
    >
      {children}
    </section>
  )
}
