import { BadgeCheck, ShieldCheck, Users } from 'lucide-react'

import valueQuality from '@/assets/brand/value-quality.svg'
import valueTeamwork from '@/assets/brand/value-teamwork.svg'
import valueTrust from '@/assets/brand/value-trust.svg'
import { type Value } from '@/types/content'

export const coreValues: Value[] = [
  {
    icon: ShieldCheck,
    image: valueTrust,
    title: 'Trust',
    description:
      'A reputation earned over 15 years through diligence, dedication and total commitment to our clients.',
  },
  {
    icon: Users,
    image: valueTeamwork,
    title: 'Team Work',
    description:
      '“We are Family.” Coming together is a beginning, keeping together is progress, working together is success.',
  },
  {
    icon: BadgeCheck,
    image: valueQuality,
    title: 'Quality',
    description:
      'Quality encompasses every aspect of our work, from sourcing and operations to client satisfaction.',
  },
]
