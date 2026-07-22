import { Loader2, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { deleteProduct } from '@/lib/api/admin'
import { ApiError } from '@/lib/api/client'
import { getProducts } from '@/lib/api/products'
import { getProductImage } from '@/lib/product-images'
import { type Product } from '@/types/product'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      // Large page size so the admin sees the full catalog on one screen.
      const response = await getProducts({ page_size: 100 })
      setProducts(response.items)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError ? err.detail : 'Failed to load products.'
      )
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleDelete(product: Product) {
    if (
      !window.confirm(
        `Delete "${product.name}"? This cannot be undone. (Products referenced by existing orders cannot be deleted.)`
      )
    ) {
      return
    }
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      window.alert(
        err instanceof ApiError ? err.detail : 'Failed to delete product.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-charcoal text-xl font-semibold">
          Products{' '}
          {status === 'ready' && (
            <span className="text-slate text-base font-normal">
              ({products.length})
            </span>
          )}
        </h2>
        <Button asChild variant="brand" size="sm">
          <Link to="/admin/products/new">
            <Plus />
            New Product
          </Link>
        </Button>
      </div>

      {status === 'loading' && (
        <div className="text-slate flex items-center gap-2 py-12">
          <Loader2 className="animate-spin" />
          Loading products…
        </div>
      )}

      {status === 'error' && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
          <TriangleAlert className="size-5 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={load} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {status === 'ready' && products.length === 0 && (
        <p className="text-slate py-12 text-center">
          No products yet. Create your first one.
        </p>
      )}

      {status === 'ready' && products.length > 0 && (
        <div className="border-border overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-border text-slate border-b bg-white">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImage(product.image_url, product.slug)}
                        alt={product.name}
                        loading="lazy"
                        className="bg-mist size-10 shrink-0 rounded-md object-contain p-1"
                      />
                      <span className="text-charcoal font-medium">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-slate px-4 py-3">
                    {product.category.name}
                  </td>
                  <td className="text-charcoal px-4 py-3">
                    {product.currency} {product.price}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.availability === 'in_stock'
                          ? 'text-brand-green-dark bg-accent rounded-full px-2.5 py-0.5 text-xs font-semibold'
                          : 'text-destructive bg-destructive/10 rounded-full px-2.5 py-0.5 text-xs font-semibold'
                      }
                    >
                      {product.availability === 'in_stock'
                        ? 'In stock'
                        : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/admin/products/${product.id}/edit`}>
                          <Pencil />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Trash2 />
                        )}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
