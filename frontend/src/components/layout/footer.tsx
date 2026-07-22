import {
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { divisions, legalNav, mainNav } from '@/lib/navigation'
import { siteConfig } from '@/lib/site-config'

import { Logo } from './logo'

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/sajid.janjua.14',
    icon: Facebook,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/923008480844',
    icon: MessageCircle,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/sajidjanjua42?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    icon: Instagram,
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { contact, tagline, legalName } = siteConfig
  const { address, phones, email } = contact

  return (
    <footer className="bg-charcoal text-white/70">
      <Container className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <Link
              to="/"
              aria-label="NutriAdd — Life Care, home"
              className="inline-flex rounded-xl bg-white p-3 shadow-sm"
            >
              <Logo className="h-12 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              {tagline}. Delivering trusted pharmaceutical, nutraceutical and
              healthcare solutions across Pakistan for over 15 years.
            </p>
            <ul className="mt-6 flex gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="hover:bg-brand-green inline-flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer company">
            <h2 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
              Company
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className="hover:text-brand-green transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer divisions">
            <h2 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
              Our Divisions
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {divisions.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-brand-green transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-wider text-white uppercase">
              Get in Touch
            </h2>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="text-brand-green mt-0.5 size-4 shrink-0" />
                <span>
                  {address.street}, {address.city}, {address.country}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="text-brand-green mt-0.5 size-4 shrink-0" />
                <a
                  href={`tel:${phones[0].replace(/[^+\d]/g, '')}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {phones[0]}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="text-brand-green mt-0.5 size-4 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-brand-green transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row">
          <p>
            &copy; {year} {legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="hover:text-brand-green transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  )
}
