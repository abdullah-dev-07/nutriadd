import { ArrowLeft, CalendarDays, Clock, UserRound } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { BlogCard } from '@/components/blog/blog-card'
import { BlogContent } from '@/components/blog/blog-content'
import { Container } from '@/components/shared/container'
import { CtaBand } from '@/components/shared/cta-band'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { getPostBySlug, getRelatedPosts } from '@/lib/data/blog'
import { formatDate } from '@/lib/format'
import { blogPostingSchema } from '@/lib/structured-data'
import { siteConfig } from '@/lib/site-config'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Article not found</h1>
          <p className="text-slate mx-auto mt-4 max-w-md text-lg">
            The article you are looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className="mt-8">
            <Button asChild variant="brand" size="lg">
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </Container>
      </Section>
    )
  }

  const relatedPosts = getRelatedPosts(post.slug)
  const postPath = `/blog/${post.slug}`

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={postPath}
        type="article"
        jsonLd={blogPostingSchema(post, `${siteConfig.url}${postPath}`)}
      />
      <article>
        <Section tone="muted" className="pb-14">
          <Container>
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link
                to="/blog"
                className="text-slate hover:text-brand-blue inline-flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Blog
              </Link>
            </nav>

            <div className="mx-auto max-w-3xl text-center">
              <span className="bg-accent text-brand-green-dark inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
                {post.category}
              </span>
              <h1 className="mt-5 text-3xl font-bold sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <div className="text-slate mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-4" aria-hidden="true" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden="true" />
                  {post.readingTime} min read
                </span>
              </div>
            </div>
          </Container>
        </Section>

        <Section className="pt-14">
          <Container>
            <div
              className="bg-gradient-brand mx-auto mb-12 aspect-[21/9] max-w-4xl rounded-3xl shadow-md"
              aria-hidden="true"
            />
            <div className="mx-auto max-w-3xl">
              <BlogContent blocks={post.content} />
            </div>
          </Container>
        </Section>
      </article>

      {relatedPosts.length > 0 && (
        <Section tone="muted">
          <Container>
            <SectionHeading eyebrow="Keep Reading" title="Related Articles" />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related, index) => (
                <Reveal key={related.slug} delay={index * 0.06}>
                  <BlogCard post={related} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand
        title="Have a Question About Our Products?"
        description="Our team is here to help with product enquiries, partnerships and more."
        primary={{ label: 'Contact Us', to: '/contact' }}
        secondary={{ label: 'View Products', to: '/products' }}
      />
    </>
  )
}
