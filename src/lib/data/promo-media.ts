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
 * NOTE: The items below are branded placeholders. Replace them with real
 * promotional images and videos when available.
 */
export const promoMedia: MediaItem[] = [
  {
    type: 'image',
    src: '/promo/slide-1.svg',
    alt: 'Featured campaign placeholder',
    caption: 'Featured Campaign — highlight your latest promotion',
  },
  {
    type: 'image',
    src: '/promo/slide-2.svg',
    alt: 'New product launch placeholder',
    caption: 'New Product Launch — announce what’s new',
  },
  {
    type: 'image',
    src: '/promo/slide-3.svg',
    alt: 'Brand promise placeholder',
    caption: 'Caring for Healthy Life',
  },
]
