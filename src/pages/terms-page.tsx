import { LegalContent } from '@/components/shared/legal-content'
import { PageHero } from '@/components/shared/page-hero'
import { Seo } from '@/components/shared/seo'
import { termsAndConditions } from '@/lib/data/legal'

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms & Conditions"
        description="The terms and conditions governing the use of the NutriAdd (Life Care) website."
        path="/terms"
      />
      <PageHero
        breadcrumbs={[
          { label: 'Home', to: '/' },
          { label: 'Terms & Conditions' },
        ]}
        title="Terms & Conditions"
        description="Please read these terms carefully before using our website."
      />
      <LegalContent document={termsAndConditions} />
    </>
  )
}
