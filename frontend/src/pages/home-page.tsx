import { ContactPreviewSection } from '@/components/home/contact-preview-section'
import { CtaSection } from '@/components/home/cta-section'
import { FeaturedProductsSection } from '@/components/home/featured-products-section'
import { HeroSection } from '@/components/home/hero-section'
import { PromoShowcaseSection } from '@/components/home/promo-showcase-section'
import { ShopByCategorySection } from '@/components/home/shop-by-category-section'
import { WellnessBannerSection } from '@/components/home/wellness-banner-section'
import { WhyChooseUsSection } from '@/components/home/why-choose-us-section'
import { Seo } from '@/components/shared/seo'
import { organizationSchema } from '@/lib/structured-data'

export default function HomePage() {
  return (
    <>
      <Seo title="Home" path="/" jsonLd={organizationSchema()} />
      <HeroSection />
      <ShopByCategorySection />
      <FeaturedProductsSection />
      <WellnessBannerSection />
      <WhyChooseUsSection />
      <PromoShowcaseSection />
      <CtaSection />
      <ContactPreviewSection />
    </>
  )
}
