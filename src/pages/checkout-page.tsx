import { Loader2, TriangleAlert } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createOrder } from '@/lib/api/orders'
import { ApiError } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/auth-context'
import { useCart } from '@/lib/cart/cart-context'
import { formatCurrency } from '@/lib/format'
import {
  hasErrors,
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormValues,
} from '@/lib/validation/checkout'

type Status = 'idle' | 'submitting' | 'error'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, totalQuantity, clear } = useCart()
  const navigate = useNavigate()

  const [values, setValues] = useState<CheckoutFormValues>({
    customerName: user?.full_name ?? '',
    customerEmail: user?.email ?? '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
  })
  const [errors, setErrors] = useState<CheckoutFormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => {
      if (!previous[name as keyof CheckoutFormValues]) return previous
      const next = { ...previous }
      delete next[name as keyof CheckoutFormValues]
      return next
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateCheckoutForm(values)
    if (hasErrors(validation)) {
      setErrors(validation)
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        customer_name: values.customerName.trim(),
        customer_email: values.customerEmail.trim(),
        customer_phone: values.customerPhone.trim(),
        shipping_address: values.shippingAddress.trim(),
        notes: values.notes.trim() || undefined,
      })
      clear()
      navigate('/account/orders', { state: { justPlacedOrderId: order.id } })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError
          ? error.detail
          : 'Something went wrong while placing your order. Please try again.'
      )
    }
  }

  const fields: {
    name: keyof CheckoutFormValues
    label: string
    type: string
    autoComplete?: string
    multiline?: boolean
  }[] = [
    {
      name: 'customerName',
      label: 'Full Name',
      type: 'text',
      autoComplete: 'name',
    },
    {
      name: 'customerEmail',
      label: 'Email Address',
      type: 'email',
      autoComplete: 'email',
    },
    {
      name: 'customerPhone',
      label: 'Phone Number',
      type: 'tel',
      autoComplete: 'tel',
    },
  ]

  return (
    <>
      <Seo title="Checkout" path="/checkout" noindex />
      <PageHero
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Cart', to: '/cart' },
          { label: 'Checkout' },
        ]}
        title="Checkout"
        description="Complete your shipping details to place your order."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="border-border rounded-2xl border bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="text-lg font-semibold">Shipping Details</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="shippingAddress">
                  Shipping Address
                  <span className="text-destructive"> *</span>
                </Label>
                <Textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={values.shippingAddress}
                  onChange={handleChange}
                  aria-invalid={errors.shippingAddress ? true : undefined}
                  aria-describedby={
                    errors.shippingAddress ? 'shippingAddress-error' : undefined
                  }
                />
                {errors.shippingAddress && (
                  <p id="shippingAddress-error" className="text-destructive text-sm">
                    {errors.shippingAddress}
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={values.notes}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="mt-8 w-full"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              {status === 'error' && (
                <div
                  className="bg-destructive/10 text-destructive mt-4 rounded-lg px-4 py-3 text-sm font-medium"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2">
                    <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
                    <span>Couldn&apos;t place your order.</span>
                  </div>
                  {errorMessage && (
                    <p className="text-destructive/90 mt-2 text-sm">
                      {errorMessage}
                    </p>
                  )}
                </div>
              )}
            </form>

            <div className="border-border h-fit rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate">
                      {item.name}{' '}
                      <span className="text-slate/70">× {item.quantity}</span>
                    </span>
                    <span className="text-charcoal font-medium">
                      {formatCurrency(item.price * item.quantity, item.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-border mt-4 flex items-center justify-between border-t pt-4 text-sm">
                <span className="text-slate">Items ({totalQuantity})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-charcoal text-xl font-bold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <Link
                to="/cart"
                className="text-brand-blue hover:text-brand-blue-dark mt-6 inline-block text-sm font-medium transition-colors"
              >
                Edit cart
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
