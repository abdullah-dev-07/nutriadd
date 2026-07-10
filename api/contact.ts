import type { IncomingMessage, ServerResponse } from 'node:http'
import { Resend } from 'resend'

// NOTE: This validation is intentionally duplicated from
// src/lib/validation/contact.ts. Vercel bundles each /api function in
// isolation and does not include files from outside the api/ directory, so
// this serverless function must be fully self-contained. Keep the two in sync.
type ContactFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

type ContactPayload = Partial<ContactFormValues> & { company?: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const subject = values.subject.trim()
  const message = values.message.trim()

  if (!name) {
    errors.name = 'Please enter your name.'
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.'
  }

  if (!email) {
    errors.email = 'Please enter your email address.'
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (phone && phone.replace(/[^\d]/g, '').length < 7) {
    errors.phone = 'Please enter a valid phone number.'
  }

  if (!subject) {
    errors.subject = 'Please enter a subject.'
  }

  if (!message) {
    errors.message = 'Please enter a message.'
  } else if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.'
  }

  return errors
}

function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0
}

type ContactRequest = IncomingMessage & { body?: unknown }

type ContactResponse = ServerResponse

function jsonResponse(
  res: ContactResponse,
  body: unknown,
  status: number
): ContactResponse {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
  return res
}

function parsePayload(req: ContactRequest): ContactPayload {
  const body = req.body

  if (typeof body === 'string') {
    return JSON.parse(body) as ContactPayload
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8')) as ContactPayload
  }

  if (body && typeof body === 'object') {
    return body as ContactPayload
  }

  throw new Error('Invalid request body.')
}

export default async function handler(
  req: ContactRequest,
  res: ContactResponse
) {
  if (req.method !== 'POST') {
    return jsonResponse(res, { error: 'Method not allowed.' }, 405)
  }

  let payload: ContactPayload
  try {
    payload = parsePayload(req)
  } catch {
    return jsonResponse(res, { error: 'Invalid request body.' }, 400)
  }

  // Honeypot: silently accept bot submissions without sending anything.
  if (payload.company) {
    return jsonResponse(res, { ok: true }, 200)
  }

  const values: ContactFormValues = {
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
    phone: String(payload.phone ?? ''),
    subject: String(payload.subject ?? ''),
    message: String(payload.message ?? ''),
  }

  const errors = validateContactForm(values)
  if (hasErrors(errors)) {
    return jsonResponse(res, { error: 'Validation failed.', errors }, 400)
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    const missing = [
      !apiKey && 'RESEND_API_KEY',
      !to && 'CONTACT_TO_EMAIL',
      !from && 'CONTACT_FROM_EMAIL',
    ]
      .filter(Boolean)
      .join(', ')
    console.error(`Contact form misconfigured. Missing env vars: ${missing}`)
    return jsonResponse(
      res,
      { error: `Email service is not configured (missing: ${missing}).` },
      500
    )
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: values.email,
      subject: `New website enquiry: ${values.subject}`,
      text: [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone || '—'}`,
        `Subject: ${values.subject}`,
        '',
        values.message,
      ].join('\n'),
    })

    if (error) {
      console.error('Resend send error:', error)
      const detail = error.message ?? error.name ?? 'unknown error'
      return jsonResponse(
        res,
        { error: `Email could not be sent: ${detail}` },
        502
      )
    }

    return jsonResponse(res, { ok: true }, 200)
  } catch (exception) {
    console.error('Contact handler exception:', exception)
    return jsonResponse(res, { error: 'Failed to send message.' }, 500)
  }
}
