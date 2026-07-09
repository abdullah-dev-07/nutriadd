import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/container'
import { useLockBodyScroll } from '@/hooks/use-lock-body-scroll'
import { useScrolled } from '@/hooks/use-scrolled'
import { mainNav } from '@/lib/navigation'
import { cn } from '@/lib/utils'

import { Logo } from './logo'

const MENU_ID = 'primary-mobile-menu'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled()

  useLockBodyScroll(open)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors hover:text-brand-blue',
      isActive ? 'text-brand-blue' : 'text-slate'
    )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-transparent bg-white/85 backdrop-blur-md transition-all',
        scrolled && 'border-border shadow-sm'
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            to="/"
            className="focus-visible:ring-ring rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="NutriAdd — Life Care, home"
          >
            <Logo className="h-11 w-auto md:h-14" />
          </Link>

          <nav
            className="hidden items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={linkClasses}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild variant="brand" size="sm">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <button
            type="button"
            className="text-charcoal hover:bg-mist focus-visible:ring-ring inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none md:hidden"
            aria-expanded={open}
            aria-controls={MENU_ID}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            id={MENU_ID}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-border overflow-hidden border-t bg-white md:hidden"
          >
            <Container>
              <nav
                className="flex flex-col gap-1 py-4"
                aria-label="Mobile primary"
              >
                {mainNav.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'rounded-lg px-3 py-3 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-mist text-brand-blue'
                          : 'text-charcoal hover:bg-mist'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <Button
                  asChild
                  variant="brand"
                  className="mt-3 w-full"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
