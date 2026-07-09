import { siteConfig } from '@/lib/site-config'
import { type BlogPost } from '@/types/content'

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
