import { apiFetch } from '@/lib/api/client'
import { type CreateOrderPayload, type Order } from '@/types/order'

export function createOrder(payload: CreateOrderPayload) {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: payload,
  })
}

export function getMyOrders() {
  return apiFetch<Order[]>('/orders')
}

export function getOrderById(id: string) {
  return apiFetch<Order>(`/orders/${encodeURIComponent(id)}`)
}
