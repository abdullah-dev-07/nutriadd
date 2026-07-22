import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart/cart-context'
import { formatCurrency } from '@/lib/format'
import { getProductImage } from '@/lib/product-images'
import { cn } from '@/lib/utils'
import { type Product } from '@/types/product'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const href = `/products/${product.slug}`
  const inStock = product.availability === 'in_stock'

  return (
    <article className="group border-border flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <Link to={href} className="bg-mist relative block aspect-square overflow-hidden">
        <img
          src={getProductImage(product.image_url, product.slug)}
          alt={product.name}
          loading="lazy"
          className="size-full object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={cn(
            'absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold',
            inStock
              ? 'bg-accent text-brand-green-dark'
              : 'bg-destructive/10 text-destructive'
          )}
        >
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <span className="text-brand-blue text-xs font-semibold tracking-wide uppercase">
          {product.category.name}
        </span>
        <h3 className="mt-2 text-xl font-semibold">
          <Link to={href} className="hover:text-brand-blue transition-colors">
            {product.name}
          </Link>
        </h3>
        <p className="text-slate mt-2 flex-1">{product.short_description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-charcoal text-lg font-bold">
            {formatCurrency(product.price, product.currency)}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link to={href}>View Details</Link>
          </Button>
          <Button
            variant="brand"
            className="flex-1"
            disabled={!inStock}
            onClick={() => addItem(product, 1)}
          >
            <ShoppingCart aria-hidden="true" />
            {inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      </div>
    </article>
  )
}
