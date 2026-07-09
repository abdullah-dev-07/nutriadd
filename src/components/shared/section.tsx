import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type SectionProps = ComponentProps<'section'> & {
  tone?: 'default' | 'muted' | 'dark'
}

const toneClasses: Record<NonNullable<SectionProps['tone']>, string> = {
  default: 'bg-background',
  muted: 'bg-mist',
  dark: 'bg-charcoal text-white',
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
