import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { HeroBottleShowcase } from '@/components/home/hero-bottle-showcase'
import { Container } from '@/components/shared/container'
import { Button } from '@/components/ui/button'
import { stats } from '@/lib/data/stats'
import { siteConfig } from '@/lib/site-config'

export function HeroSection() {
  return (
    <section className="bg-mist relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-brand-green/20 absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-brand-blue/20 absolute top-1/3 -right-24 h-80 w-80 rounded-full blur-3xl" />
      </div>

      <Container className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="border-border text-slate inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-sm font-medium shadow-sm">
            <span className="bg-brand-green size-2 rounded-full" />
            Pharmaceuticals · Nutraceuticals · Healthcare
          </span>

          <h1 className="mt-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl">
            <span className="text-gradient-brand">Wellness</span> Supplements,
            Delivered
          </h1>

          <p className="text-slate mt-6 max-w-xl text-lg leading-relaxed">
            Science-backed nutraceuticals from {siteConfig.legalName} — for
            brain, sleep, bone, energy and everyday wellness. Trusted for 15+
            years across Pakistan.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild variant="brand" size="lg">
              <Link to="/products">
                Shop Products
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn About Us</Link>
            </Button>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="font-heading text-charcoal text-2xl font-bold sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="text-slate mt-1 text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroBottleShowcase />
      </Container>
    </section>
  )
}
