import { Loader2, Search, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { getAdminOrders, updateAdminOrderStatus } from '@/lib/api/admin'
import { ApiError } from '@/lib/api/client'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { type Order, type OrderStatus } from '@/types/order'

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
]

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const res = await getAdminOrders({
        search: debounced || undefined,
        status: statusFilter || undefined,
        page_size: 100,
      })
      setOrders(res.items)
      setTotal(res.total)
      setStatus('success')
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'Failed to load orders.')
      setStatus('error')
    }
  }, [debounced, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(order: Order, next: OrderStatus) {
    setUpdatingId(order.id)
    try {
      const updated = await updateAdminOrderStatus(order.id, next)
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)))
    } catch (err) {
      window.alert(
        err instanceof ApiError ? err.detail : 'Failed to update status.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-charcoal text-xl font-semibold">
          Orders{' '}
          {status === 'success' && (
            <span className="text-slate text-base font-normal">({total})</span>
          )}
        </h2>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="text-slate/60 absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search order #, customer name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            aria-label="Search orders"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="border-input text-charcoal bg-card h-10 rounded-lg border px-3.5 text-sm shadow-sm"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && (
        <div className="text-slate flex items-center gap-2 py-12">
          <Loader2 className="animate-spin" />
          Loading orders…
        </div>
      )}

      {status === 'error' && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <TriangleAlert className="size-5 shrink-0" />
          <span>{error}</span>
          <button onClick={load} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {status === 'success' && orders.length === 0 && (
        <p className="text-slate py-12 text-center">No orders found.</p>
      )}

      {status === 'success' && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const isOpen = expanded === order.id
            return (
              <div
                key={order.id}
                className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="hover:bg-mist flex w-full flex-wrap items-center gap-4 p-4 text-left transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-charcoal font-semibold">
                      {order.order_number}
                    </p>
                    <p className="text-slate truncate text-sm">
                      {order.customer_name} · {order.customer_email}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                      statusStyles[order.status]
                    )}
                  >
                    {order.status}
                  </span>
                  <span className="text-charcoal font-bold">
                    {formatCurrency(order.total)}
                  </span>
                  <span className="text-slate text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-border space-y-4 border-t p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h3 className="text-slate text-xs font-semibold uppercase">
                          Delivery
                        </h3>
                        <p className="text-charcoal mt-1 text-sm">
                          {order.customer_name}
                          <br />
                          {order.customer_phone}
                          <br />
                          {order.shipping_address}
                        </p>
                        {order.notes && (
                          <p className="text-slate mt-2 text-sm">
                            Notes: {order.notes}
                          </p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-slate text-xs font-semibold uppercase">
                          Items
                        </h3>
                        <ul className="mt-1 space-y-1 text-sm">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="text-charcoal flex justify-between gap-2"
                            >
                              <span className="truncate">
                                {item.product_name} × {item.quantity}
                              </span>
                              <span>
                                {formatCurrency(
                                  item.unit_price * item.quantity
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-charcoal mt-2 flex justify-between border-t pt-2 font-bold">
                          <span>Total</span>
                          <span>{formatCurrency(order.total)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate text-sm font-medium">
                        Update status:
                      </span>
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={
                            s === order.status || updatingId === order.id
                          }
                          onClick={() => changeStatus(order, s)}
                          className={cn(
                            'rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-40',
                            s === order.status
                              ? 'border-transparent ' + statusStyles[s]
                              : 'border-border text-charcoal hover:bg-mist'
                          )}
                        >
                          {updatingId === order.id && s !== order.status ? (
                            <Loader2 className="inline size-3 animate-spin" />
                          ) : (
                            s
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
