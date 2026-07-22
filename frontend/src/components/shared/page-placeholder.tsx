import { Container } from './container'

type PagePlaceholderProps = {
  eyebrow?: string
  title: string
  description: string
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="py-24 md:py-32">
      <Container className="text-center">
        {eyebrow && (
          <p className="text-brand-green-dark mb-3 text-sm font-semibold tracking-widest uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="text-slate mx-auto mt-4 max-w-2xl text-lg">
          {description}
        </p>
        <div className="bg-gradient-brand mx-auto mt-8 h-1 w-20 rounded-full" />
      </Container>
    </section>
  )
}
