import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import {
  addCartItem,
  clearCart as clearServerCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type ServerCart,
} from '@/lib/api/cart'
import { useAuth } from '@/lib/auth/auth-context'
import { type Product } from '@/types/product'

const CART_STORAGE_KEY = 'nutriadd_cart'

export type CartItem = {
  productId: string
  name: string
  price: number
  currency: string
  imageUrl: string
  slug: string
  quantity: number
}

function serverToItems(cart: ServerCart): CartItem[] {
  return cart.items.map((line) => ({
    productId: line.product_id,
    name: line.name,
    price: line.unit_price,
    currency: line.currency,
    imageUrl: line.image_url,
    slug: line.slug,
    quantity: line.quantity,
  }))
}

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.items)) return parsed.items
  } catch {
    // Ignore malformed payloads.
  }
  return []
}

function writeGuestCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }))
}

type CartContextValue = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  subtotal: number
  totalQuantity: number
  loading: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus } = useAuth()
  const [items, setItems] = useState<CartItem[]>(() => readGuestCart())
  const [loading, setLoading] = useState(false)
  // Tracks whether we're currently in authenticated (server) mode.
  const authed = !!user
  const prevAuthedRef = useRef(authed)

  // --- Guest mode persists to localStorage ---
  useEffect(() => {
    if (!authed) writeGuestCart(items)
  }, [items, authed])

  // --- On login: merge any guest cart into the server cart, then load it.
  //     On logout: drop the in-memory cart (server cart stays on the server). ---
  useEffect(() => {
    const wasAuthed = prevAuthedRef.current
    prevAuthedRef.current = authed
    if (authStatus === 'loading' || authStatus === 'idle') return

    let cancelled = false

    async function syncOnLogin() {
      setLoading(true)
      try {
        const guest = readGuestCart()
        // Push guest items up to the server cart (best-effort).
        for (const item of guest) {
          try {
            await addCartItem(item.productId, item.quantity)
          } catch {
            // Skip items that fail (e.g. product removed).
          }
        }
        if (guest.length > 0) window.localStorage.removeItem(CART_STORAGE_KEY)
        const cart = await getCart()
        if (!cancelled) setItems(serverToItems(cart))
      } catch {
        // Leave whatever we have; a later action will refetch.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (authed && !wasAuthed) {
      syncOnLogin()
    } else if (!authed && wasAuthed) {
      setItems([])
    } else if (authed) {
      // Already authed (e.g. page load with a valid session): load server cart.
      getCart()
        .then((cart) => {
          if (!cancelled) setItems(serverToItems(cart))
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, authStatus])

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      if (authed) {
        addCartItem(product.id, quantity)
          .then((cart) => setItems(serverToItems(cart)))
          .catch(() => {})
        // Optimistic bump so the badge updates instantly.
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === product.id)
          if (existing) {
            return prev.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
          }
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              currency: product.currency,
              imageUrl: product.image_url,
              slug: product.slug,
              quantity,
            },
          ]
        })
        return
      }
      // Guest mode
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageUrl: product.image_url,
            slug: product.slug,
            quantity,
          },
        ]
      })
    },
    [authed]
  )

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
      if (authed) {
        removeCartItem(productId)
          .then((cart) => setItems(serverToItems(cart)))
          .catch(() => {})
      }
    },
    [authed]
  )

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId)
        return
      }
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      )
      if (authed) {
        updateCartItem(productId, quantity)
          .then((cart) => setItems(serverToItems(cart)))
          .catch(() => {})
      }
    },
    [authed, removeItem]
  )

  const clear = useCallback(() => {
    setItems([])
    if (authed) {
      clearServerCart().catch(() => {})
    } else {
      writeGuestCart([])
    }
  }, [authed])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
    return {
      items,
      addItem,
      removeItem,
      setQuantity,
      clear,
      subtotal,
      totalQuantity,
      loading,
    }
  }, [items, addItem, removeItem, setQuantity, clear, loading])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
