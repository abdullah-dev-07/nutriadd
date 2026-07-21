export type UserRole = 'customer' | 'admin' | string

export type UserRead = {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type LoginResponse = AuthTokens & {
  user: UserRead
}
