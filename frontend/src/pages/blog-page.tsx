import { useState } from 'react'

import { BlogCard } from '@/components/blog/blog-card'
import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { blogCategories, getAllPosts } from '@/lib/data/blog'
import { cn } from '@/lib/utils'

const ALL_CATEGORY = 'All'
const categories = [ALL_CATEGORY, ...blogCategories]

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)
  const posts = getAllPosts()
  const filteredPosts =
    activeCategory === ALL_CATEGORY
      ? posts
      : posts.filter((post) => post.category === activeCategory)

  return (
    <>
      <Seo
        title="Blog"
        description="Health insights, nutrition guidance and news from the NutriAdd team."
        path="/blog"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Blog' }]}
        title="Insights & Updates"
        description="Health insights, nutrition guidance and news from the NutriAdd team."
      />

      <Section>
        <Container>
          <div
            className="flex flex-wrap justify-center gap-3"
            role="group"
            aria-label="Filter articles by category"
          >
            {categories.map((category) => {
              const isActive = category === activeCategory
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={cn(
                    'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-brand border-transparent text-white'
                      : 'border-border text-slate hover:border-brand-blue hover:text-brand-blue bg-white'
                  )}
                >
                  {category}
                </button>
              )
            })}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.06}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
