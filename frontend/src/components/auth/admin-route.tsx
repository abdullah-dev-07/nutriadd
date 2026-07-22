import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { PageLoader } from '@/components/shared/page-loader'
import { useAuth } from '@/lib/auth/auth-context'

/**
 * Guards admin-only routes. Requires an authenticated user whose role is 'admin';
 * anyone else is redirected (unauthenticated -> /login, non-admin -> home). The
 * backend independently enforces the admin role on every /admin endpoint, so this
 * is a UX gate, not the security boundary.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <PageLoader />
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
