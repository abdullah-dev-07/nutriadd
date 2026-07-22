import { Leaf, Smile, Sparkles, Stethoscope, Store, Truck } from 'lucide-react'

import { type Industry } from '@/types/content'

export const industries: Industry[] = [
  {
    icon: Stethoscope,
    title: 'Hospitals & Clinics',
    description:
      'Supplying dependable pharmaceuticals and healthcare essentials to medical institutions.',
  },
  {
    icon: Store,
    title: 'Retail Pharmacies',
    description:
      'Keeping chemists and pharmacies stocked with trusted, quality-assured products.',
  },
  {
    icon: Truck,
    title: 'Distributors & Franchises',
    description:
      'Empowering business partners with a proven brand and a reliable supply chain.',
  },
  {
    icon: Leaf,
    title: 'Wellness & Nutrition',
    description:
      'Nutraceuticals and food supplements that support everyday health and vitality.',
  },
  {
    icon: Smile,
    title: 'Dental Care',
    description:
      'Oral-care and dentistry products formulated for daily hygiene and protection.',
  },
  {
    icon: Sparkles,
    title: 'Skincare & Cosmetics',
    description:
      'Cosmeceuticals that pair clinical care with visible, confidence-building results.',
  },
]
