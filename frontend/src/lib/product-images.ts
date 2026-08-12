import nutriaddLogo from '@/assets/nutriadd-logo.jpg'

/**
 * Resolve the image to display for a product.
 *
 * In production the API returns an absolute URL for `image_url` (product media is
 * served from the VPS at /media/..., not bundled into the frontend), which is used
 * directly. Product images are intentionally NOT bundled in the codebase — when a
 * product has no usable `image_url` we fall back to the NutriAdd logo placeholder.
 */
export function getProductImage(imageUrl: string, _slug?: string): string {
  if (imageUrl && /^https?:\/\//.test(imageUrl)) return imageUrl
  return nutriaddLogo
}
