import { Container } from '@/components/shared/container'
import { MediaCarousel } from '@/components/shared/media-carousel'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { promoMedia } from '@/lib/data/promo-media'

export function PromoShowcaseSection() {
  if (promoMedia.length === 0) return null

  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Highlights"
          title="Campaigns & Announcements"
          description="A closer look at our latest promotions, product launches and featured media."
        />
        <Reveal className="mt-14">
          <div className="mx-auto max-w-2xl">
            <MediaCarousel items={promoMedia} aspectClassName="aspect-square" />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
