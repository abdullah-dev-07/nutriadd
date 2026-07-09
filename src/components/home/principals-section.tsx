import { Network } from 'lucide-react'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { principals } from '@/lib/data/principals'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((word) => !/^(&|and|group)$/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function PrincipalsSection() {
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Our Principals"
          title="Partnered with Leading Healthcare Brands"
          description="We proudly represent and distribute for a trusted network of pharmaceutical and nutraceutical principals."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {principals.map(({ name, category }, index) => (
            <Reveal key={name} delay={index * 0.05}>
              <article className="border-border flex h-full items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <span className="bg-gradient-brand font-heading flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white">
                  {getInitials(name)}
                </span>
                <div className="min-w-0">
                  <h3 className="text-charcoal truncate font-semibold">
                    {name}
                  </h3>
                  <p className="text-slate text-sm">{category}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="border-brand-blue/20 mt-10 flex flex-col items-center gap-4 rounded-2xl border bg-white p-8 text-center shadow-sm sm:flex-row sm:text-left">
            <span className="bg-accent text-brand-blue flex size-14 shrink-0 items-center justify-center rounded-2xl">
              <Network className="size-7" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">
                FAMS Pharma Care — Our Sister Concern
              </h3>
              <p className="text-slate mt-1">
                Our dedicated distribution network, extending reliable reach and
                supply across Pakistan.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
