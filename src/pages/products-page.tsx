import { PackageOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  return (
    <>
      <Seo
        title="Products"
        description="Our portfolio across pharmaceuticals, nutraceuticals, cosmeceuticals, food supplements and dentistry."
        path="/products"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        title="Our Products"
        description="A trusted portfolio across pharmaceuticals, nutraceuticals, cosmeceuticals, food supplements and dentistry."
      />

      <Section>
        <Container>
          <div className="border-border mx-auto flex max-w-xl flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm md:p-14">
            <span className="bg-gradient-brand flex size-16 items-center justify-center rounded-2xl text-white">
              <PackageOpen className="size-8" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-bold sm:text-3xl">
              Our Full Catalogue Is Coming Soon
            </h2>
            <p className="text-slate mt-4 text-lg leading-relaxed">
              We&apos;re preparing a complete, easy-to-browse product catalogue
              across all our divisions. In the meantime, reach out and our team
              will be glad to help with any product enquiry.
            </p>
            <div className="mt-8">
              <Button asChild variant="brand" size="lg">
                <Link to="/contact">Enquire About Products</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
