import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { getProducts } from '@/lib/api/products'
import { formatCurrency } from '@/lib/format'
import { getProductImage } from '@/lib/product-images'
import { type Product } from '@/types/product'

const ROTATE_MS = 4000
const MAX_TILT = 10 // degrees

/**
 * Elegant auto-sliding "3D-style" bottle showcase for the hero.
 *
 * Uses the real product images from the API (no 3D model files needed) and fakes
 * depth with CSS 3D transforms: the bottle floats, tilts toward the cursor, casts
 * a soft glow + reflection, and slides one-by-one through the live catalog with a
 * small detail card (category, name, price) + pagination dots. Fully dynamic — new
 * admin-added products appear automatically. Degrades to a simple crossfade under
 * prefers-reduced-motion.
 */
export function HeroBottleShowcase() {
  const shouldReduceMotion = useReducedMotion()
  const [products, setProducts] = useState<Product[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getProducts({ page_size: 100 })
      .then((res) => {
        if (!cancelled) setProducts(res.items)
      })
      .catch(() => {
        /* Leave empty on error; hero right side just shows the ambient frame. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const count = products.length

  useEffect(() => {
    if (count <= 1 || paused || shouldReduceMotion) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      ROTATE_MS
    )
    return () => window.clearInterval(id)
  }, [count, paused, shouldReduceMotion])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || e.pointerType !== 'mouse' || !frameRef.current)
        return
      const r = frameRef.current.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      setTilt({ x: (0.5 - py) * 2 * MAX_TILT, y: (px - 0.5) * 2 * MAX_TILT })
    },
    [shouldReduceMotion]
  )
  const resetTilt = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  const go = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  )

  const product = count > 0 ? products[index] : null

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:max-w-none"
      style={{ perspective: '1400px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false)
        resetTilt()
      }}
    >
      {/* Ambient gradient frame */}
      <motion.div
        ref={frameRef}
        onPointerMove={onPointerMove}
        className="bg-gradient-brand relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] shadow-xl"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 200ms ease-out',
        }}
      >
        {/* Dotted texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Soft inner glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.35), transparent 60%)',
          }}
        />

        {/* Sliding bottle */}
        {product && (
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              className="absolute inset-0 flex items-center justify-center p-10"
              style={{ transformStyle: 'preserve-3d' }}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 60, rotateY: 15 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, x: 0, rotateY: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: -60, rotateY: -15 }
              }
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/products/${product.slug}`}
                className="flex size-full items-center justify-center focus-visible:outline-none"
                aria-label={`View ${product.name}`}
              >
                <motion.img
                  src={getProductImage(product.image_url, product.slug)}
                  alt={product.name}
                  className="max-h-full w-auto object-contain drop-shadow-2xl"
                  style={{ transform: 'translateZ(60px)' }}
                  animate={
                    shouldReduceMotion ? undefined : { y: [0, -14, 0] }
                  }
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  draggable={false}
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Floor reflection */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 h-6 w-2/5 -translate-x-1/2 rounded-[100%] bg-black/20 blur-md"
        />
      </motion.div>

      {/* Detail card + dots */}
      {product && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="border-border bg-white/95 absolute right-4 -bottom-6 left-4 rounded-2xl border p-4 shadow-lg backdrop-blur sm:right-6 sm:left-auto sm:w-64"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-brand-green-dark text-xs font-semibold tracking-wide uppercase">
                {product.category.name}
              </p>
              <Link
                to={`/products/${product.slug}`}
                className="hover:text-brand-blue"
              >
                <h3 className="text-charcoal mt-0.5 truncate font-bold">
                  {product.name}
                </h3>
              </Link>
              <p className="text-brand-blue mt-1 text-lg font-bold">
                {formatCurrency(product.price, product.currency)}
              </p>
            </motion.div>
          </AnimatePresence>

          {count > 1 && (
            <div className="mt-3 flex items-center gap-1.5">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show ${p.name}`}
                  aria-current={i === index}
                  className={
                    i === index
                      ? 'bg-brand-blue h-1.5 w-5 rounded-full transition-all'
                      : 'bg-border hover:bg-slate/40 h-1.5 w-1.5 rounded-full transition-all'
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
