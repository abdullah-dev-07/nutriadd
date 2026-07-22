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

/**
 * Resolve the image to display for a product. In production the API returns an
 * absolute Azure Blob Storage URL, which is used directly. When that URL is empty
 * (e.g. local dev before Blob Storage is wired up) we fall back to the bundled
 * asset matched by slug, and finally to the NutriAdd logo.
 */
export function getProductImage(imageUrl: string, slug?: string): string {
  if (imageUrl && /^https?:\/\//.test(imageUrl)) return imageUrl
  if (slug && productImages[slug]) return productImages[slug]
  return nutriaddLogo
}
