import climag from '@/assets/climag.jpeg'
import kal3 from '@/assets/kal-3.jpeg'
import magtein from '@/assets/magtein.jpeg'
import nisavit from '@/assets/nisavit.jpeg'
import nutriaddLogo from '@/assets/nutriadd-logo.jpg'
import qazplus from '@/assets/qazplus.png'
import trig from '@/assets/trig.jpeg'
import vikinD from '@/assets/vikin-d.jpeg'

export const productImages: Record<string, string> = {
  magtein,
  climag,
  'kal-3': kal3,
  nisavit,
  trig,
  'vikin-d': vikinD,
  qazplus,
}

export function getProductImage(imageKey: string): string {
  return productImages[imageKey] ?? nutriaddLogo
}
