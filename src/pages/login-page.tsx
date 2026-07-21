import { Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/auth-context'
import {
  hasErrors,
  validateLoginForm,
  type LoginFormErrors,
  type LoginFormValues,
} from '@/lib/validation/auth'

type Status = 'idle' | 'submitting' | 'error'

const initialValues: LoginFormValues = { email: '', password: '' }

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as Location & {
    state?: { from?: Location }
  }

  const [values, setValues] = useState<LoginFormValues>(initialValues)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  // "Remember me" is UX-only for now — the backend doesn't yet distinguish
  // session vs. persistent refresh tokens, so we always persist the refresh
  // token regardless of this checkbox.
  const [rememberMe, setRememberMe] = useState(true)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrorMessage(null)
    setErrors((previous) => {
      if (!previous[name as keyof LoginFormValues]) return previous
      const next = { ...previous }
      delete next[name as keyof LoginFormValues]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateLoginForm(values)
    if (hasErrors(validation)) {
      setErrors(validation)
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      await login(values.email.trim(), values.password)
      navigate(location.state?.from?.pathname ?? '/account', { replace: true })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError
          ? error.detail
          : 'Something went wrong. Please try again.'
      )
    }
  }

  return (
    <>
      <Seo title="Log In" path="/login" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Log In' }]}
        title="Welcome Back"
        description="Log in to manage your orders and account details."
      />

      <Section>
        <Container>
          <div className="border-border mx-auto max-w-md rounded-3xl border bg-white p-10 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-destructive text-sm">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                  <span className="text-destructive"> *</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    className="pr-11"
                    aria-invalid={errors.password ? true : undefined}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-slate hover:text-brand-blue focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-destructive text-sm">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-slate flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="border-input accent-brand-blue size-4 rounded"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-brand-blue hover:text-brand-blue-dark font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Logging in…
                  </>
                ) : (
                  'Log In'
                )}
              </Button>

              {status === 'error' && (
                <div
                  className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
                  aria-live="polite"
                >
                  <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </form>

            <p className="text-slate mt-6 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-brand-blue hover:text-brand-blue-dark font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
