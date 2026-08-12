import logoImage from '@/assets/nutriadd-logo.jpg'
import { cn } from '@/lib/utils'

/**
 * The logo asset is a JPG that bakes in BOTH a white background AND near-black
 * "Life Care" text. That combination means no single CSS blend can cleanly drop
 * the background on every surface (multiply erases the black text; screen keeps
 * the white box). So we treat the two surface types differently:
 *
 *   surface="navbar"  — follows the theme:
 *       • light theme: `multiply` blends the white into the light navbar (flush).
 *       • dark theme:  the blend can't win (see above), so we sit the logo on a
 *         soft rounded light chip — an intentional brand lockup, not a raw box.
 *
 *   surface="dark"    — a permanently-dark surface (the footer, dark in both
 *       themes): always uses the light chip so the whole logo stays legible.
 *
 * The light chip is provided by the `.logo-chip` utility (see styles/index.css),
 * which is inert in light mode and only paints in dark mode / on dark surfaces.
 */
type LogoSurface = 'navbar' | 'dark'

export function Logo({
  className,
  surface = 'navbar',
}: {
  className?: string
  surface?: LogoSurface
}) {
  const chipClass = surface === 'dark' ? 'logo-chip-always' : 'logo-chip'

  return (
    <span className={cn('inline-flex', chipClass)}>
      <img
        src={logoImage}
        alt="NutriAdd — Life Care"
        width={1742}
        height={1031}
        decoding="async"
        className={cn('h-11 w-auto', 'logo-blend', className)}
      />
    </span>
  )
}
