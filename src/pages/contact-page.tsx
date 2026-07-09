import { ContactForm } from '@/components/contact/contact-form'
import { ContactInfo } from '@/components/contact/contact-info'
import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contact Us"
        description="Reach out for product enquiries, partnership opportunities, or support for your healthcare business."
        path="/contact"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        title="Contact Us"
        description="Reach out for product enquiries, partnership opportunities, or any way we can support your healthcare business."
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ContactInfo />
            <div className="border-border rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
