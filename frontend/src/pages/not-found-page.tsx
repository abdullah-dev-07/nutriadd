import { Link } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { Seo } from '@/components/shared/seo'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <section className="flex items-center py-24 md:py-32">
      <Seo title="Page Not Found" path="/404" noindex />
      <Container className="text-center">
        <p className="font-heading text-gradient-brand text-7xl font-bold md:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold md:text-4xl">Page not found</h1>
        <p className="text-slate mx-auto mt-4 max-w-md text-lg">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="brand" size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
