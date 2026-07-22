import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart/cart-context'
import { formatCurrency } from '@/lib/format'
import { getProductImage } from '@/lib/product-images'

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal, totalQuantity } =
    useCart()

  return (
    <>
      <Seo title="Your Cart" path="/cart" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]}
        title="Your Cart"
        description={
          totalQuantity > 0
            ? `${totalQuantity} item${totalQuantity === 1 ? '' : 's'} in your cart.`
            : 'Your cart is currently empty.'
        }
      />

      <Section>
        <Container>
          {items.length === 0 ? (
            <div className="border-border mx-auto flex max-w-xl flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm md:p-14">
              <span className="bg-gradient-brand flex size-16 items-center justify-center rounded-2xl text-white">
                <ShoppingBag className="size-8" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
                Your Cart is Empty
              </h2>
              <p className="text-slate mt-4 text-lg leading-relaxed">
                Browse our catalogue and add products to get started.
              </p>
              <div className="mt-8">
                <Button asChild variant="brand" size="lg">
                  <Link to="/products">Browse Products</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="border-border flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/products/${item.slug}`}
                      className="bg-mist size-20 shrink-0 overflow-hidden rounded-xl"
                    >
                      <img
                        src={getProductImage(item.imageKey)}
                        alt={item.name}
                        loading="lazy"
                        className="size-full object-contain p-2"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${item.slug}`}
                        className="hover:text-brand-blue text-base font-semibold transition-colors"
                      >
                        {item.name}
                      </Link>
                      <p className="text-slate mt-1 text-sm">
                        {formatCurrency(item.price, item.currency)} each
                      </p>
                    </div>

                    <div
                      className="border-border inline-flex items-center self-start rounded-lg border bg-white"
                      role="group"
                      aria-label={`Quantity for ${item.name}`}
                    >
                      <button
                        type="button"
                        className="text-charcoal hover:bg-mist focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-l-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="text-charcoal hover:bg-mist focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-r-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <span className="text-charcoal w-24 text-right text-base font-bold">
                        {formatCurrency(
                          item.price * item.quantity,
                          item.currency
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-slate hover:text-destructive focus-visible:ring-ring rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-border h-fit rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="text-slate flex items-center justify-between">
                    <span>
                      Items ({totalQuantity})
                    </span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>
                <div className="border-border mt-4 flex items-center justify-between border-t pt-4">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-charcoal text-xl font-bold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <Button
                  asChild
                  variant="brand"
                  size="lg"
                  className="mt-6 w-full"
                >
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
