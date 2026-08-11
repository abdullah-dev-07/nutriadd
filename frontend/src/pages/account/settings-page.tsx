import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  TriangleAlert,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/auth-context'

type Feedback = { type: 'success' | 'error'; message: string } | null

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Seo title="Account Settings" path="/account/settings" noindex />
      <div>
        <h2 className="text-xl font-bold">Account Settings</h2>
        <p className="text-slate mt-1 text-sm">
          Update your display name and password.
        </p>
      </div>
      <ProfileNameForm />
      <ChangePasswordForm />
    </div>
  )
}

function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  if (feedback.type === 'success') {
    return (
      <div className="bg-accent text-brand-green-dark flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        <span>{feedback.message}</span>
      </div>
    )
  }
  return (
    <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
      <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
      <span>{feedback.message}</span>
    </div>
  )
}

function ProfileNameForm() {
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const unchanged = fullName.trim() === (user?.full_name ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    const trimmed = fullName.trim()
    if (trimmed.length < 1) {
      setFeedback({ type: 'error', message: 'Please enter your name.' })
      return
    }

    setSubmitting(true)
    try {
      await updateProfile(trimmed)
      setFullName(trimmed)
      setFeedback({ type: 'success', message: 'Your name has been updated.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof ApiError
            ? err.detail
            : 'Something went wrong. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-border rounded-2xl border bg-card p-6 shadow-sm md:p-8"
    >
      <h3 className="text-lg font-semibold">Display Name</h3>
      <p className="text-slate mt-1 text-sm">
        This is the name shown on your account and orders.
      </p>

      <div className="mt-5 max-w-sm space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input
          id="full_name"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="mt-6">
        <FeedbackBanner feedback={feedback} />
      </div>

      <Button
        type="submit"
        variant="brand"
        className="mt-6"
        disabled={submitting || unchanged}
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : (
          'Save Name'
        )}
      </Button>
    </form>
  )
}

function ChangePasswordForm() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    if (!current) {
      setFeedback({ type: 'error', message: 'Enter your current password.' })
      return
    }
    if (next.length < 8) {
      setFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters.',
      })
      return
    }
    if (next !== confirm) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setSubmitting(true)
    try {
      await changePassword({ current_password: current, new_password: next })
      setCurrent('')
      setNext('')
      setConfirm('')
      setFeedback({
        type: 'success',
        message: 'Your password has been changed.',
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err instanceof ApiError
            ? err.detail
            : 'Something went wrong. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-border rounded-2xl border bg-card p-6 shadow-sm md:p-8"
    >
      <h3 className="text-lg font-semibold">Change Password</h3>
      <p className="text-slate mt-1 text-sm">
        Choose a strong password you don’t use elsewhere.
      </p>

      <div className="mt-5 max-w-sm space-y-5">
        <div className="space-y-2">
          <Label htmlFor="current_password">
            Current Password<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="current_password"
            type={showPasswords ? 'text' : 'password'}
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password">
            New Password<span className="text-destructive"> *</span>
          </Label>
          <div className="relative">
            <Input
              id="new_password"
              type={showPasswords ? 'text' : 'password'}
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="text-slate hover:text-brand-blue absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1"
              aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
            >
              {showPasswords ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirm New Password<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="confirm_password"
            type={showPasswords ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 max-w-sm">
        <FeedbackBanner feedback={feedback} />
      </div>

      <Button
        type="submit"
        variant="brand"
        className="mt-6"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            Updating…
          </>
        ) : (
          'Change Password'
        )}
      </Button>
    </form>
  )
}
