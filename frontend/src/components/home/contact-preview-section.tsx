import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Reveal } from '@/components/shared/reveal'
import { Section } from '@/components/shared/section'
import { SectionHeading } from '@/components/shared/section-heading'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site-config'

export function ContactPreviewSection() {
  const { address, phones, email } = siteConfig.contact

  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Us',
      lines: [address.street, `${address.city}, ${address.country}`],
    },
    {
      icon: Phone,
      title: 'Call Us',
      lines: [phones[0], phones[1]],
    },
    {
      icon: Mail,
      title: 'Email Us',
      lines: [email],
    },
  ]

  return (
    <Section tone="muted">
      <Container>
        <SectionHeading
          eyebrow="Contact"
          title="Let's Start a Conversation"
          description="Reach out to discuss products, partnerships or any way we can support your healthcare business."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {contactCards.map(({ icon: Icon, title, lines }) => (
            <Reveal key={title}>
              <div className="border-border flex h-full flex-col items-center rounded-2xl border bg-white p-8 text-center shadow-sm">
                <span className="bg-gradient-brand flex size-12 items-center justify-center rounded-xl text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <div className="text-slate mt-2 space-y-1">
                  {lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="brand" size="lg">
            <Link to="/contact">Go to Contact Page</Link>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
