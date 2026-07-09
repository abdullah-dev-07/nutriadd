export type NavItem = {
  label: string
  href: string
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export const legalNav: NavItem[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

export const divisions: NavItem[] = [
  { label: 'Pharmaceuticals', href: '/products' },
  { label: 'Nutraceuticals', href: '/products' },
  { label: 'Cosmeceuticals', href: '/products' },
  { label: 'Food Supplements', href: '/products' },
  { label: 'Dentistry', href: '/products' },
]
