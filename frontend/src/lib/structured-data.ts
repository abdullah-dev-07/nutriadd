import { siteConfig } from '@/lib/site-config'
import { type BlogPost } from '@/types/content'
import { type Product } from '@/types/product'

export function organizationSchema() {
  const { address, email, phones } = siteConfig.contact
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/nutriadd-logo.jpg`,
    description: siteConfig.description,
    email,
    telephone: phones[0],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phones[0],
      email,
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['en', 'ur'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressCountry: address.country,
    },
  }
}

/** WebSite schema — declares the canonical site + a SearchAction pointing at the
 * existing products search (no new UI; just describes what already exists). */
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${siteConfig.name} — Life Care`,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'en-PK',
    publisher: { '@type': 'Organization', name: siteConfig.legalName },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** AboutPage schema — describes the existing About page; no content change. */
export function aboutPageSchema(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${siteConfig.legalName}`,
    url,
    description: siteConfig.description,
    mainEntity: {
      '@type': 'Organization',
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
  }
}

/** BreadcrumbList schema from an ordered list of { name, url } crumbs. */
export function breadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function blogPostingSchema(post: BlogPost, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.legalName,
      url: siteConfig.url,
    },
    mainEntityOfPage: url,
    articleSection: post.category,
  }
}

export function productSchema(product: Product, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description,
    sku: product.sku,
    category: product.category.name,
    url,
    brand: { '@type': 'Organization', name: siteConfig.legalName },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency,
      price: product.price,
      availability:
        product.availability === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: siteConfig.legalName },
    },
  }
}
