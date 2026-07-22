import { apiFetch, apiUpload } from '@/lib/api/client'
import { type Product, type ProductInput } from '@/types/product'

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
