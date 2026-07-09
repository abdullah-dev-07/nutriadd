import { ContactPreviewSection } from '@/components/home/contact-preview-section'
import { CtaSection } from '@/components/home/cta-section'
import { HeroSection } from '@/components/home/hero-section'
import { IndustriesSection } from '@/components/home/industries-section'
import { IntroSection } from '@/components/home/intro-section'
import { PrincipalsSection } from '@/components/home/principals-section'
import { ServicesSection } from '@/components/home/services-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { WhyChooseUsSection } from '@/components/home/why-choose-us-section'
import { Seo } from '@/components/shared/seo'
import { organizationSchema } from '@/lib/structured-data'

export default function HomePage() {
  return (
    <>
      <Seo title="Home" path="/" jsonLd={organizationSchema()} />
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <IndustriesSection />
      <WhyChooseUsSection />
      <PrincipalsSection />
      <TestimonialsSection />
      <CtaSection />
      <ContactPreviewSection />
    </>
  )
}
