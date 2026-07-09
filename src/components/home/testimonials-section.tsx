import { Quote } from 'lucide-react'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { testimonials } from '@/lib/data/testimonials'

export function TestimonialsSection() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by Partners Across Pakistan"
          description="The relationships we build are the truest measure of our commitment to care."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map(({ quote, name, role }, index) => (
            <Reveal key={name} delay={index * 0.08}>
              <figure className="border-border flex h-full flex-col rounded-2xl border bg-white p-7 shadow-sm">
                <Quote className="text-brand-green size-8" aria-hidden="true" />
                <blockquote className="text-charcoal mt-4 flex-1 text-lg leading-relaxed">
                  “{quote}”
                </blockquote>
                <figcaption className="border-border mt-6 flex items-center gap-3 border-t pt-5">
                  <span className="bg-mist font-heading text-brand-blue flex size-11 items-center justify-center rounded-full font-semibold">
                    {name.charAt(0)}
                  </span>
                  <span>
                    <span className="text-charcoal block font-semibold">
                      {name}
                    </span>
                    <span className="text-slate block text-sm">{role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
