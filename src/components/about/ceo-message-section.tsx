import { Quote } from 'lucide-react'

import ceoPhoto from '@/assets/ceo-sajid-janjua.png'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { leadership } from '@/lib/data/company'

export function CeoMessageSection() {
  return (
    <Section tone="muted">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="mx-auto max-w-xs text-center lg:mx-0">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-lg">
                <img
                  src={ceoPhoto}
                  alt={`${leadership.name}, ${leadership.role}`}
                  width={660}
                  height={594}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-6 text-xl font-semibold">{leadership.name}</h3>
              <p className="text-slate mt-1">{leadership.role}</p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-brand-green-dark mb-3 text-sm font-semibold tracking-widest uppercase">
              Message from Leadership
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl">
              A Message from Our CEO
            </h2>
            <Quote
              className="text-brand-green mt-6 size-10"
              aria-hidden="true"
            />
            <div className="text-slate mt-4 space-y-4 text-lg leading-relaxed">
              {leadership.message.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
