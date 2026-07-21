import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'

import * as authApi from '@/lib/api/auth'
import { setAccessToken, setUnauthorizedHandler } from '@/lib/api/client'
import { type UserRead } from '@/types/user'

const REFRESH_TOKEN_STORAGE_KEY = 'nutriadd_refresh_token'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

type AuthState = {
  user: UserRead | null
  status: AuthStatus
}

type AuthAction =
  | { type: 'LOADING' }
  | { type: 'AUTHENTICATED'; user: UserRead }
  | { type: 'UNAUTHENTICATED' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading' }
    case 'AUTHENTICATED':
      return { user: action.user, status: 'authenticated' }
    case 'UNAUTHENTICATED':
      return { user: null, status: 'unauthenticated' }
    default:
      return state
  }
}

type AuthContextValue = {
  user: UserRead | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    status: 'idle',
  })

  // Guards against overlapping refresh calls when several requests 401 at once.
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null)

  const applySession = useCallback(
    (accessToken: string, refreshToken: string, user: UserRead) => {
      setAccessToken(accessToken)
      window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
      dispatch({ type: 'AUTHENTICATED', user })
    },
    []
  )

  const clearSession = useCallback(() => {
    setAccessToken(null)
    window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    dispatch({ type: 'UNAUTHENTICATED' })
  }, [])

  const performRefresh = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = window.localStorage.getItem(
      REFRESH_TOKEN_STORAGE_KEY
    )
    if (!storedRefreshToken) {
      clearSession()
      return null
    }

    try {
      const tokens = await authApi.refresh(storedRefreshToken)
      setAccessToken(tokens.access_token)
      window.localStorage.setItem(
        REFRESH_TOKEN_STORAGE_KEY,
        tokens.refresh_token
      )
      return tokens.access_token
    } catch {
      clearSession()
      return null
    }
  }, [clearSession])

  const handleUnauthorized = useCallback(async () => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = performRefresh().finally(() => {
        refreshPromiseRef.current = null
      })
    }
    return refreshPromiseRef.current
  }, [performRefresh])

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized)
    return () => setUnauthorizedHandler(null)
  }, [handleUnauthorized])

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const storedRefreshToken = window.localStorage.getItem(
        REFRESH_TOKEN_STORAGE_KEY
      )
      if (!storedRefreshToken) {
        dispatch({ type: 'UNAUTHENTICATED' })
        return
      }

      dispatch({ type: 'LOADING' })
      const newAccessToken = await performRefresh()
      if (cancelled) return

      if (!newAccessToken) {
        dispatch({ type: 'UNAUTHENTICATED' })
        return
      }

      try {
        const user = await authApi.me()
        if (!cancelled) dispatch({ type: 'AUTHENTICATED', user })
      } catch {
        if (!cancelled) clearSession()
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password })
      applySession(response.access_token, response.refresh_token, response.user)
    },
    [applySession]
  )

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      await authApi.register({ email, password, full_name: fullName })
    },
    []
  )

  const logout = useCallback(async () => {
    const storedRefreshToken = window.localStorage.getItem(
      REFRESH_TOKEN_STORAGE_KEY
    )
    clearSession()
    if (storedRefreshToken) {
      try {
        await authApi.logout(storedRefreshToken)
      } catch {
        // Best-effort: the local session is already cleared regardless.
      }
    }
  }, [clearSession])

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      status: state.status,
      login,
      register,
      logout,
      forgotPassword,
    }),
    [state.user, state.status, login, register, logout, forgotPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
