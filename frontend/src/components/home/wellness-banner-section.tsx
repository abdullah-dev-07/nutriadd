import wellnessRunner from '@/assets/brand/wellness_runner.png'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'

export function WellnessBannerSection() {
  return (
    <Section tone="muted">
      <Container>
        {/* The headline is baked into the banner image, so it's provided here as a
            visually-hidden heading for accessibility and SEO. */}
        <h2 className="sr-only">
          Arousal Level of Wellness with NutriAdd by Life Care
        </h2>

        <Reveal>
          <figure className="relative mx-auto max-w-5xl">
            <div className="bg-gradient-brand absolute -inset-2 rounded-[2.5rem] opacity-10 blur-2xl" />
            <img
              src={wellnessRunner}
              alt="Arousal Level of Wellness with NutriAdd — a man and a woman moving actively"
              loading="lazy"
              className="border-border/60 relative w-full rounded-3xl border bg-white shadow-sm"
            />
          </figure>
        </Reveal>
      </Container>
    </Section>
  )
}
