import { ArrowRight, Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ProductCard } from '@/components/products/product-card'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'
import { getProducts } from '@/lib/api/products'
import { type Product } from '@/types/product'

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setError(null)
      try {
        const response = await getProducts({ page_size: 100 })
        if (cancelled) return
        setProducts(response.items)
        setStatus('success')
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof ApiError ? err.detail : 'Could not load products.'
        )
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  return (
    <Section id="products">
      <Container>
        <SectionHeading
          eyebrow="Shop NutriAdd"
          title="Our Products"
          description="Science-backed nutraceuticals for brain, sleep, bone, energy and everyday wellness — add to cart and order in minutes."
        />

        <div className="mt-14">
          {status === 'loading' && (
            <div
              className="flex min-h-[30vh] items-center justify-center"
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
            <div className="border-border mx-auto flex max-w-lg flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm">
              <span className="bg-destructive/10 text-destructive flex size-14 items-center justify-center rounded-2xl">
                <TriangleAlert className="size-7" aria-hidden="true" />
              </span>
              <p className="text-slate mt-5 text-lg">
                {error ?? 'Please try again in a moment.'}
              </p>
              <Button
                variant="brand"
                className="mt-6"
                onClick={() => setReloadToken((t) => t + 1)}
              >
                Try Again
              </Button>
            </div>
          )}

          {status === 'success' && products.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <Reveal key={product.id} delay={Math.min(index, 6) * 0.06}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Button asChild variant="brand" size="lg">
                  <Link to="/products">
                    View All Products
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </Container>
    </Section>
  )
}
