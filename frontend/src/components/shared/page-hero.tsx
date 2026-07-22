import { ChevronRight } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Container } from './container'

type Crumb = {
  label: string
  to?: string
}

type PageHeroProps = {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: Crumb[]
}

export function PageHero({ title, description, breadcrumbs }: PageHeroProps) {
  return (
    <section className="bg-mist relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="bg-brand-green/15 absolute -top-24 -left-20 h-64 w-64 rounded-full blur-3xl" />
        <div className="bg-brand-blue/15 absolute -right-20 bottom-0 h-64 w-64 rounded-full blur-3xl" />
      </div>

      <Container className="py-16 text-center md:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="text-slate flex flex-wrap items-center justify-center gap-1 text-sm">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <Fragment key={crumb.label}>
                    <li>
                      {crumb.to && !isLast ? (
                        <Link
                          to={crumb.to}
                          className="hover:text-brand-blue transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className="text-charcoal font-medium"
                          aria-current={isLast ? 'page' : undefined}
                        >
                          {crumb.label}
                        </span>
                      )}
                    </li>
                    {!isLast && (
                      <li aria-hidden="true">
                        <ChevronRight className="text-slate/60 size-4" />
                      </li>
                    )}
                  </Fragment>
                )
              })}
            </ol>
          </nav>
        )}

        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-slate mx-auto mt-5 max-w-2xl text-lg leading-relaxed">
            {description}
          </p>
        )}
      </Container>
    </section>
  )
}
