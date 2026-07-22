/**
 * Single source of truth for company-wide constants.
 * Extracted from the NutriAdd (Life Care) brand assets.
 */
export const siteConfig = {
  name: 'NutriAdd',
  legalName: 'NutriAdd (Life Care)',
  tagline: 'Caring for Healthy Life',
  description:
    'NutriAdd (Life Care) is a Lahore-based pharmaceutical, nutraceutical, cosmeceutical and food-supplement company offering marketing, franchising, trading and consultancy across Pakistan.',
  url: import.meta.env.VITE_SITE_URL ?? 'https://www.nutriadd.com',
  contact: {
    email: 'info@lifecare.com',
    phones: [
      '+92-42-35414433',
      '+92-300-8480844',
      '+92-321-8480844',
      '+92-331-8480844',
    ],
    address: {
      street: '118 Abbas Block, Mustafa Town, Opp. UMT Hostel',
      city: 'Lahore',
      country: 'Pakistan',
    },
  },
} as const

export type SiteConfig = typeof siteConfig
