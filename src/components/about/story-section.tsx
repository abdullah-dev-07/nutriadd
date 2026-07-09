import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { companyStory } from '@/lib/data/company'
import { stats } from '@/lib/data/stats'

export function StorySection() {
  return (
    <Section>
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-brand-green-dark mb-3 text-sm font-semibold tracking-widest uppercase">
            Our Story
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built on Trust, Driven by Care
          </h2>
          <div className="text-slate mt-6 space-y-4 text-lg leading-relaxed">
            {companyStory.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-border rounded-2xl border bg-white p-6 text-center shadow-sm"
              >
                <p className="font-heading text-gradient-brand text-3xl font-bold">
                  {stat.value}
                </p>
                <p className="text-slate mt-2 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
