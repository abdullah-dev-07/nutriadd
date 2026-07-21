import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

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
  validateForgotPasswordForm,
  type ForgotPasswordFormErrors,
  type ForgotPasswordFormValues,
} from '@/lib/validation/auth'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const initialValues: ForgotPasswordFormValues = { email: '' }

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()

  const [values, setValues] = useState<ForgotPasswordFormValues>(initialValues)
  const [errors, setErrors] = useState<ForgotPasswordFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrorMessage(null)
    setErrors((previous) => {
      if (!previous[name as keyof ForgotPasswordFormValues]) return previous
      const next = { ...previous }
      delete next[name as keyof ForgotPasswordFormValues]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateForgotPasswordForm(values)
    if (hasErrors(validation)) {
      setErrors(validation)
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      await forgotPassword(values.email.trim())
      // Always show a generic success message, regardless of whether the
      // email exists — the API deliberately avoids revealing account
      // enumeration information.
      setStatus('success')
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
      <Seo title="Forgot Password" path="/forgot-password" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Forgot Password' }]}
        title="Reset Your Password"
        description="Enter your email and we'll send you instructions to reset your password."
      />

      <Section>
        <Container>
          <div className="border-border mx-auto max-w-md rounded-3xl border bg-white p-10 shadow-sm">
            {status === 'success' ? (
              <div className="text-center">
                <span className="bg-accent text-brand-green-dark mx-auto flex size-14 items-center justify-center rounded-2xl">
                  <CheckCircle2 className="size-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-bold">Check your email</h2>
                <p className="text-slate mt-3 text-sm leading-relaxed">
                  If an account exists for {values.email.trim()}, we&apos;ve
                  sent instructions to reset your password.
                </p>
                <Link
                  to="/login"
                  className="text-brand-blue hover:text-brand-blue-dark mt-6 inline-block text-sm font-semibold transition-colors"
                >
                  Back to Log In
                </Link>
              </div>
            ) : (
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
                      Sending…
                    </>
                  ) : (
                    'Send Reset Instructions'
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

                <p className="text-slate text-center text-sm">
                  <Link
                    to="/login"
                    className="text-brand-blue hover:text-brand-blue-dark font-semibold transition-colors"
                  >
                    Back to Log In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
