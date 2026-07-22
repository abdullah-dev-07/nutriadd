import { CheckCircle2, Loader2, TriangleAlert, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'

import { Button } from '@/components/ui/button'
import { uploadMedia, type MediaTarget } from '@/lib/api/admin'
import { ApiError } from '@/lib/api/client'

type MediaUploadProps = {
  target: MediaTarget
  accept?: string
  label?: string
  onUploaded: (url: string) => void
}

/**
 * A button that lets an admin pick a local file, uploads it to Azure Blob Storage
 * via the backend, and returns the public URL through onUploaded.
 */
export function MediaUpload({
  target,
  accept = 'image/*',
  label = 'Upload file',
  onUploaded,
}: MediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>(
    'idle'
  )
  const [message, setMessage] = useState<string | null>(null)

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus('uploading')
    setMessage(null)
    try {
      const { url } = await uploadMedia(file, target)
      onUploaded(url)
      setStatus('done')
      setMessage(`Uploaded ${file.name}`)
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof ApiError
          ? error.detail
          : 'Upload failed. Please try again.'
      )
    } finally {
      // Reset so selecting the same file again re-triggers change.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'uploading'}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="animate-spin" />
            Uploading…
          </>
        ) : (
          <>
            <Upload />
            {label}
          </>
        )}
      </Button>
      {message && (
        <p
          className={
            status === 'error'
              ? 'text-destructive flex items-center gap-1.5 text-sm'
              : 'text-brand-green-dark flex items-center gap-1.5 text-sm'
          }
          aria-live="polite"
        >
          {status === 'error' ? (
            <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          )}
          {message}
        </p>
      )}
    </div>
  )
}
