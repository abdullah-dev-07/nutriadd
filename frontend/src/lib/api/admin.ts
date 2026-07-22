import { apiFetch, apiUpload } from '@/lib/api/client'
import { type Product, type ProductInput } from '@/types/product'

/** Container names must match the backend's AZURE_STORAGE_*_CONTAINER settings. */
export type MediaContainer = 'product-images' | 'promo-media'

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
 * public URL back. `container` picks the destination: product-images or promo-media.
 */
export function uploadMedia(file: File, container: MediaContainer) {
  const formData = new FormData()
  formData.append('file', file)
  return apiUpload<{ url: string }>(
    `/admin/media/upload?container=${encodeURIComponent(container)}`,
    formData
  )
}
