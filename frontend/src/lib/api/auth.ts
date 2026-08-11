import { apiFetch } from '@/lib/api/client'
import { type AuthTokens, type LoginResponse, type UserRead } from '@/types/user'

export function register(payload: {
  email: string
  password: string
  full_name: string
}) {
  return apiFetch<UserRead>('/auth/register', {
    method: 'POST',
    body: payload,
  })
}

export function login(payload: { email: string; password: string }) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    skipAuthRetry: true,
  })
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    skipAuthRetry: true,
  })
}

export function logout(refreshToken: string) {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: { refresh_token: refreshToken },
    skipAuthRetry: true,
  })
}

export function me() {
  return apiFetch<UserRead>('/auth/me')
}

export function updateProfile(fullName: string) {
  return apiFetch<UserRead>('/auth/me', {
    method: 'PATCH',
    body: { full_name: fullName },
  })
}

export function changePassword(payload: {
  current_password: string
  new_password: string
}) {
  return apiFetch<void>('/auth/change-password', {
    method: 'POST',
    body: payload,
  })
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
    skipAuthRetry: true,
  })
}

export function resetPassword(token: string, newPassword: string) {
  return apiFetch<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, new_password: newPassword },
    skipAuthRetry: true,
  })
}
