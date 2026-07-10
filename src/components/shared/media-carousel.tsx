import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'
import { type MediaItem } from '@/types/content'

import { MediaItemView } from './media-item-view'

type MediaCarouselProps = {
  items: MediaItem[]
  autoPlay?: boolean
  interval?: number
  aspectClassName?: string
  className?: string
}

const DEFAULT_INTERVAL = 6000
const SWIPE_THRESHOLD = 70

export function MediaCarousel({
  items,
  autoPlay = true,
  interval = DEFAULT_INTERVAL,
  aspectClassName = 'aspect-video',
  className,
}: MediaCarouselProps) {
  const shouldReduceMotion = useReducedMotion()
  const [[page, direction], setPage] = useState<[number, number]>([0, 0])
  const [isPaused, setIsPaused] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const count = items.length
  const activeIndex = count > 0 ? ((page % count) + count) % count : 0
  const current = items[activeIndex]

  const paginate = useCallback((dir: number) => {
    setPage(([prev]) => [prev + dir, dir])
  }, [])

  const goTo = useCallback(
    (target: number) => {
      setPage(([prev]) => {
        const currentIndex = ((prev % count) + count) % count
        return [target, target >= currentIndex ? 1 : -1]
      })
    },
    [count]
  )

  const canAutoPlay =
    autoPlay && count > 1 && !isPaused && !isVideoPlaying && !shouldReduceMotion

  useEffect(() => {
    setIsVideoPlaying(false)
  }, [activeIndex])

  useEffect(() => {
    if (!canAutoPlay) return
    const timer = window.setInterval(() => paginate(1), interval)
    return () => window.clearInterval(timer)
  }, [canAutoPlay, interval, paginate, activeIndex])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (count < 2) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      paginate(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      paginate(1)
    }
  }

  if (count === 0 || !current) return null

  const variants = shouldReduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          x: dir >= 0 ? '100%' : '-100%',
          opacity: 0,
        }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({
          x: dir >= 0 ? '-100%' : '100%',
          opacity: 0,
        }),
      }

  return (
    <div
      className={cn(
        'group bg-charcoal relative overflow-hidden rounded-3xl shadow-xl',
        className
      )}
      role="group"
      aria-roledescription="carousel"
      aria-label="Promotional media"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
    >
      <div className={cn('relative', aspectClassName)}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: shouldReduceMotion ? 0.3 : 0.55,
              ease: 'easeInOut',
            }}
            drag={count > 1 && current.type !== 'video' ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) paginate(1)
              else if (info.offset.x > SWIPE_THRESHOLD) paginate(-1)
            }}
            className="absolute inset-0"
          >
            <MediaItemView
              item={current}
              priority
              onPlayingChange={setIsVideoPlaying}
            />
            {current.caption && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16 sm:p-7 sm:pt-20">
                <p className="text-sm font-medium text-white sm:text-base">
                  {current.caption}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous slide"
            className="text-charcoal absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next slide"
            className="text-charcoal absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {items.map((item, dotIndex) => (
              <button
                key={`${item.type}-${dotIndex}`}
                type="button"
                onClick={() => goTo(dotIndex)}
                aria-label={`Go to slide ${dotIndex + 1}`}
                aria-current={dotIndex === activeIndex}
                className={cn(
                  'h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                  dotIndex === activeIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        </>
      )}

      <span className="sr-only" aria-live="polite">
        Slide {activeIndex + 1} of {count}
      </span>
    </div>
  )
}
