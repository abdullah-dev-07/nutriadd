import {
  Loader2,
  MapPinned,
  Pencil,
  Plus,
  Star,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type Address,
  type AddressInput,
} from '@/lib/api/addresses'
import { ApiError } from '@/lib/api/client'

type FormValues = {
  label: string
  full_name: string
  phone: string
  address: string
  city: string
}

const EMPTY_FORM: FormValues = {
  label: '',
  full_name: '',
  phone: '',
  address: '',
  city: '',
}

function toFormValues(address: Address): FormValues {
  return {
    label: address.label ?? '',
    full_name: address.full_name,
    phone: address.phone,
    address: address.address,
    city: address.city,
  }
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // null = form closed; '' = adding new; an id = editing that address.
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAddresses()
      .then((data) => {
        if (!cancelled) setAddresses(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError('We couldn’t load your saved addresses.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  function openAddForm() {
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(address: Address) {
    setEditingId(address.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  function handleSaved(saved: Address) {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === saved.id)
      const next = exists
        ? prev.map((a) => (a.id === saved.id ? saved : a))
        : [...prev, saved]
      // If the saved one is default, clear default on all others locally.
      const reconciled = saved.is_default
        ? next.map((a) => (a.id === saved.id ? a : { ...a, is_default: false }))
        : next
      return sortAddresses(reconciled)
    })
    closeForm()
  }

  async function handleSetDefault(id: string) {
    setBusyId(id)
    try {
      const updated = await setDefaultAddress(id)
      setAddresses((prev) =>
        sortAddresses(
          prev.map((a) =>
            a.id === updated.id
              ? updated
              : { ...a, is_default: false }
          )
        )
      )
    } catch {
      setLoadError('We couldn’t update your default address. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id)
    try {
      await deleteAddress(id)
      // Re-fetch so a promoted default is reflected accurately.
      const fresh = await getAddresses()
      setAddresses(fresh)
      setPendingDeleteId(null)
    } catch {
      setLoadError('We couldn’t remove that address. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  const editingAddress =
    editingId != null ? addresses.find((a) => a.id === editingId) : undefined

  return (
    <div className="space-y-6">
      <Seo title="Saved Addresses" path="/account/addresses" noindex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Saved Addresses</h2>
          <p className="text-slate mt-1 text-sm">
            Save shipping addresses to check out faster.
          </p>
        </div>
        {!showForm && (
          <Button variant="brand" onClick={openAddForm}>
            <Plus aria-hidden="true" />
            Add Address
          </Button>
        )}
      </div>

      {loadError && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
          <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}

      {showForm && (
        <AddressForm
          key={editingId ?? 'new'}
          initial={editingAddress ? toFormValues(editingAddress) : EMPTY_FORM}
          editingId={editingId}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <div className="border-border text-slate flex items-center justify-center gap-2 rounded-2xl border bg-card p-10 text-sm">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading addresses…
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="border-border flex flex-col items-center rounded-3xl border bg-card p-10 text-center shadow-sm">
          <span className="bg-gradient-brand flex size-14 items-center justify-center rounded-2xl text-white">
            <MapPinned className="size-7" aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-lg font-semibold">No saved addresses yet</h3>
          <p className="text-slate mt-2 max-w-sm text-sm">
            Add an address now and it’ll be ready to use next time you check out.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="border-border flex flex-col rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">
                      {address.label?.trim() || address.full_name}
                    </p>
                    {address.is_default && (
                      <span className="bg-accent text-brand-green-dark inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                        <Star className="size-3" aria-hidden="true" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate mt-2 text-sm">{address.full_name}</p>
                  <p className="text-slate text-sm">{address.address}</p>
                  <p className="text-slate text-sm">{address.city}</p>
                  <p className="text-slate mt-1 text-sm">{address.phone}</p>
                </div>
              </div>

              <div className="border-border mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    disabled={busyId === address.id}
                  >
                    {busyId === address.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Star aria-hidden="true" />
                    )}
                    Set default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditForm(address)}
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
                {pendingDeleteId === address.id ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-destructive text-white shadow-sm hover:bg-destructive/90"
                      onClick={() => handleDelete(address.id)}
                      disabled={busyId === address.id}
                    >
                      {busyId === address.id ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 aria-hidden="true" />
                      )}
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteId(null)}
                      disabled={busyId === address.id}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setPendingDeleteId(address.id)}
                  >
                    <Trash2 aria-hidden="true" />
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function sortAddresses(list: Address[]): Address[] {
  return [...list].sort((a, b) => {
    if (a.is_default !== b.is_default) return a.is_default ? -1 : 1
    return b.created_at.localeCompare(a.created_at)
  })
}

type AddressFormProps = {
  initial: FormValues
  editingId: string | null
  onSaved: (address: Address) => void
  onCancel: () => void
}

function AddressForm({ initial, editingId, onSaved, onCancel }: AddressFormProps) {
  const [values, setValues] = useState<FormValues>(initial)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(name: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const trimmed: AddressInput = {
      label: values.label.trim() || null,
      full_name: values.full_name.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
    }

    if (!trimmed.full_name || !trimmed.phone || !trimmed.city) {
      setError('Please fill in the name, phone, and city.')
      return
    }
    if (trimmed.address.length < 5) {
      setError('Please enter a complete street address.')
      return
    }

    setSubmitting(true)
    try {
      const saved = editingId
        ? await updateAddress(editingId, trimmed)
        : await createAddress(trimmed)
      onSaved(saved)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : 'Something went wrong while saving. Please try again.'
      )
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-border rounded-2xl border bg-card p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold">
        {editingId ? 'Edit Address' : 'Add a New Address'}
      </h3>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">Label (optional)</Label>
          <Input
            id="label"
            value={values.label}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Home, Office…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">
            Full Name<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="full_name"
            autoComplete="name"
            value={values.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">
            City<span className="text-destructive"> *</span>
          </Label>
          <Input
            id="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="address">
          Street Address<span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="address"
          autoComplete="street-address"
          value={values.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium">
          <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" variant="brand" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : editingId ? (
            'Save Changes'
          ) : (
            'Save Address'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
