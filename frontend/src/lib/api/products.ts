import { apiFetch } from '@/lib/api/client'
import {
  type Category,
  type Product,
  type ProductListParams,
  type ProductListResponse,
} from '@/types/product'

export function getProducts(params: ProductListParams = {}) {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.tag) query.set('tag', params.tag)
  query.set('page', String(params.page ?? 1))
  query.set('page_size', String(params.page_size ?? 12))

  return apiFetch<ProductListResponse>(`/products?${query.toString()}`)
}

export function getProductBySlug(slug: string) {
  return apiFetch<Product>(`/products/${encodeURIComponent(slug)}`)
}

export function getCategories() {
  return apiFetch<Category[]>('/categories')
}
