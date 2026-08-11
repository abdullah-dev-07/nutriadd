import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getAllPosts } from '../src/lib/data/blog'

const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://nutriadd.store').replace(
  /\/$/,
  ''
)

// API used to enumerate real product + category URLs. Defaults to the production
// API; override with SITEMAP_API_URL at build time if needed. If the API is
// unreachable at build, the sitemap still generates with the static + blog URLs
// (the build never fails on a sitemap fetch).
const API_URL = (
  process.env.SITEMAP_API_URL ??
  process.env.VITE_API_URL ??
  'https://api.nutriadd.store/api/v1'
).replace(/\/$/, '')

type SitemapEntry = {
  path: string
  changefreq: string
  priority: string
  lastmod?: string
}

// Only PUBLIC, indexable pages. Private routes (login, signup, cart, checkout,
// account, orders, admin, reset/forgot password) are intentionally excluded.
const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
]

const postEntries: SitemapEntry[] = getAllPosts().map((post) => ({
  path: `/blog/${post.slug}`,
  changefreq: 'monthly',
  priority: '0.6',
  lastmod: post.date,
}))

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getDynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = []

  // Products
  const productsRes = (await fetchJson(
    `${API_URL}/products?page_size=100`
  )) as { items?: Array<{ slug: string; updated_at?: string }> } | null
  if (productsRes?.items) {
    for (const p of productsRes.items) {
      entries.push({
        path: `/products/${p.slug}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: p.updated_at ? p.updated_at.slice(0, 10) : undefined,
      })
    }
  } else {
    console.warn(
      `[sitemap] Could not fetch products from ${API_URL} — product URLs omitted.`
    )
  }

  // Category "pages" — the existing products page filtered by category
  // (?category=slug). These are the real, working category URLs; no new routes.
  const categoriesRes = (await fetchJson(`${API_URL}/categories`)) as
    | Array<{ slug: string }>
    | null
  if (categoriesRes) {
    for (const c of categoriesRes) {
      entries.push({
        path: `/products?category=${c.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }
  }

  return entries
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function main() {
  const dynamicEntries = await getDynamicEntries()
  const entries = [...staticEntries, ...dynamicEntries, ...postEntries]

  const urls = entries
    .map(({ path, changefreq, priority, lastmod }) => {
      const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
      return `  <url>
    <loc>${escapeXml(SITE_URL + path)}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  const currentDir = dirname(fileURLToPath(import.meta.url))
  const outputPath = resolve(currentDir, '../public/sitemap.xml')
  writeFileSync(outputPath, xml, 'utf8')

  console.log(
    `Sitemap generated with ${entries.length} URLs (${dynamicEntries.length} dynamic) → public/sitemap.xml`
  )
}

main()
