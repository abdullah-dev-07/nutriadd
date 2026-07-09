import { type LegalDocument } from '@/lib/data/legal'

import { Container } from './container'
import { Section } from './section'

export function LegalContent({ document }: { document: LegalDocument }) {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-slate text-sm">Last updated: {document.updated}</p>
          <p className="text-slate mt-4 text-lg leading-relaxed">
            {document.intro}
          </p>

          <div className="mt-10 space-y-10">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-charcoal text-2xl font-bold">
                  {section.heading}
                </h2>
                <div className="text-slate mt-3 space-y-3 text-lg leading-relaxed">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
