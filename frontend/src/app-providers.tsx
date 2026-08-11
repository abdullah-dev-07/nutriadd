import { type ReactNode } from 'react'

import { AuthProvider } from '@/lib/auth/auth-context'
import { CartProvider } from '@/lib/cart/cart-context'
import { ThemeProvider } from '@/lib/theme/theme-context'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
