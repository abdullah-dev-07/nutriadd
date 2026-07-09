import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getAllPosts } from '../src/lib/data/blog'

const SITE_URL = (
  process.env.VITE_SITE_URL ?? 'https://www.nutriadd.com'
).replace(/\/$/, '')

type SitemapEntry = {
  path: string
  changefreq: string
  priority: string
  lastmod?: string
}

const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/products', changefreq: 'monthly', priority: '0.8' },
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

const entries = [...staticEntries, ...postEntries]

const urls = entries
  .map(({ path, changefreq, priority, lastmod }) => {
    const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''
    return `  <url>
    <loc>${SITE_URL}${path}</loc>${lastmodTag}
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
  `Sitemap generated with ${entries.length} URLs → public/sitemap.xml`
)
