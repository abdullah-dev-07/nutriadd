import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { coreValues } from '@/lib/data/values'

export function ValuesSection() {
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Our Values"
          title="The Principles Behind Everything We Do"
          description="Three values guide our decisions, our partnerships and our promise to those we serve."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {coreValues.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.08}>
              <article className="border-border h-full rounded-2xl border bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-md">
                <span className="bg-gradient-brand mx-auto flex size-14 items-center justify-center rounded-2xl text-white">
                  <Icon className="size-7" />
                </span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3>
                <p className="text-slate mt-2">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
