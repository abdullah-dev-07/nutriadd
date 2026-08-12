import { useState } from 'react'

import { BlogIllustration } from '@/components/blog/blog-illustration'
import { blogMediaUrl } from '@/lib/media'
import { type BlogIllustrationKind } from '@/types/content'

type Props = {
  /** Filename served from /media/blog/. When absent, the SVG fallback renders. */
  image?: string
  /** Branded-SVG fallback shown when `image` is missing or fails to load. */
  illustration: BlogIllustrationKind
  alt: string
  className?: string
  /** Intrinsic dimensions of the real image, to reserve layout space (CLS). */
  width?: number
  height?: number
  /** Hero/above-the-fold images should load eagerly; body images lazily. */
  eager?: boolean
}

/**
 * Renders a real blog image from the VPS media server, falling back to the
 * branded SVG illustration when no filename is provided or the file fails to
 * load. The real files live only on the VPS (/var/www/nutriadd/media/blog/) and
 * are never bundled into the frontend or committed to git.
 */
export function BlogImage({
  image,
  illustration,
  alt,
  className,
  width,
  height,
  eager = false,
}: Props) {
  const [failed, setFailed] = useState(false)

  if (!image || failed) {
    return (
      <BlogIllustration kind={illustration} title={alt} className={className} />
    )
  }

  return (
    <img
      src={blogMediaUrl(image)}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
