import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Leaf, Plus, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Button } from '@/components/ui/button'
import { stats } from '@/lib/data/stats'
import { siteConfig } from '@/lib/site-config'

const floatingCards = [
  {
    icon: ShieldCheck,
    label: '15+ Years of Trust',
    className: 'left-0 top-10',
  },
  {
    icon: Leaf,
    label: 'Naturally Focused Care',
    className: 'bottom-8 right-0',
  },
]

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

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
            <span className="text-gradient-brand">Caring</span> for a Healthier
            Life, Every Day
          </h1>

          <p className="text-slate mt-6 max-w-xl text-lg leading-relaxed">
            {siteConfig.legalName} delivers trusted pharmaceutical,
            nutraceutical, cosmeceutical and food-supplement solutions across
            Pakistan — with 15+ years of quality, reliability and care.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild variant="brand" size="lg">
              <Link to="/products">
                Explore Our Products
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Become a Partner</Link>
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

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="bg-gradient-brand relative aspect-square overflow-hidden rounded-[2rem] shadow-xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Plus
                className="size-40 text-white/90"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          </div>

          {floatingCards.map(({ icon: Icon, label, className }) => (
            <motion.div
              key={label}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`border-border absolute flex items-center gap-3 rounded-xl border bg-white/95 px-4 py-3 shadow-lg backdrop-blur ${className}`}
            >
              <span className="bg-mist text-brand-blue flex size-9 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </span>
              <span className="text-charcoal text-sm font-semibold">
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
