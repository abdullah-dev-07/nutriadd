import { Mail, MapPin, Phone } from 'lucide-react'

import { siteConfig } from '@/lib/site-config'

export function ContactInfo() {
  const { address, phones, email } = siteConfig.contact
  const fullAddress = `${address.street}, ${address.city}, ${address.country}`
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    fullAddress
  )}`

  return (
    <div>
      <h2 className="text-2xl font-bold sm:text-3xl">Get in Touch</h2>
      <p className="text-slate mt-3 text-lg leading-relaxed">
        Have a question about our products, services or partnership
        opportunities? We&apos;d love to hear from you.
      </p>

      <ul className="mt-8 space-y-6">
        <li className="flex gap-4">
          <span className="bg-gradient-brand flex size-11 shrink-0 items-center justify-center rounded-xl text-white">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-charcoal font-semibold">Visit Us</h3>
            <p className="text-slate mt-1">{fullAddress}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:text-brand-blue-dark mt-1 inline-block text-sm font-medium transition-colors"
            >
              View on Google Maps
            </a>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="bg-gradient-brand flex size-11 shrink-0 items-center justify-center rounded-xl text-white">
            <Phone className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-charcoal font-semibold">Call Us</h3>
            <ul className="mt-1 space-y-0.5">
              {phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                    className="text-slate hover:text-brand-blue transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </li>

        <li className="flex gap-4">
          <span className="bg-gradient-brand flex size-11 shrink-0 items-center justify-center rounded-xl text-white">
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-charcoal font-semibold">Email Us</h3>
            <a
              href={`mailto:${email}`}
              className="text-slate hover:text-brand-blue mt-1 inline-block transition-colors"
            >
              {email}
            </a>
          </div>
        </li>
      </ul>
    </div>
  )
}
