import { CheckCircle2, Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setStatus('submitting')
    try {
      await resetPassword(token, password)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError
          ? err.detail
          : 'Something went wrong. Please request a new reset link.'
      )
    }
  }

  return (
    <>
      <Seo title="Reset Password" path="/reset-password" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Reset Password' }]}
        title="Choose a New Password"
        description="Enter a new password for your NutriAdd account."
      />

      <Section>
        <Container>
          <div className="border-border bg-card mx-auto max-w-md rounded-3xl border p-10 shadow-sm">
            {!token ? (
              <div className="text-center">
                <span className="bg-destructive/10 text-destructive mx-auto flex size-14 items-center justify-center rounded-2xl">
                  <TriangleAlert className="size-7" aria-hidden="true" />
                </span>
                <p className="text-slate mt-5">
                  This reset link is missing or invalid.
                </p>
                <Button asChild variant="brand" className="mt-6">
                  <Link to="/forgot-password">Request a new link</Link>
                </Button>
              </div>
            ) : status === 'success' ? (
              <div className="text-center">
                <span className="bg-accent text-brand-green-dark mx-auto flex size-14 items-center justify-center rounded-2xl">
                  <CheckCircle2 className="size-7" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-xl font-semibold">Password updated</h2>
                <p className="text-slate mt-2">
                  Your password has been reset. You can now log in with your new
                  password.
                </p>
                <Button asChild variant="brand" className="mt-6">
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    New Password<span className="text-destructive"> *</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-slate hover:text-brand-blue absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Confirm Password<span className="text-destructive"> *</span>
                  </Label>
                  <Input
                    id="confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
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
                      Updating…
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                {error && (
                  <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
                    <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}
