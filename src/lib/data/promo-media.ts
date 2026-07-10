import { type MediaItem } from '@/types/content'

/**
 * Promotional media shown in the Home page showcase carousel.
 *
 * To update the showcase, only edit this array — no component changes needed.
 *
 * - Images: place files in `public/promo/` and reference them by absolute path
 *   (e.g. `/promo/campaign.jpg`), then add an item with `type: 'image'`.
 * - Videos: place an `.mp4` in `public/promo/` (and optionally a poster image),
 *   then add an item with `type: 'video'`.
 *
 * Example video item:
 *   {
 *     type: 'video',
 *     src: '/promo/company-ad.mp4',
 *     poster: '/promo/company-ad-poster.jpg',
 *     alt: 'NutriAdd company advertisement',
 *     caption: 'Watch our latest campaign',
 *     // For a silent, looping background-style clip use:
 *     // autoPlay: true, loop: true, muted: true, controls: false,
 *   }
 *
 * `fit: 'contain'` shows the whole image without cropping (ideal for posters);
 * omit it (defaults to 'cover') for full-bleed photos.
 */
export const promoMedia: MediaItem[] = [
  {
    type: 'image',
    src: '/promo/promo-magtein-imtiaz.png',
    alt: 'NutriAdd Magtein Magnesium L-Threonate — now available at Imtiaz stores across Pakistan',
    caption:
      'Magtein® Magnesium L-Threonate — now available at Imtiaz nationwide',
    fit: 'contain',
  },
  {
    type: 'image',
    src: '/promo/promo-magtein-benefits.png',
    alt: 'NutriAdd Magtein Magnesium L-Threonate benefits: crosses the blood-brain barrier, enhances cognitive function, protects brain health and improves sleep quality',
    caption:
      'Magtein® Magnesium L-Threonate — supports memory, sleep and cognitive function',
    fit: 'contain',
  },
]
