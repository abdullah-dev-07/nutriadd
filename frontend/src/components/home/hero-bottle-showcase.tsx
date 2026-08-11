import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, FlaskConical, Tag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getProducts } from '@/lib/api/products'
import { formatCurrency } from '@/lib/format'
import { getProductImage } from '@/lib/product-images'
import { type Product } from '@/types/product'

type Phase = 'benefits' | 'ingredients' | 'price'
const PHASE_ORDER: Phase[] = ['benefits', 'ingredients', 'price']
const PHASE_MS = 2600

/**
 * Animated hero showcase: a floating 3D CSS "pill bottle" holding the current
 * product's real image, paired with an info panel that auto-cycles through phases
 * — benefits → ingredients → price — for each product, then slides to the next.
 *
 * Fully dynamic: cycles the entire live catalog from GET /products, so new
 * admin-added products appear automatically (scales 7 → 50+). Degrades to a static
 * panel (all info at once, no auto-advance) under prefers-reduced-motion.
 */
export function HeroBottleShowcase() {
  const shouldReduceMotion = useReducedMotion()
  const [products, setProducts] = useState<Product[]>([])
  const [productIdx, setProductIdx] = useState(0)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancelled = false
    getProducts({ page_size: 100 })
      .then((res) => {
        if (!cancelled) setProducts(res.items)
      })
      .catch(() => {
        /* Empty on error; hero still shows the ambient frame. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const count = products.length

  // Drive the phase → product cycle on a single interval.
  useEffect(() => {
    if (count === 0 || paused || shouldReduceMotion) return
    const id = window.setInterval(() => {
      setPhaseIdx((prevPhase) => {
        if (prevPhase < PHASE_ORDER.length - 1) return prevPhase + 1
        // Last phase done → advance product, reset phase.
        setProductIdx((p) => (p + 1) % count)
        return 0
      })
    }, PHASE_MS)
    return () => window.clearInterval(id)
  }, [count, paused, shouldReduceMotion])

  const product = count > 0 ? products[productIdx] : null
  const phase = PHASE_ORDER[phaseIdx]

  const selectProduct = (i: number) => {
    setProductIdx(((i % count) + count) % count)
    setPhaseIdx(0)
  }

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:max-w-none"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 3D CSS pill bottle */}
      <div className="relative flex aspect-square items-center justify-center">
        <PillBottle product={product} reduceMotion={!!shouldReduceMotion} />
      </div>

      {/* Phase info panel */}
      {product && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="border-border bg-white/95 absolute right-0 -bottom-4 left-0 mx-auto max-w-sm rounded-2xl border p-5 shadow-xl backdrop-blur sm:right-2 sm:left-auto sm:w-72"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-brand-green-dark text-xs font-semibold tracking-wide uppercase">
              {product.category.name}
            </p>
            {count > 1 && (
              <div className="flex items-center gap-1">
                {products.slice(0, Math.min(count, 8)).map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProduct(i)}
                    aria-label={`Show ${p.name}`}
                    aria-current={i === productIdx}
                    className={
                      i === productIdx
                        ? 'bg-brand-blue h-1.5 w-4 rounded-full transition-all'
                        : 'bg-border hover:bg-slate/40 h-1.5 w-1.5 rounded-full transition-all'
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <Link to={`/products/${product.slug}`} className="hover:text-brand-blue">
            <h3 className="text-charcoal mt-1 truncate text-lg font-bold">
              {product.name}
            </h3>
          </Link>

          {/* Phased content */}
          <div className="mt-3 min-h-[92px]">
            {shouldReduceMotion ? (
              <StaticInfo product={product} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${product.id}-${phase}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <PhaseContent product={product} phase={phase} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Phase progress ticks */}
          {!shouldReduceMotion && (
            <div className="mt-3 flex gap-1.5">
              {PHASE_ORDER.map((p, i) => (
                <span
                  key={p}
                  className={
                    i === phaseIdx
                      ? 'bg-brand-green h-1 flex-1 rounded-full'
                      : 'bg-border h-1 flex-1 rounded-full'
                  }
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ---------- 3D CSS pill bottle ---------- */

function PillBottle({
  product,
  reduceMotion,
}: {
  product: Product | null
  reduceMotion: boolean
}) {
  return (
    <motion.div
      className="relative"
      style={{ transformStyle: 'preserve-3d' }}
      animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow */}
      <div
        aria-hidden="true"
        className="bg-gradient-brand absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
      />

      {/* Bottle body (CSS 3D capsule) */}
      <div
        className="relative flex h-80 w-52 items-center justify-center rounded-[2.5rem] border border-white/40 shadow-2xl sm:h-96 sm:w-60"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(6px)',
          transform: 'rotateX(6deg) rotateY(-12deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Cap */}
        <div
          aria-hidden="true"
          className="bg-gradient-brand absolute -top-6 left-1/2 h-12 w-28 -translate-x-1/2 rounded-t-2xl rounded-b-lg shadow-lg"
          style={{ transform: 'translateZ(10px)' }}
        />
        {/* Highlight streak */}
        <div
          aria-hidden="true"
          className="absolute top-6 left-6 h-3/4 w-6 rounded-full bg-white/40 blur-md"
        />
        {/* Product image inside the bottle */}
        <AnimatePresence mode="wait">
          {product && (
            <motion.img
              key={product.id}
              src={getProductImage(product.image_url, product.slug)}
              alt={product.name}
              className="max-h-[78%] w-auto object-contain drop-shadow-xl"
              style={{ transform: 'translateZ(30px)' }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              draggable={false}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Floor reflection */}
      <div
        aria-hidden="true"
        className="mx-auto mt-4 h-6 w-32 rounded-[100%] bg-black/15 blur-md"
      />
    </motion.div>
  )
}

/* ---------- phase content ---------- */

function PhaseContent({ product, phase }: { product: Product; phase: Phase }) {
  if (phase === 'benefits') {
    const items = product.benefits.slice(0, 3)
    if (items.length === 0) return <StaticFallback product={product} />
    return (
      <PhaseList
        icon={<CheckCircle2 className="text-brand-green size-4 shrink-0" />}
        label="Benefits"
        items={items}
      />
    )
  }
  if (phase === 'ingredients') {
    const items = (product.ingredients ?? []).slice(0, 3)
    if (items.length === 0) return <StaticFallback product={product} />
    return (
      <PhaseList
        icon={<FlaskConical className="text-brand-blue size-4 shrink-0" />}
        label="Ingredients"
        items={items}
      />
    )
  }
  // price
  return (
    <div className="flex items-center gap-2">
      <Tag className="text-brand-blue size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-slate text-xs font-medium tracking-wide uppercase">
          Price
        </p>
        <p className="text-brand-blue text-2xl font-bold">
          {formatCurrency(product.price, product.currency)}
        </p>
      </div>
    </div>
  )
}

function PhaseList({
  icon,
  label,
  items,
}: {
  icon: React.ReactNode
  label: string
  items: string[]
}) {
  return (
    <div>
      <p className="text-slate mb-1.5 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-charcoal flex items-start gap-2 text-sm">
            {icon}
            <span className="line-clamp-1">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** When a product lacks benefits/ingredients, show its short description instead. */
function StaticFallback({ product }: { product: Product }) {
  return <p className="text-slate line-clamp-3 text-sm">{product.short_description}</p>
}

/** Reduced-motion: show everything at once, no cycling. */
function StaticInfo({ product }: { product: Product }) {
  const memo = useMemo(
    () => ({
      benefit: product.benefits[0],
      ingredient: (product.ingredients ?? [])[0],
    }),
    [product]
  )
  return (
    <div className="space-y-1 text-sm">
      {memo.benefit && (
        <p className="text-charcoal flex items-center gap-2">
          <CheckCircle2 className="text-brand-green size-4 shrink-0" />
          {memo.benefit}
        </p>
      )}
      {memo.ingredient && (
        <p className="text-charcoal flex items-center gap-2">
          <FlaskConical className="text-brand-blue size-4 shrink-0" />
          {memo.ingredient}
        </p>
      )}
      <p className="text-brand-blue pt-1 text-xl font-bold">
        {formatCurrency(product.price, product.currency)}
      </p>
    </div>
  )
}
