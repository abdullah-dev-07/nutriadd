import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/lib/theme/theme-context'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="text-charcoal hover:text-brand-blue hover:bg-mist focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  )
}
