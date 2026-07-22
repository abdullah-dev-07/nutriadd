export type ContactFormValues = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContactForm(
  values: ContactFormValues
): ContactFormErrors {
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

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0
}
