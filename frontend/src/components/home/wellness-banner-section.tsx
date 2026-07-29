import wellnessRunners from '@/assets/brand/wellness_runners.png'
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
            <span className="text-charcoal">Arousal level of </span>
            <span className="from-brand-green to-brand-blue bg-gradient-to-r bg-clip-text text-transparent">
              wellness
            </span>
            <span className="text-charcoal"> with NutriAdd by Life Care</span>
          </h2>
          <p className="text-slate mt-6 max-w-xl text-lg leading-relaxed">
            Move with energy, live with vitality. Our science-backed
            nutraceuticals are formulated to support an active, healthier
            lifestyle — every single day.
          </p>
          <div className="bg-gradient-brand mt-8 h-1.5 w-24 rounded-full" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="bg-gradient-brand absolute -inset-3 rounded-[2.5rem] opacity-10 blur-2xl" />
            {/* The source PNG has a lot of surrounding whitespace and baked-in text;
                crop to the top-left runners artwork so only the illustration shows. */}
            <div className="border-border/60 relative aspect-[16/10] overflow-hidden rounded-3xl border bg-white shadow-sm">
              <img
                src={wellnessRunners}
                alt="A man and a woman moving actively, energised by wellness"
                loading="lazy"
                className="absolute top-0 left-0 h-auto w-[130%] max-w-none -translate-x-[6%] -translate-y-[4%]"
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
