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

export type Testimonial = {
  quote: string
  name: string
  role: string
}

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
