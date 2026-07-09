import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Layout } from '@/components/layout/layout'

const HomePage = lazy(() => import('@/pages/home-page'))
const AboutPage = lazy(() => import('@/pages/about-page'))
const ProductsPage = lazy(() => import('@/pages/products-page'))
const BlogPage = lazy(() => import('@/pages/blog-page'))
const BlogPostPage = lazy(() => import('@/pages/blog-post-page'))
const ContactPage = lazy(() => import('@/pages/contact-page'))
const PrivacyPage = lazy(() => import('@/pages/privacy-page'))
const TermsPage = lazy(() => import('@/pages/terms-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
