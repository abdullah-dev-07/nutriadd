import { type ReactNode } from 'react'

import { CartProvider } from '@/lib/cart/cart-context'
import { AuthProvider } from '@/lib/auth/auth-context'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
