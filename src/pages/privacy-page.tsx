import { LegalContent } from '@/components/shared/legal-content'
import { PageHero } from '@/components/shared/page-hero'
import { Seo } from '@/components/shared/seo'
import { privacyPolicy } from '@/lib/data/legal'

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy"
        description="How NutriAdd (Life Care) collects, uses and protects your information."
        path="/privacy"
      />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]}
        title="Privacy Policy"
        description="Your privacy matters to us. Here's how we handle your information."
      />
      <LegalContent document={privacyPolicy} />
    </>
  )
}
