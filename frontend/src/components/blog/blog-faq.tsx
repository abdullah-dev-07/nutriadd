import { RichText } from '@/components/blog/rich-text'
import { type FaqItem } from '@/types/content'

export function BlogFaq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="border-border mt-12 border-t pt-10">
      <h2 className="text-charcoal text-2xl font-bold sm:text-3xl">
        Frequently Asked Questions
      </h2>
      <dl className="mt-6 space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-border rounded-2xl border bg-card p-6 shadow-sm"
          >
            <dt className="text-charcoal text-lg font-semibold">
              {faq.question}
            </dt>
            <dd className="text-slate mt-2 leading-relaxed">
              <RichText text={faq.answer} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
