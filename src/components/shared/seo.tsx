import { siteConfig } from '@/lib/site-config'

type SeoProps = {
  title: string
  description?: string
  path: string
  type?: 'website' | 'article'
  image?: string
  noindex?: boolean
  jsonLd?: object | object[]
}

const SITE_NAME = `${siteConfig.name} — Life Care`
const DEFAULT_IMAGE = '/og-image.png'
const baseUrl = siteConfig.url.replace(/\/$/, '')

function toAbsoluteUrl(pathOrUrl: string) {
  return pathOrUrl.startsWith('http') ? pathOrUrl : `${baseUrl}${pathOrUrl}`
}

export function Seo({
  title,
  description = siteConfig.description,
  path,
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const canonical = toAbsoluteUrl(path)
  const fullTitle =
    path === '/'
      ? `${SITE_NAME} | ${siteConfig.tagline}`
      : `${title} | ${SITE_NAME}`
  const imageUrl = toAbsoluteUrl(image)
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
