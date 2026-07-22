import { CheckCircle2, Loader2, Minus, Plus, ShoppingCart, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ProductCard } from '@/components/products/product-card'
import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'
import { getProductBySlug, getProducts } from '@/lib/api/products'
import { useCart } from '@/lib/cart/cart-context'
import { formatCurrency } from '@/lib/format'
import { getProductImage } from '@/lib/product-images'
import { siteConfig } from '@/lib/site-config'
import { productSchema } from '@/lib/structured-data'
import { cn } from '@/lib/utils'
import { type Product } from '@/types/product'

type Status = 'loading' | 'success' | 'error' | 'not-found'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    async function load() {
      setStatus('loading')
      setErrorMessage(null)
      setQuantity(1)
      setAdded(false)
      try {
        const found = await getProductBySlug(slug as string)
        if (cancelled) return
        setProduct(found)
        setStatus('success')

        try {
          const related = await getProducts({
            category: found.category.slug,
            page_size: 8,
          })
          if (!cancelled) {
            setRelatedProducts(
              related.items.filter((item) => item.id !== found.id).slice(0, 4)
            )
          }
        } catch {
          if (!cancelled) setRelatedProducts([])
        }
      } catch (error) {
        if (cancelled) return
        if (error instanceof ApiError && error.status === 404) {
          setStatus('not-found')
          return
        }
        setErrorMessage(
          error instanceof ApiError
            ? error.detail
            : 'Something went wrong while loading this product.'
        )
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [slug, reloadToken])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Loader2 className="text-brand-blue size-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading product…</span>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <Section>
        <Container className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Product not found</h1>
          <p className="text-slate mx-auto mt-4 max-w-md text-lg">
            The product you are looking for doesn&apos;t exist or has been
            removed.
          </p>
          <div className="mt-8">
            <Button asChild variant="brand" size="lg">
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </Container>
      </Section>
    )
  }

  if (status === 'error' || !product) {
    return (
      <Section>
        <Container className="text-center">
          <span className="bg-destructive/10 text-destructive mx-auto flex size-16 items-center justify-center rounded-2xl">
            <TriangleAlert className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
            Couldn&apos;t load this product
          </h1>
          <p className="text-slate mx-auto mt-4 max-w-md text-lg">
            {errorMessage ?? 'Please try again in a moment.'}
          </p>
          <div className="mt-8">
            <Button
              variant="brand"
              size="lg"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Try Again
            </Button>
          </div>
        </Container>
      </Section>
    )
  }

  const inStock = product.availability === 'in_stock'
  const productPath = `/products/${product.slug}`
  const productImage = getProductImage(product.image_key)

  return (
    <>
      <Seo
        title={product.name}
        description={product.short_description}
        path={productPath}
        image={productImage}
        jsonLd={productSchema(product, `${siteConfig.url}${productPath}`)}
      />

      <Section className="pt-12 md:pt-16">
        <Container>
          <nav aria-label="Breadcrumb" className="mb-8 text-sm">
            <Link
              to="/products"
              className="text-slate hover:text-brand-blue transition-colors"
            >
              ← Back to Products
            </Link>
          </nav>

          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="bg-mist border-border overflow-hidden rounded-3xl border">
              <img
                src={productImage}
                alt={product.name}
                className="aspect-square size-full object-contain p-10"
              />
            </div>

            <div>
              <span className="text-brand-blue text-xs font-semibold tracking-wide uppercase">
                {product.category.name}
              </span>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-slate mt-4 text-lg leading-relaxed">
                {product.short_description}
              </p>

              <div className="mt-6 flex items-center gap-4">
                <span className="text-charcoal text-3xl font-bold">
                  {formatCurrency(product.price, product.currency)}
                </span>
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold',
                    inStock
                      ? 'bg-accent text-brand-green-dark'
                      : 'bg-destructive/10 text-destructive'
                  )}
                >
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div
                  className="border-border inline-flex items-center rounded-lg border bg-white"
                  role="group"
                  aria-label="Quantity"
                >
                  <button
                    type="button"
                    className="text-charcoal hover:bg-mist focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-l-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="w-10 text-center text-base font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="text-charcoal hover:bg-mist focus-visible:ring-ring inline-flex size-11 items-center justify-center rounded-r-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <Button
                  variant="brand"
                  size="lg"
                  disabled={!inStock}
                  onClick={() => {
                    addItem(product, quantity)
                    setAdded(true)
                  }}
                >
                  <ShoppingCart aria-hidden="true" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>

              <div aria-live="polite">
                {added && (
                  <p className="bg-accent text-brand-green-dark mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
                    <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
                    Added to your cart.
                  </p>
                )}
              </div>

              {product.benefits.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold">Key Benefits</h2>
                  <ul className="mt-3 space-y-2">
                    {product.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="text-slate flex items-start gap-2"
                      >
                        <CheckCircle2
                          className="text-brand-green mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10">
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-slate mt-3 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {relatedProducts.length > 0 && (
        <Section tone="muted">
          <Container>
            <SectionHeading
              eyebrow="You May Also Like"
              title="Related Products"
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related, index) => (
                <Reveal key={related.id} delay={index * 0.06}>
                  <ProductCard product={related} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
