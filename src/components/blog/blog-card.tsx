import { ArrowRight, CalendarDays, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

import { formatDate } from '@/lib/format'
import { type BlogPost } from '@/types/content'

export function BlogCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.slug}`

  return (
    <article className="group border-border flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <Link to={href} tabIndex={-1} aria-hidden="true">
        <div className="bg-gradient-brand flex aspect-[16/9] items-end p-5">
          <span className="text-brand-blue rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
            {post.category}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="text-slate flex items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {formatDate(post.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {post.readingTime} min read
          </span>
        </div>

        <h3 className="mt-3 text-xl font-semibold">
          <Link to={href} className="hover:text-brand-blue transition-colors">
            {post.title}
          </Link>
        </h3>
        <p className="text-slate mt-2 flex-1">{post.excerpt}</p>

        <Link
          to={href}
          className="text-brand-blue hover:text-brand-blue-dark mt-4 inline-flex items-center gap-2 font-semibold transition-colors"
        >
          Read more
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  )
}
