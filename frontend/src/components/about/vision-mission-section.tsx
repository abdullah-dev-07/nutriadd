import { Compass, Target } from 'lucide-react'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { mission, vision } from '@/lib/data/company'

const pillars = [
  { icon: Compass, ...vision },
  { icon: Target, ...mission },
]

export function VisionMissionSection() {
  return (
    <Section>
      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 0.1}>
              <article className="border-border h-full rounded-2xl border bg-white p-8 shadow-sm">
                <span className="bg-gradient-brand flex size-14 items-center justify-center rounded-2xl text-white">
                  <Icon className="size-7" />
                </span>
                <h2 className="mt-6 text-2xl font-bold">{title}</h2>
                <p className="text-slate mt-3 text-lg leading-relaxed">
                  {text}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
