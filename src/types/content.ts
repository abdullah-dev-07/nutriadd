import { type LucideIcon } from 'lucide-react'

export type IconContent = {
  icon: LucideIcon
  title: string
  description: string
}

export type Service = IconContent
export type Value = IconContent
export type Feature = IconContent
export type Industry = IconContent

export type Stat = {
  value: string
  label: string
}

export type Principal = {
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

export type PostBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readingTime: number
  content: PostBlock[]
}
