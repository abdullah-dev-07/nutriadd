import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'
import { type MediaItem } from '@/types/content'

type MediaItemViewProps = {
  item: MediaItem
  priority?: boolean
  className?: string
  onPlayingChange?: (playing: boolean) => void
}

export function MediaItemView({
  item,
  priority = false,
  className,
  onPlayingChange,
}: MediaItemViewProps) {
  const fitClass = item.fit === 'contain' ? 'object-contain' : 'object-cover'
  const videoRef = useRef<HTMLVideoElement>(null)

  // Autoplay the video when it scrolls into view; pause when it scrolls out.
  // Autoplay is only permitted by browsers when muted, so the video plays muted
  // (controls stay available so the user can unmute).
  useEffect(() => {
    if (item.type !== 'video') return
    const video = videoRef.current
    if (!video) return

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return // respect users who opt out of motion

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // .play() returns a promise that can reject (e.g. not yet allowed);
          // ignore the rejection so it never throws.
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      // Start when ~50% of the video is on screen.
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [item.type, item.src])

  if (item.type === 'video') {
    return (
      <video
        ref={videoRef}
        className={cn('h-full w-full', fitClass, className)}
        src={item.src}
        poster={item.poster}
        controls={item.controls ?? true}
        loop={item.loop ?? true}
        muted // required for scroll-triggered autoplay
        playsInline
        preload={priority ? 'metadata' : 'none'}
        aria-label={item.alt}
        onPlay={() => onPlayingChange?.(true)}
        onPause={() => onPlayingChange?.(false)}
        onEnded={() => onPlayingChange?.(false)}
      />
    )
  }

  return (
    <img
      className={cn('h-full w-full', fitClass, className)}
      src={item.src}
      alt={item.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  )
}
