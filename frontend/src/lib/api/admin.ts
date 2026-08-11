import { apiFetch, apiUpload } from '@/lib/api/client'
import { type Order, type OrderStatus } from '@/types/order'
import { type Product, type ProductInput } from '@/types/product'

export type AdminOrderListParams = {
  search?: string
  status?: OrderStatus
  page?: number
  page_size?: number
}

export type AdminOrderListResponse = {
  items: Order[]
  total: number
  page: number
  page_size: number
}

export function getAdminOrders(params: AdminOrderListParams = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.status) query.set('status', params.status)
  query.set('page', String(params.page ?? 1))
  query.set('page_size', String(params.page_size ?? 50))
  return apiFetch<AdminOrderListResponse>(`/admin/orders?${query.toString()}`)
}

export function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  return apiFetch<Order>(`/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

/**
 * Logical upload destination. The backend maps this to the real Azure container
 * (AZURE_STORAGE_PRODUCT_CONTAINER / AZURE_STORAGE_PROMO_CONTAINER), so the frontend
 * never needs to know the actual container names.
 */
export type MediaTarget = 'product' | 'promo'

export function createProduct(payload: ProductInput) {
  return apiFetch<Product>('/admin/products', {
    method: 'POST',
    body: payload,
  })
}

export function updateProduct(id: string, payload: Partial<ProductInput>) {
  return apiFetch<Product>(`/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export function deleteProduct(id: string) {
  return apiFetch<void>(`/admin/products/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Upload an image or video to Azure Blob Storage (via the backend) and get its
 * public URL back. `target` picks the destination: 'product' or 'promo'.
 */
export function uploadMedia(file: File, target: MediaTarget) {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<{ url: string }>(
    `/admin/media/upload?target=${encodeURIComponent(target)}`,
    formData
  )
}
