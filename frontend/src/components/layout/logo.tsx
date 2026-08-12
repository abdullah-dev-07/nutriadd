import logoImage from '@/assets/nutriadd-logo.jpg'
import { cn } from '@/lib/utils'

/**
 * The logo asset is a JPG with a baked-in WHITE background, so it can't be
 * dropped straight onto a tinted or dark surface without showing a white box.
 *
 * We neutralize the white with CSS blend modes instead of editing the asset:
 *   - `multiply` drops white to transparent on LIGHT surfaces while keeping the
 *     colored pill mark intact.
 *   - `screen` does the inverse for DARK surfaces.
 *
 * `on` picks the blend by the surrounding surface:
 *   - "auto" (default): multiply on light theme, screen on dark theme — for the
 *     navbar, whose background follows the theme. Handled by the `.logo-blend`
 *     utility (see styles/index.css).
 *   - "dark": always `screen` — for a permanently dark surface like the footer,
 *     which stays dark in both themes.
 */
type LogoTone = 'auto' | 'dark'

const blendClasses: Record<LogoTone, string> = {
  auto: 'logo-blend',
  dark: 'mix-blend-screen',
}

export function Logo({
  className,
  on = 'auto',
}: {
  className?: string
  on?: LogoTone
}) {
  return (
    <img
      src={logoImage}
      alt="NutriAdd — Life Care"
      width={1742}
      height={1031}
      decoding="async"
      className={cn('h-11 w-auto', blendClasses[on], className)}
    />
  )
}
