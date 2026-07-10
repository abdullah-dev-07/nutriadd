import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  hasErrors,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormValues,
} from '@/lib/validation/contact'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const initialValues: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const textFields: {
  name: keyof ContactFormValues
  label: string
  type: string
  autoComplete?: string
  required?: boolean
}[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    autoComplete: 'email',
    required: true,
  },
  { name: 'phone', label: 'Phone Number', type: 'tel', autoComplete: 'tel' },
  { name: 'subject', label: 'Subject', type: 'text', required: true },
]

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [honeypot, setHoneypot] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrorMessage(null)
    setErrors((previous) => {
      if (!previous[name as keyof ContactFormValues]) return previous
      const next = { ...previous }
      delete next[name as keyof ContactFormValues]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (honeypot) return

    const validation = validateContactForm(values)
    if (hasErrors(validation)) {
      setErrors(validation)
      setStatus('idle')
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, company: honeypot }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof result === 'object' && result !== null && 'error' in result
            ? (result as { error: string }).error
            : 'Request failed'
        )
      }

      setValues(initialValues)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again or email us directly.'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {textFields.map((field) => {
          const error = errors[field.name]
          const errorId = `${field.name}-error`
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message
          <span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          value={values.message}
          onChange={handleChange}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" className="text-destructive text-sm">
            {errors.message}
          </p>
        )}
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company (leave this field empty)</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
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
            Sending…
          </>
        ) : (
          'Send Message'
        )}
      </Button>

      <div aria-live="polite">
        {status === 'success' && (
          <p className="bg-accent text-brand-green-dark flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            Thank you! Your message has been sent. We&apos;ll be in touch soon.
          </p>
        )}
        {status === 'error' && (
          <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm font-medium">
            <div className="flex items-center gap-2">
              <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
              <span>
                Something went wrong. Please try again or email us directly.
              </span>
            </div>
            {errorMessage ? (
              <p className="text-destructive/90 mt-2 text-sm">{errorMessage}</p>
            ) : null}
          </div>
        )}
      </div>
    </form>
  )
}
