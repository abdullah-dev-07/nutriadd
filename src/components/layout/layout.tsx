import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { PageLoader } from '@/components/shared/page-loader'
import { ScrollToTop } from '@/components/shared/scroll-to-top'

import { Footer } from './footer'
import { Navbar } from './navbar'

export function Layout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#main-content"
        className="focus:bg-brand-blue sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
