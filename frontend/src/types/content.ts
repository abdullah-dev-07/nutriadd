import { type LucideIcon } from 'lucide-react'

export type IconContent = {
  icon: LucideIcon
  title: string
  description: string
}

export type Service = IconContent
// `image` (an imported asset URL) takes precedence over `icon` when present.
export type Value = IconContent & { image?: string }
export type Feature = IconContent
export type Industry = IconContent

export type Stat = {
  value: string
  label: string
}

export type Principal = {
  /** Imported logo asset URL. When absent, initials are shown as a fallback. */
  logo?: string

  name: string
  category: string
}

export type MediaFit = 'cover' | 'contain'

export type MediaImage = {
  type: 'image'
  src: string
  alt: string
  caption?: string
  fit?: MediaFit
}

export type MediaVideo = {
  type: 'video'
  src: string
  alt: string
  poster?: string
  caption?: string
  fit?: MediaFit
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
}

export type MediaItem = MediaImage | MediaVideo

/**
 * Rich-text blocks a blog article body is composed of. `text` fields support a
 * lightweight inline markup subset (rendered by <RichText>): **bold**,
 * [label](href) links, and `code`.
 */
export type PostBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | {
      type: 'image'
      /**
       * Filename of a real image served from the VPS at /media/blog/<image>.
       * When present it renders an <img>; on load error (or when omitted) the
       * branded SVG `illustration` is shown instead.
       */
      image?: string
      /** Intrinsic width/height of `image`, used to reserve space (reduce CLS). */
      width?: number
      height?: number
      /** Branded-SVG fallback keyword resolved by <BlogIllustration>. */
      illustration: BlogIllustrationKind
      alt: string
      caption?: string
    }
  | {
      type: 'table'
      headers: string[]
      rows: string[][]
    }

/** Q&A pair used to render an FAQ section (and to emit FAQPage JSON-LD). */
export type FaqItem = {
  question: string
  answer: string
}

/**
 * Named branded illustrations. Each maps to a hand-built SVG in
 * <BlogIllustration>, so the blog never depends on external photo assets.
 */
export type BlogIllustrationKind =
  | 'foods'
  | 'chart'
  | 'supplement'
  | 'sleep'
  | 'default'

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readingTime: number
  /** Branded hero illustration shown when `heroImage` is absent or fails. */
  heroIllustration: BlogIllustrationKind
  /** Filename of the real hero/OG image served from /media/blog/. */
  heroImage?: string
  content: PostBlock[]
  faqs?: FaqItem[]
}
