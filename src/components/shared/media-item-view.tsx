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

  if (item.type === 'video') {
    const autoPlay = item.autoPlay ?? false
    return (
      <video
        className={cn('h-full w-full', fitClass, className)}
        src={item.src}
        poster={item.poster}
        controls={item.controls ?? !autoPlay}
        autoPlay={autoPlay}
        loop={item.loop ?? false}
        muted={item.muted ?? autoPlay}
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
