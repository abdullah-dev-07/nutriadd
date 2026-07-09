import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Button } from '@/components/ui/button'

type CtaAction = {
  label: string
  to: string
}

type CtaBandProps = {
  title: string
  description: string
  primary: CtaAction
  secondary?: CtaAction
}

export function CtaBand({
  title,
  description,
  primary,
  secondary,
}: CtaBandProps) {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="bg-gradient-brand relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-xl sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-lg text-white/90">{description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-brand-blue bg-white hover:bg-white/90"
              >
                <Link to={primary.to}>
                  {primary.label}
                  <ArrowRight />
                </Link>
              </Button>
              {secondary && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  <Link to={secondary.to}>{secondary.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
