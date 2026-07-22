import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { MediaUpload } from '@/components/admin/media-upload'
import { Button } from '@/components/ui/button'
import { type MediaContainer } from '@/lib/api/admin'

type UploadedItem = {
  url: string
  container: MediaContainer
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<UploadedItem[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  function addItem(container: MediaContainer, url: string) {
    setItems((prev) => [{ url, container }, ...prev])
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); ignore.
    }
  }

  const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url)

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-charcoal text-xl font-semibold">
          Upload media to Azure Blob Storage
        </h2>
        <p className="text-slate mt-1 text-sm">
          Upload promotional images and videos, or product images. Files go
          straight to Azure Blob Storage and you get a public URL back to paste
          into a product or share.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-border space-y-3 rounded-2xl border bg-white p-5">
          <h3 className="text-charcoal font-medium">Product images</h3>
          <p className="text-slate text-sm">Container: product-images</p>
          <MediaUpload
            container="product-images"
            accept="image/*"
            label="Upload product image"
            onUploaded={(url) => addItem('product-images', url)}
          />
        </div>
        <div className="border-border space-y-3 rounded-2xl border bg-white p-5">
          <h3 className="text-charcoal font-medium">Promo images &amp; videos</h3>
          <p className="text-slate text-sm">Container: promo-media</p>
          <MediaUpload
            container="promo-media"
            accept="image/*,video/mp4"
            label="Upload promo image or video"
            onUploaded={(url) => addItem('promo-media', url)}
          />
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-charcoal font-medium">Uploaded this session</h3>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.url}
                className="border-border flex items-center gap-3 rounded-xl border bg-white p-3"
              >
                {isVideo(item.url) ? (
                  <video
                    src={item.url}
                    className="bg-mist size-16 shrink-0 rounded-md object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={item.url}
                    alt="Uploaded media"
                    className="bg-mist size-16 shrink-0 rounded-md object-contain p-1"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-slate text-xs">{item.container}</p>
                  <p className="text-charcoal truncate text-sm" title={item.url}>
                    {item.url}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(item.url)}
                >
                  {copied === item.url ? (
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
      )}
    </div>
  )
}
