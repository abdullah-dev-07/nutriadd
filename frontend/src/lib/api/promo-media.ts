import { apiFetch } from '@/lib/api/client'

export type PromoMediaRead = {
  id: string
  media_type: 'image' | 'video'
  url: string
  poster_url: string | null
  alt: string
  caption: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type PromoMediaInput = {
  media_type: 'image' | 'video'
  url: string
  poster_url?: string | null
  alt: string
  caption?: string | null
  sort_order?: number
  is_active?: boolean
}

/** Public: active showcase items for the Home page carousel. */
export function getPromoMedia() {
  return apiFetch<PromoMediaRead[]>('/promo-media')
}

/** Admin: all items, including inactive. */
export function getAllPromoMedia() {
  return apiFetch<PromoMediaRead[]>('/admin/promo-media')
}

export function createPromoMedia(payload: PromoMediaInput) {
  return apiFetch<PromoMediaRead>('/admin/promo-media', {
    method: 'POST',
    body: payload,
  })
}

export function deletePromoMedia(id: string) {
  return apiFetch<void>(`/admin/promo-media/${id}`, { method: 'DELETE' })
}
