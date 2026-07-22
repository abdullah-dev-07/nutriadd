const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// In-memory access token, set/cleared by auth-context.tsx. Kept out of
// localStorage so a successful XSS can't trivially read a long-lived token.
let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

// Injected by auth-context.tsx so this module can trigger a refresh-then-retry
// flow on a 401 without importing the auth context (which would create a
// circular dependency between the api client and the auth provider).
type UnauthorizedHandler = () => Promise<string | null>
let onUnauthorized: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuthRetry?: boolean
}

async function parseBody(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, headers, skipAuthRetry, ...rest } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  }

  const token = getAccessToken()
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && !skipAuthRetry && onUnauthorized) {
    const newToken = await onUnauthorized()
    if (newToken) {
      return apiFetch<T>(path, { ...options, skipAuthRetry: true })
    }
  }

  if (!response.ok) {
    const parsed = await parseBody(response)
    const detail =
      parsed && typeof parsed === 'object' && 'detail' in parsed
        ? String((parsed as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await parseBody(response)) as T
}
