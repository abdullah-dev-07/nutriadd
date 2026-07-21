import { Loader2, PackageOpen, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api/client'
import { getMyOrders } from '@/lib/api/orders'
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const result = await getMyOrders()
        if (!cancelled) {
          setOrders(result)
          setStatus('success')
        }
      } catch (error) {
        if (cancelled) return
        setErrorMessage(
          error instanceof ApiError
            ? error.detail
            : 'Something went wrong while loading your orders.'
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
    <div className="border-border rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <Seo title="My Orders" path="/account/orders" noindex />
      <h2 className="text-xl font-bold">My Orders</h2>

      {status === 'loading' && (
        <div className="flex min-h-[30vh] items-center justify-center" role="status">
          <Loader2 className="text-brand-blue size-7 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading orders…</span>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-red-50 p-8 text-center">
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

      {status === 'success' && orders.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-xl bg-mist p-10 text-center">
          <PackageOpen className="text-slate size-8" aria-hidden="true" />
          <p className="text-slate mt-3 text-sm">
            You haven&apos;t placed any orders yet.
          </p>
          <Button asChild variant="brand" size="sm" className="mt-4">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      )}

      {status === 'success' && orders.length > 0 && (
        <ul className="mt-6 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={`/account/orders/${order.id}`}
                className="border-border hover:border-brand-blue flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
              >
                <div>
                  <p className="text-charcoal text-sm font-semibold">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-slate text-xs">
                    {formatDate(order.created_at)}
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
                <span className="text-charcoal font-bold">
                  {formatCurrency(order.total)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
