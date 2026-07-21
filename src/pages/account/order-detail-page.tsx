import { ArrowLeft, Loader2, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'
import { getOrderById } from '@/lib/api/orders'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Order } from '@/types/order'

const statusStyles: Record<string, string> = {
  pending: 'bg-mist text-slate',
  processing: 'bg-accent text-brand-green-dark',
  shipped: 'bg-accent text-brand-green-dark',
  delivered: 'bg-accent text-brand-green-dark',
  cancelled: 'bg-destructive/10 text-destructive',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const result = await getOrderById(id as string)
        if (!cancelled) {
          setOrder(result)
          setStatus('success')
        }
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof ApiError
            ? error.detail
            : 'Something went wrong while loading this order.'
        )
        setStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id, reloadToken])

  return (
    <div className="border-border rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <Seo title="Order Details" path={`/account/orders/${id ?? ''}`} noindex />
      <Link
        to="/account/orders"
        className="text-slate hover:text-brand-blue mb-6 inline-flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Orders
      </Link>

      {status === 'loading' && (
        <div className="flex min-h-[30vh] items-center justify-center" role="status">
          <Loader2 className="text-brand-blue size-7 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading order…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center rounded-xl bg-red-50 p-8 text-center">
          <TriangleAlert className="text-destructive size-8" aria-hidden="true" />
          <p className="text-destructive mt-3 text-sm font-medium">
            {errorMessage}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            Try Again
          </Button>
        </div>
      )}

      {status === 'success' && order && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                Order #{order.id.slice(0, 8)}
              </h2>
              <p className="text-slate text-sm">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                statusStyles[order.status] ?? 'bg-mist text-slate'
              )}
            >
              {order.status}
            </span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Shipping Details</h3>
              <p className="text-slate mt-2 text-sm">{order.customer_name}</p>
              <p className="text-slate text-sm">{order.customer_email}</p>
              <p className="text-slate text-sm">{order.customer_phone}</p>
              <p className="text-slate mt-2 text-sm">
                {order.shipping_address}
              </p>
              {order.notes && (
                <p className="text-slate mt-2 text-sm italic">
                  Note: {order.notes}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold">Items</h3>
            <ul className="mt-3 divide-border divide-y">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="text-charcoal">
                    {item.product_name}{' '}
                    <span className="text-slate/70">× {item.quantity}</span>
                  </span>
                  <span className="text-charcoal font-medium">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-border mt-6 flex items-center justify-between border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-charcoal text-xl font-bold">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
