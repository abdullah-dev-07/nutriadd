import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import wellness from '@/assets/brand/wellness.png'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { Button } from '@/components/ui/button'

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
            Move with energy and live with vitality. Our science-backed
            nutraceuticals — made with natural ingredients — help boost energy,
            support immunity and promote everyday wellness for an active life.
          </p>
          <p className="text-brand-green-dark mt-4 text-lg font-semibold">
            Add Nutrition. Add Life.
          </p>
          <div className="mt-8">
            <Button asChild variant="brand" size="lg">
              <Link to="/products">
                Explore Our Products
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <figure className="relative mx-auto w-full max-w-xl">
            <div className="bg-gradient-brand absolute -inset-2 rounded-[2.5rem] opacity-10 blur-2xl" />
            <img
              src={wellness}
              alt="Arousal level of wellness with NutriAdd by Life Care — a man and a woman running actively on a track"
              loading="lazy"
              width={1536}
              height={1024}
              className="border-border/60 relative w-full rounded-3xl border object-cover shadow-sm"
            />
          </figure>
        </Reveal>
      </Container>
    </Section>
  )
}
