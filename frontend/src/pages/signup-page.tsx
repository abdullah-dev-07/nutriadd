import { Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
  validateSignupForm,
  type SignupFormErrors,
  type SignupFormValues,
} from '@/lib/validation/auth'

type Status = 'idle' | 'submitting' | 'error'

const initialValues: SignupFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function SignupPage() {
  const { register, login } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<SignupFormValues>(initialValues)
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrorMessage(null)
    setErrors((previous) => {
      if (!previous[name as keyof SignupFormValues]) return previous
      const next = { ...previous }
      delete next[name as keyof SignupFormValues]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateSignupForm(values)
    if (hasErrors(validation)) {
      setErrors(validation)
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      await register(values.email.trim(), values.password, values.fullName.trim())
      // Auto-login after a successful registration for a seamless flow.
      await login(values.email.trim(), values.password)
      navigate('/account', { replace: true })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError
          ? error.detail
          : 'Something went wrong. Please try again.'
      )
    }
  }

  const fields: {
    name: keyof SignupFormValues
    label: string
    type: string
    autoComplete?: string
  }[] = [
    { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
    { name: 'email', label: 'Email Address', type: 'email', autoComplete: 'email' },
  ]

  return (
    <>
      <Seo title="Sign Up" path="/signup" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Sign Up' }]}
        title="Create Your Account"
        description="Sign up to track your orders and check out faster."
      />

      <Section>
        <Container>
          <div className="border-border mx-auto max-w-md rounded-3xl border bg-white p-10 shadow-sm">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {fields.map((field) => {
                const error = errors[field.name]
                const errorId = `${field.name}-error`
                return (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      <span className="text-destructive"> *</span>
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={values[field.name]}
                      onChange={handleChange}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                    />
                    {error && (
                      <p id={errorId} className="text-destructive text-sm">
                        {error}
                      </p>
                    )}
                  </div>
                )
              })}

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
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password
                  <span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={errors.confirmPassword ? true : undefined}
                  aria-describedby={
                    errors.confirmPassword ? 'confirmPassword-error' : undefined
                  }
                />
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    className="text-destructive text-sm"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
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
                    Creating account…
                  </>
                ) : (
                  'Create Account'
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
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-brand-blue hover:text-brand-blue-dark font-semibold transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
