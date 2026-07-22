import { CeoMessageSection } from '@/components/about/ceo-message-section'
import { StorySection } from '@/components/about/story-section'
import { ValuesSection } from '@/components/about/values-section'
import { VisionMissionSection } from '@/components/about/vision-mission-section'
import { CtaBand } from '@/components/shared/cta-band'
import { PageHero } from '@/components/shared/page-hero'
import { Seo } from '@/components/shared/seo'

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Us"
        description="A family-driven healthcare company built on trust, quality and 15+ years of commitment across Pakistan."
        path="/about"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        title="Caring for Healthy Life, Together"
        description="A family-driven healthcare company built on trust, quality and 15+ years of commitment to the clients and communities we serve."
      />
      <StorySection />
      <CeoMessageSection />
      <VisionMissionSection />
      <ValuesSection />
      <CtaBand
        title="Let's Build a Healthier Future"
        description="Partner with NutriAdd for franchising, trading or marketing opportunities across Pakistan."
        primary={{ label: 'Get in Touch', to: '/contact' }}
        secondary={{ label: 'Explore Products', to: '/products' }}
      />
    </>
  )
}
