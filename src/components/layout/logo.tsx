import logoImage from '@/assets/nutriadd-logo.jpg'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoImage}
      alt="NutriAdd — Life Care"
      width={1742}
      height={1031}
      decoding="async"
      className={cn('h-11 w-auto', className)}
    />
  )
}
