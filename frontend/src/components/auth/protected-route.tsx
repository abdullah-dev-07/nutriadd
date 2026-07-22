import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { PageLoader } from '@/components/shared/page-loader'
import { useAuth } from '@/lib/auth/auth-context'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <PageLoader />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
