import { NavLink, Outlet } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { cn } from '@/lib/utils'

const accountNav = [
  { label: 'Profile', href: '/account', end: true },
  { label: 'My Orders', href: '/account/orders', end: false },
  { label: 'Saved Addresses', href: '/account/addresses', end: false },
  { label: 'Account Settings', href: '/account/settings', end: false },
]

export default function AccountLayout() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'My Account' }]}
        title="My Account"
        description="Manage your profile, orders and account settings."
      />

      <Section>
        <Container>
          <div className="grid gap-10 md:grid-cols-[220px_1fr]">
            <nav aria-label="Account" className="flex flex-col gap-1">
              {accountNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-mist text-brand-blue'
                        : 'text-charcoal hover:bg-mist'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div>
              <Outlet />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
