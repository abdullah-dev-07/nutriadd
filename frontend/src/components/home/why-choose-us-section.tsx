import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { features } from '@/lib/data/features'
import { stats } from '@/lib/data/stats'

export function WhyChooseUsSection() {
  return (
    <Section tone="dark">
      <Container>
        <SectionHeading
          tone="light"
          eyebrow="Why Choose Us"
          title="The Partner Healthcare Businesses Rely On"
          description="We combine experience, quality and reach to help our partners grow with confidence."
        />

        <dl className="mt-14 grid grid-cols-2 gap-8 border-y border-white/10 py-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="font-heading text-brand-green text-4xl font-bold">
                {stat.value}
              </dt>
              <dd className="mt-2 text-sm text-white/70">{stat.label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-7 transition-colors hover:bg-white/10">
                <span className="text-brand-green flex size-12 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-white/70">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
