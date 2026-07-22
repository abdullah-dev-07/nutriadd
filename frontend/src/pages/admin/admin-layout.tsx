import { Boxes, Upload } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Container } from '@/components/shared/container'
import { PageHero } from '@/components/shared/page-hero'
import { Section } from '@/components/shared/section'
import { Seo } from '@/components/shared/seo'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/admin', label: 'Products', icon: Boxes, end: true },
  { to: '/admin/media', label: 'Media Upload', icon: Upload, end: false },
]

export default function AdminLayout() {
  return (
    <>
      <Seo title="Admin" path="/admin" noindex />
      <PageHero
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admin' }]}
        title="Admin Dashboard"
        description="Manage products and upload promotional media to Azure Blob Storage."
      />

      <Section>
        <Container>
          <nav className="mb-8 flex flex-wrap gap-2">
            {tabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-brand border-transparent text-white'
                      : 'border-border text-charcoal hover:bg-mist'
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </Container>
      </Section>
    </>
  )
}
