import {
  Bone,
  Brain,
  HeartPulse,
  Moon,
  ShieldPlus,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { getCategories } from '@/lib/api/products'
import { type Category } from '@/types/product'

// Map known category slugs to an icon; anything unmapped falls back to Sparkles.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'brain-cognitive-health': Brain,
  'sleep-relaxation': Moon,
  'bone-joint-health': Bone,
  'womens-health-energy': HeartPulse,
  'energy-wellness': Zap,
  'energy-immunity': ShieldPlus,
}

export function ShopByCategorySection() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    getCategories()
      .then((data) => {
        if (!cancelled) setCategories(data)
      })
      .catch(() => {
        // Silent: if categories can't load, the section simply doesn't render.
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (categories.length === 0) return null

  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Find the right support for how you want to feel."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? Sparkles
            return (
              <Reveal key={category.id} delay={Math.min(index, 6) * 0.05}>
                <Link
                  to={`/products?category=${encodeURIComponent(category.slug)}`}
                  className="border-border hover:border-brand-blue group flex h-full flex-col items-center gap-3 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="bg-accent text-brand-blue group-hover:bg-gradient-brand flex size-14 items-center justify-center rounded-2xl transition-colors group-hover:text-white">
                    <Icon className="size-7" aria-hidden="true" />
                  </span>
                  <span className="text-charcoal text-sm font-semibold">
                    {category.name}
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
