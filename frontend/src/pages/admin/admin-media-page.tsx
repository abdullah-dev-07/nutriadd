import { Check, Copy, Loader2, Trash2, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { MediaUpload } from '@/components/admin/media-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api/client'
import {
  createPromoMedia,
  deletePromoMedia,
  getAllPromoMedia,
  type PromoMediaRead,
} from '@/lib/api/promo-media'

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url)

type PendingUpload = {
  url: string
  mediaType: 'image' | 'video'
  alt: string
  caption: string
}

export default function AdminMediaPage() {
  const [productUrls, setProductUrls] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  const [showcase, setShowcase] = useState<PromoMediaRead[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<PendingUpload | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadShowcase = useCallback(async () => {
    setLoading(true)
    try {
      setShowcase(await getAllPromoMedia())
      setError(null)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Failed to load showcase items.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShowcase()
  }, [loadShowcase])

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard may be unavailable (non-secure context); ignore.
    }
  }

  function handlePromoUploaded(url: string) {
    setPending({
      url,
      mediaType: isVideoUrl(url) ? 'video' : 'image',
      alt: '',
      caption: '',
    })
    setError(null)
  }

  async function addToShowcase() {
    if (!pending) return
    if (!pending.alt.trim()) {
      setError('Alt text is required (it describes the media for screen readers).')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createPromoMedia({
        media_type: pending.mediaType,
        url: pending.url,
        alt: pending.alt.trim(),
        caption: pending.caption.trim() || null,
      })
      setPending(null)
      await loadShowcase()
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : 'Failed to add to showcase.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: PromoMediaRead) {
    if (!window.confirm('Remove this item from the home page showcase?')) return
    setDeletingId(item.id)
    try {
      await deletePromoMedia(item.id)
      setShowcase((prev) => prev.filter((i) => i.id !== item.id))
    } catch (err) {
      window.alert(err instanceof ApiError ? err.detail : 'Failed to delete.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-3xl space-y-10">
      {/* ---------- Promo showcase ---------- */}
      <section className="space-y-4">
        <div>
          <h2 className="text-charcoal text-xl font-semibold">
            Home page showcase
          </h2>
          <p className="text-slate mt-1 text-sm">
            Upload a promotional image or video, add a description, and it appears
            in the &ldquo;Campaigns &amp; Announcements&rdquo; carousel on the home
            page.
          </p>
        </div>

        <div className="border-border space-y-3 rounded-2xl border bg-white p-5">
          <MediaUpload
            target="promo"
            accept="image/*,video/mp4"
            label="Upload promo image or video"
            onUploaded={handlePromoUploaded}
          />

          {pending && (
            <div className="border-border space-y-3 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                {pending.mediaType === 'video' ? (
                  <video
                    src={pending.url}
                    className="bg-mist size-20 rounded-md object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={pending.url}
                    alt="Pending upload preview"
                    className="bg-mist size-20 rounded-md object-contain p-1"
                  />
                )}
                <p className="text-slate min-w-0 flex-1 truncate text-xs">
                  {pending.url}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo-alt">
                  Alt text<span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="promo-alt"
                  value={pending.alt}
                  onChange={(e) =>
                    setPending({ ...pending, alt: e.target.value })
                  }
                  placeholder="Describe the media for accessibility"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo-caption">Caption (optional)</Label>
                <Textarea
                  id="promo-caption"
                  className="min-h-20"
                  value={pending.caption}
                  onChange={(e) =>
                    setPending({ ...pending, caption: e.target.value })
                  }
                  placeholder="Shown under the media in the carousel"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={addToShowcase}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Adding…
                    </>
                  ) : (
                    'Add to showcase'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPending(null)}
                  disabled={saving}
                >
                  Discard
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg px-4 py-3 text-sm">
              <TriangleAlert className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-charcoal font-medium">
            Currently in the showcase{' '}
            {!loading && (
              <span className="text-slate font-normal">({showcase.length})</span>
            )}
          </h3>

          {loading && (
            <div className="text-slate flex items-center gap-2 py-6">
              <Loader2 className="animate-spin" />
              Loading…
            </div>
          )}

          {!loading && showcase.length === 0 && (
            <p className="text-slate text-sm">
              Nothing added yet — the home page is showing the built-in default
              media.
            </p>
          )}

          <ul className="space-y-3">
            {showcase.map((item) => (
              <li
                key={item.id}
                className="border-border flex items-center gap-3 rounded-xl border bg-white p-3"
              >
                {item.media_type === 'video' ? (
                  <video
                    src={item.url}
                    className="bg-mist size-16 shrink-0 rounded-md object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="bg-mist size-16 shrink-0 rounded-md object-contain p-1"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-charcoal truncate text-sm font-medium">
                    {item.alt}
                  </p>
                  {item.caption && (
                    <p className="text-slate truncate text-xs">{item.caption}</p>
                  )}
                  <p className="text-slate text-xs">{item.media_type}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash2 />
                  )}
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Standalone product image upload ---------- */}
      <section className="space-y-3">
        <div>
          <h2 className="text-charcoal text-xl font-semibold">
            Product image upload
          </h2>
          <p className="text-slate mt-1 text-sm">
            Uploads to Blob Storage and gives you a URL to paste into a product.
            To attach an image to a product directly, use the upload button inside
            the product form instead.
          </p>
        </div>
        <div className="border-border space-y-3 rounded-2xl border bg-white p-5">
          <MediaUpload
            target="product"
            accept="image/*"
            label="Upload product image"
            onUploaded={(url) => setProductUrls((prev) => [url, ...prev])}
          />
          <ul className="space-y-2">
            {productUrls.map((url) => (
              <li
                key={url}
                className="border-border flex items-center gap-3 rounded-xl border p-3"
              >
                <img
                  src={url}
                  alt="Uploaded product"
                  className="bg-mist size-12 shrink-0 rounded-md object-contain p-1"
                />
                <p className="text-charcoal min-w-0 flex-1 truncate text-sm">
                  {url}
                </p>
                <Button variant="outline" size="sm" onClick={() => copy(url)}>
                  {copied === url ? (
                    <>
                      <Check />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy />
                      Copy URL
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
