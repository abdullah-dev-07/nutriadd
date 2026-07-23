import { useEffect, useState } from 'react'

import { Container } from '@/components/shared/container'
import { MediaCarousel } from '@/components/shared/media-carousel'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { getPromoMedia, type PromoMediaRead } from '@/lib/api/promo-media'
import { promoMedia as bundledPromoMedia } from '@/lib/data/promo-media'
import { type MediaItem } from '@/types/content'

function toMediaItem(item: PromoMediaRead): MediaItem {
  const shared = {
    src: item.url,
    alt: item.alt,
    caption: item.caption ?? undefined,
    fit: 'contain' as const,
  }
  return item.media_type === 'video'
    ? { type: 'video', poster: item.poster_url ?? undefined, ...shared }
    : { type: 'image', ...shared }
}

export function PromoShowcaseSection() {
  // Showcase items are managed from the admin panel and stored in the database.
  // Until they load (or if the API is unreachable) we render the bundled media so
  // the section never appears empty or flashes.
  const [items, setItems] = useState<MediaItem[]>(bundledPromoMedia)

  useEffect(() => {
    let cancelled = false

    getPromoMedia()
      .then((records) => {
        if (cancelled || records.length === 0) return
        setItems(records.map(toMediaItem))
      })
      .catch(() => {
        // Keep the bundled fallback on any API error.
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (items.length === 0) return null

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
            <MediaCarousel items={items} aspectClassName="aspect-square" />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
