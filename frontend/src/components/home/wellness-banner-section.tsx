import activeWellness from '@/assets/brand/active-wellness.svg'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'

export function WellnessBannerSection() {
  return (
    <Section tone="muted">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-brand-green-dark mb-3 text-sm font-semibold tracking-widest uppercase">
            Active Living
          </p>
          <h2 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            <span className="text-charcoal">Arouse a level of </span>
            <span className="from-brand-green to-brand-blue bg-gradient-to-r bg-clip-text text-transparent">
              wellness
            </span>
            <span className="text-charcoal"> with NutriAdd by Life Care</span>
          </h2>
          <p className="text-slate mt-6 max-w-xl text-lg leading-relaxed">
            Move with energy, live with vitality. Our science-backed supplements
            are formulated to support an active, healthier lifestyle — every
            single day.
          </p>
          <div className="bg-gradient-brand mt-8 h-1.5 w-24 rounded-full" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto max-w-lg">
            <div className="bg-gradient-brand absolute -inset-3 rounded-[2.5rem] opacity-10 blur-2xl" />
            <img
              src={activeWellness}
              alt="A man and a woman running actively, energised by wellness"
              className="relative w-full"
              loading="lazy"
            />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
