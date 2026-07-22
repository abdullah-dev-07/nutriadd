export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | string

export type OrderItem = {
  id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
}

export type Order = {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  notes: string | null
  status: OrderStatus
  subtotal: number
  total: number
  created_at: string
  items: OrderItem[]
}

export type CreateOrderItemPayload = {
  product_id: string
  quantity: number
}

export type CreateOrderPayload = {
  items: CreateOrderItemPayload[]
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  notes?: string
}
