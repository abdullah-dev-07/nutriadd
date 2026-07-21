import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppProviders } from '@/app-providers'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Layout } from '@/components/layout/layout'

const HomePage = lazy(() => import('@/pages/home-page'))
const AboutPage = lazy(() => import('@/pages/about-page'))
const ProductsPage = lazy(() => import('@/pages/products-page'))
const ProductDetailPage = lazy(() => import('@/pages/product-detail-page'))
const CartPage = lazy(() => import('@/pages/cart-page'))
const CheckoutPage = lazy(() => import('@/pages/checkout-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const SignupPage = lazy(() => import('@/pages/signup-page'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password-page'))
const AccountLayout = lazy(() => import('@/pages/account/account-layout'))
const ProfilePage = lazy(() => import('@/pages/account/profile-page'))
const OrdersPage = lazy(() => import('@/pages/account/orders-page'))
const OrderDetailPage = lazy(() => import('@/pages/account/order-detail-page'))
const AddressesPage = lazy(() => import('@/pages/account/addresses-page'))
const SettingsPage = lazy(() => import('@/pages/account/settings-page'))
const BlogPage = lazy(() => import('@/pages/blog-page'))
const BlogPostPage = lazy(() => import('@/pages/blog-post-page'))
const ContactPage = lazy(() => import('@/pages/contact-page'))
const PrivacyPage = lazy(() => import('@/pages/privacy-page'))
const TermsPage = lazy(() => import('@/pages/terms-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AppProviders>
    </BrowserRouter>
  )
}

export default App
