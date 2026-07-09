import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { Button } from '@/components/ui/button'
import { coreValues } from '@/lib/data/values'

export function IntroSection() {
  return (
    <Section>
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="text-brand-green-dark mb-3 text-sm font-semibold tracking-widest uppercase">
            Who We Are
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            A Trusted Name in Healthcare for Over 15 Years
          </h2>
          <div className="text-slate mt-6 space-y-4 text-lg leading-relaxed">
            <p>
              What began as the vision of one man has grown into the dream of
              many. We are a family, and together we make the difference —
              striving to get better, bigger, faster and stronger with every
              step forward.
            </p>
            <p>
              Today we operate across pharmaceuticals, nutraceuticals,
              cosmeceuticals and food supplements, using advanced technology and
              an unwavering focus on quality to earn the trust of clients across
              the region.
            </p>
          </div>
          <div className="mt-8">
            <Button asChild variant="default">
              <Link to="/about">
                More About Us
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="space-y-4">
            {coreValues.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="border-border flex gap-4 rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="bg-gradient-brand flex size-12 shrink-0 items-center justify-center rounded-xl text-white">
                  <Icon className="size-6" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-slate mt-1">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  )
}
