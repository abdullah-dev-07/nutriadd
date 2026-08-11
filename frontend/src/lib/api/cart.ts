import { apiFetch } from '@/lib/api/client'
import { type Availability } from '@/types/product'

export type CartLine = {
  product_id: string
  slug: string
  name: string
  image_url: string
  unit_price: number
  currency: string
  availability: Availability
  quantity: number
  line_total: number
}

export type ServerCart = {
  items: CartLine[]
  subtotal: number
  total_quantity: number
}

export function getCart() {
  return apiFetch<ServerCart>('/cart')
}

export function addCartItem(productId: string, quantity = 1) {
  return apiFetch<ServerCart>('/cart/items', {
    method: 'POST',
    body: { product_id: productId, quantity },
  })
}

export function updateCartItem(productId: string, quantity: number) {
  return apiFetch<ServerCart>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: 'PUT',
    body: { quantity },
  })
}

export function removeCartItem(productId: string) {
  return apiFetch<ServerCart>(`/cart/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  })
}

export function clearCart() {
  return apiFetch<ServerCart>('/cart', { method: 'DELETE' })
}
