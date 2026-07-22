import { Loader2, PackageX, Search, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ProductCard } from '@/components/products/product-card'
import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategories, getProducts } from '@/lib/api/products'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { type Category, type Product } from '@/types/product'

const ALL_CATEGORY = 'All'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setErrorMessage(null)
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts({
            search: debouncedSearch || undefined,
            category:
              activeCategory === ALL_CATEGORY ? undefined : activeCategory,
            page_size: 100,
          }),
          getCategories(),
        ])
        if (cancelled) return
        setProducts(productsResponse.items)
        setCategories(categoriesResponse)
        setStatus('success')
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof ApiError
            ? error.detail
            : 'Something went wrong while loading products.'
        )
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, activeCategory, reloadToken])

  return (
    <>
      <Seo
        title="Products"
        description="Our portfolio across pharmaceuticals, nutraceuticals, cosmeceuticals, food supplements and dentistry."
        path="/products"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        title="Our Products"
        description="A trusted portfolio across pharmaceuticals, nutraceuticals, cosmeceuticals, food supplements and dentistry."
      />

      <Section>
        <Container>
          <div className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="text-slate/60 absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                aria-label="Search products"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div
              className="mt-6 flex flex-wrap justify-center gap-3"
              role="group"
              aria-label="Filter products by category"
            >
              {[ALL_CATEGORY, ...categories.map((category) => category.slug)].map(
                (categorySlug) => {
                  const isActive = categorySlug === activeCategory
                  const label =
                    categorySlug === ALL_CATEGORY
                      ? ALL_CATEGORY
                      : (categories.find((c) => c.slug === categorySlug)
                          ?.name ?? categorySlug)
                  return (
                    <button
                      key={categorySlug}
                      type="button"
                      onClick={() => setActiveCategory(categorySlug)}
                      aria-pressed={isActive}
                      className={cn(
                        'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-gradient-brand border-transparent text-white'
                          : 'border-border text-slate hover:border-brand-blue hover:text-brand-blue bg-white'
                      )}
                    >
                      {label}
                    </button>
                  )
                }
              )}
            </div>
          )}

          <div className="mt-12">
            {status === 'loading' && (
              <div
                className="flex min-h-[40vh] items-center justify-center"
                role="status"
              >
                <Loader2
                  className="text-brand-blue size-8 animate-spin"
                  aria-hidden="true"
                />
                <span className="sr-only">Loading products…</span>
              </div>
            )}

            {status === 'error' && (
              <div className="border-border mx-auto flex max-w-xl flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm">
                <span className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-2xl">
                  <TriangleAlert className="size-8" aria-hidden="true" />
                </span>
                <h2 className="mt-6 text-2xl font-bold">
                  Couldn&apos;t load products
                </h2>
                <p className="text-slate mt-3 text-lg leading-relaxed">
                  {errorMessage ?? 'Please try again in a moment.'}
                </p>
                <Button
                  variant="brand"
                  size="lg"
                  className="mt-8"
                  onClick={() => setReloadToken((token) => token + 1)}
                >
                  Try Again
                </Button>
              </div>
            )}

            {status === 'success' && products.length === 0 && (
              <div className="border-border mx-auto flex max-w-xl flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm">
                <span className="bg-gradient-brand flex size-16 items-center justify-center rounded-2xl text-white">
                  <PackageX className="size-8" aria-hidden="true" />
                </span>
                <h2 className="mt-6 text-2xl font-bold">No products found</h2>
                <p className="text-slate mt-3 text-lg leading-relaxed">
                  Try a different search term or category.
                </p>
              </div>
            )}

            {status === 'success' && products.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <Reveal key={product.id} delay={Math.min(index, 6) * 0.06}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
