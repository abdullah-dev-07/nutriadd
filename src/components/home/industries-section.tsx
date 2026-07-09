import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { industries } from '@/lib/data/industries'

export function IndustriesSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Industries We Serve"
          title="Healthcare Solutions Across Every Sector"
          description="Our products and partnerships support a wide range of healthcare and wellness businesses."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="border-border flex h-full gap-4 rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <span className="bg-accent text-brand-green-dark flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-6" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-slate mt-1">{description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
