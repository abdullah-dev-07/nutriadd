export type CheckoutFormValues = {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  notes: string
}

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutFormValues, string>
>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateCheckoutForm(
  values: CheckoutFormValues
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}
  const customerName = values.customerName.trim()
  const customerEmail = values.customerEmail.trim()
  const customerPhone = values.customerPhone.trim()
  const shippingAddress = values.shippingAddress.trim()

  if (!customerName) {
    errors.customerName = 'Please enter your full name.'
  } else if (customerName.length < 2) {
    errors.customerName = 'Name must be at least 2 characters.'
  }

  if (!customerEmail) {
    errors.customerEmail = 'Please enter your email address.'
  } else if (!EMAIL_REGEX.test(customerEmail)) {
    errors.customerEmail = 'Please enter a valid email address.'
  }

  if (!customerPhone) {
    errors.customerPhone = 'Please enter a phone number.'
  } else if (customerPhone.replace(/[^\d]/g, '').length < 7) {
    errors.customerPhone = 'Please enter a valid phone number.'
  }

  if (!shippingAddress) {
    errors.shippingAddress = 'Please enter a shipping address.'
  } else if (shippingAddress.length < 10) {
    errors.shippingAddress = 'Please enter a complete shipping address.'
  }

  return errors
}

export function hasErrors(errors: CheckoutFormErrors): boolean {
  return Object.keys(errors).length > 0
}
