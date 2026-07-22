import { CtaBand } from '@/components/shared/cta-band'

export function CtaSection() {
  return (
    <CtaBand
      title="Partner with NutriAdd and Grow Together"
      description="Looking for franchising, trading or marketing opportunities on a national, provincial or district basis? Let's build something healthy, together."
      primary={{ label: 'Get in Touch', to: '/contact' }}
      secondary={{ label: 'View Our Products', to: '/products' }}
    />
  )
}
