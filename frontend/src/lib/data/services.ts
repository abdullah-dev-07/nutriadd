import { ArrowRightLeft, Handshake, Lightbulb, Megaphone } from 'lucide-react'

import { type Service } from '@/types/content'

export const services: Service[] = [
  {
    icon: Megaphone,
    title: 'Marketing',
    description:
      'Strategic promotion and brand-building that connects quality healthcare products with the practitioners and patients who need them.',
  },
  {
    icon: Handshake,
    title: 'Franchising',
    description:
      'Partner with an established name and grow your business on a national, provincial or district basis with dependable support.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Trading',
    description:
      'Reliable sourcing and supply of pharmaceuticals, nutraceuticals and healthcare products through a trusted distribution network.',
  },
  {
    icon: Lightbulb,
    title: 'Consultancy',
    description:
      'Expert guidance drawn from 15+ years of industry experience to help you launch, position and scale healthcare products.',
  },
]
