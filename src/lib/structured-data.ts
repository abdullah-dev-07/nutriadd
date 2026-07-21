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
    description: siteConfig.description,
    email,
    telephone: phones[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressCountry: address.country,
    },
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
