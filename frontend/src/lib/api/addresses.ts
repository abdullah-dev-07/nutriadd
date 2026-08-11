import { apiFetch } from '@/lib/api/client'

export type Address = {
  id: string
  label: string | null
  full_name: string
  phone: string
  address: string
  city: string
  is_default: boolean
  created_at: string
}

export type AddressInput = {
  label?: string | null
  full_name: string
  phone: string
  address: string
  city: string
  is_default?: boolean
}

export function getAddresses() {
  return apiFetch<Address[]>('/addresses')
}

export function createAddress(payload: AddressInput) {
  return apiFetch<Address>('/addresses', { method: 'POST', body: payload })
}

export function updateAddress(id: string, payload: Partial<AddressInput>) {
  return apiFetch<Address>(`/addresses/${id}`, { method: 'PUT', body: payload })
}

export function setDefaultAddress(id: string) {
  return apiFetch<Address>(`/addresses/${id}/default`, { method: 'POST' })
}

export function deleteAddress(id: string) {
  return apiFetch<void>(`/addresses/${id}`, { method: 'DELETE' })
}
