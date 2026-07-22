import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { services } from '@/lib/data/services'

export function ServicesSection() {
  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="What We Do"
          title="Services Built Around Your Growth"
          description="From marketing to franchising, trading and consultancy, we help healthcare businesses reach further with confidence."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.08}>
              <article className="group border-border h-full rounded-2xl border bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <span className="bg-mist text-brand-blue group-hover:bg-gradient-brand flex size-12 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="text-slate mt-2">{description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
