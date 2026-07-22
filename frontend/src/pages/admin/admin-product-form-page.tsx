import { Loader2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { MediaUpload } from '@/components/admin/media-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/lib/api/admin'
import { ApiError } from '@/lib/api/client'
import { getCategories, getProducts } from '@/lib/api/products'
import { type Category, type ProductInput } from '@/types/product'

const emptyForm: ProductInput = {
  sku: '',
  slug: '',
  name: '',
  category_id: '',
  short_description: '',
  description: '',
  price: '',
  currency: 'PKR',
  availability: 'in_stock',
  image_url: '',
  promo_image_url: null,
  tags: [],
  benefits: [],
  features: [],
  ingredients: null,
  usage_instructions: null,
  warnings: null,
}

const linesToArray = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const arrayToLines = (value: string[] | null) => (value ?? []).join('\n')

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoadStatus('loading')
    setLoadError(null)
    try {
      const [cats, productList] = await Promise.all([
        getCategories(),
        isEdit ? getProducts({ page_size: 100 }) : Promise.resolve(null),
      ])
      setCategories(cats)

      if (isEdit) {
        const product = productList?.items.find((p) => p.id === id)
        if (!product) {
          setLoadStatus('error')
          setLoadError('Product not found.')
          return
        }
        setForm({
          sku: product.sku,
          slug: product.slug,
          name: product.name,
          category_id: product.category.id,
          short_description: product.short_description,
          description: product.description,
          price: String(product.price),
          currency: product.currency,
          availability: product.availability,
          image_url: product.image_url,
          promo_image_url: product.promo_image_url,
          tags: product.tags,
          benefits: product.benefits,
          features: product.features,
          ingredients: product.ingredients,
          usage_instructions: product.usage_instructions,
          warnings: product.warnings,
        })
      } else {
        setForm((prev) => ({ ...prev, category_id: cats[0]?.id ?? '' }))
      }
      setLoadStatus('ready')
    } catch (err) {
      setLoadStatus('error')
      setLoadError(err instanceof ApiError ? err.detail : 'Failed to load form.')
    }
  }, [id, isEdit])

  useEffect(() => {
    load()
  }, [load])

  function setField<K extends keyof ProductInput>(
    key: K,
    value: ProductInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSubmitError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    // Normalise nullable fields: empty -> null.
    const payload: ProductInput = {
      ...form,
      promo_image_url: form.promo_image_url || null,
      ingredients: form.ingredients && form.ingredients.length ? form.ingredients : null,
      usage_instructions: form.usage_instructions?.trim()
        ? form.usage_instructions.trim()
        : null,
      warnings: form.warnings?.trim() ? form.warnings.trim() : null,
    }

    try {
      if (isEdit && id) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/admin')
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.detail : 'Failed to save product.'
      )
      setSubmitting(false)
    }
  }

  if (loadStatus === 'loading') {
    return (
      <div className="text-slate flex items-center gap-2 py-12">
        <Loader2 className="animate-spin" />
        Loading…
      </div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
        <TriangleAlert className="size-5 shrink-0" />
        <span>{loadError}</span>
        <Button variant="outline" size="sm" onClick={load} className="ml-auto">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-charcoal text-xl font-semibold">
        {isEdit ? 'Edit product' : 'New product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
            />
          </Field>
          <Field label="Slug (URL)" required>
            <Input
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              placeholder="magtein"
              required
            />
          </Field>
          <Field label="SKU" required>
            <Input
              value={form.sku}
              onChange={(e) => setField('sku', e.target.value)}
              placeholder="NA-MAG-30"
              required
            />
          </Field>
          <Field label="Category" required>
            <select
              value={form.category_id}
              onChange={(e) => setField('category_id', e.target.value)}
              required
              className="border-input text-charcoal focus-visible:border-brand-blue focus-visible:ring-ring/30 h-10 w-full rounded-lg border bg-white px-3.5 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price" required>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              required
            />
          </Field>
          <Field label="Currency" required>
            <Input
              value={form.currency}
              onChange={(e) => setField('currency', e.target.value)}
              required
            />
          </Field>
          <Field label="Availability" required>
            <select
              value={form.availability}
              onChange={(e) =>
                setField(
                  'availability',
                  e.target.value as ProductInput['availability']
                )
              }
              className="border-input text-charcoal focus-visible:border-brand-blue focus-visible:ring-ring/30 h-10 w-full rounded-lg border bg-white px-3.5 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </Field>
        </div>

        <Field label="Short description" required>
          <Input
            value={form.short_description}
            onChange={(e) => setField('short_description', e.target.value)}
            required
          />
        </Field>

        <Field label="Description" required>
          <Textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            required
          />
        </Field>

        {/* Product image */}
        <Field label="Product image URL" required>
          <div className="space-y-2">
            <Input
              value={form.image_url}
              onChange={(e) => setField('image_url', e.target.value)}
              placeholder="https://<account>.blob.core.windows.net/product-images/…"
              required
            />
            <MediaUpload
              target="product"
              accept="image/*"
              label="Upload product image"
              onUploaded={(url) => setField('image_url', url)}
            />
            {form.image_url && /^https?:\/\//.test(form.image_url) && (
              <img
                src={form.image_url}
                alt="Product preview"
                className="bg-mist size-24 rounded-md object-contain p-1"
              />
            )}
          </div>
        </Field>

        {/* Promo image / video */}
        <Field label="Promotional image / video URL">
          <div className="space-y-2">
            <Input
              value={form.promo_image_url ?? ''}
              onChange={(e) => setField('promo_image_url', e.target.value)}
              placeholder="https://<account>.blob.core.windows.net/promo-media/…"
            />
            <MediaUpload
              target="promo"
              accept="image/*,video/mp4"
              label="Upload promo image or video"
              onUploaded={(url) => setField('promo_image_url', url)}
            />
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tags (one per line)">
            <Textarea
              value={arrayToLines(form.tags)}
              onChange={(e) => setField('tags', linesToArray(e.target.value))}
            />
          </Field>
          <Field label="Benefits (one per line)">
            <Textarea
              value={arrayToLines(form.benefits)}
              onChange={(e) =>
                setField('benefits', linesToArray(e.target.value))
              }
            />
          </Field>
          <Field label="Features (one per line)">
            <Textarea
              value={arrayToLines(form.features)}
              onChange={(e) =>
                setField('features', linesToArray(e.target.value))
              }
            />
          </Field>
          <Field label="Ingredients (one per line)">
            <Textarea
              value={arrayToLines(form.ingredients)}
              onChange={(e) =>
                setField('ingredients', linesToArray(e.target.value))
              }
            />
          </Field>
        </div>

        <Field label="Usage instructions">
          <Textarea
            value={form.usage_instructions ?? ''}
            onChange={(e) => setField('usage_instructions', e.target.value)}
          />
        </Field>

        <Field label="Warnings">
          <Textarea
            value={form.warnings ?? ''}
            onChange={(e) => setField('warnings', e.target.value)}
          />
        </Field>

        {submitError && (
          <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
            <TriangleAlert className="size-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" variant="brand" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create product'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin')}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  )
}
