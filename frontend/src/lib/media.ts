/**
 * Resolves public media URLs for assets served from the VPS disk by Nginx
 * (under /media/...), NOT from the frontend bundle or GitHub.
 *
 * The backend serves media at `${ORIGIN}/media/...`, while the API itself lives
 * at `${ORIGIN}/api/v1`. We already have the API base in VITE_API_URL, so we
 * derive the media origin from it by stripping the trailing `/api/vN` segment —
 * keeping a single source of truth for the domain and never hardcoding it.
 *
 * Examples:
 *   VITE_API_URL=https://api.nutriadd.store/api/v1
 *     → MEDIA_BASE_URL = https://api.nutriadd.store
 *   VITE_API_URL=http://localhost:8000/api/v1
 *     → MEDIA_BASE_URL = http://localhost:8000
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

/** Origin that serves /media/... (API base with any trailing /api/vN removed). */
export const MEDIA_BASE_URL = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '').replace(
  /\/$/,
  ''
)

/** Public URL for a blog image uploaded to /var/www/nutriadd/media/blog/. */
export function blogMediaUrl(filename: string): string {
  return `${MEDIA_BASE_URL}/media/blog/${filename}`
}
