export type Category = {
  id: string
  name: string
  slug: string
}

export type Availability = 'in_stock' | 'out_of_stock'

export type Product = {
  id: string
  sku: string
  slug: string
  name: string
  category: Category
  short_description: string
  description: string
  price: number
  currency: string
  availability: Availability
  image_key: string
  tags: string[]
  benefits: string[]
  created_at: string
  updated_at: string
}

export type ProductListParams = {
  search?: string
  category?: string
  tag?: string
  page?: number
  page_size?: number
}

export type ProductListResponse = {
  items: Product[]
  total: number
  page: number
  page_size: number
}
