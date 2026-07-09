import { Resend } from 'resend'

import {
  hasErrors,
  validateContactForm,
  type ContactFormValues,
} from '../src/lib/validation/contact'

type ContactPayload = Partial<ContactFormValues> & { company?: string }

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405)
  }

  let payload: ContactPayload
  try {
    payload = (await request.json()) as ContactPayload
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400)
  }

  // Honeypot: silently accept bot submissions without sending anything.
  if (payload.company) {
    return jsonResponse({ ok: true }, 200)
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
    return jsonResponse({ error: 'Validation failed.', errors }, 400)
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    return jsonResponse({ error: 'Email service is not configured.' }, 500)
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
      return jsonResponse({ error: 'Failed to send message.' }, 502)
    }

    return jsonResponse({ ok: true }, 200)
  } catch {
    return jsonResponse({ error: 'Failed to send message.' }, 500)
  }
}
