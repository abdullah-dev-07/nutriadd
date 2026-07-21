import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'

import { type Product } from '@/types/product'

const CART_STORAGE_KEY = 'nutriadd_cart'

export type CartItem = {
  productId: string
  name: string
  price: number
  currency: string
  imageKey: string
  slug: string
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'SET_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR' }

function readInitialState(): CartState {
  if (typeof window === 'undefined') return { items: [] }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    if (parsed && Array.isArray(parsed.items)) {
      return { items: parsed.items }
    }
  } catch {
    // Ignore malformed/corrupt localStorage payloads and start fresh.
  }
  return { items: [] }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (item) => item.productId === action.item.productId
      )
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === action.item.productId
              ? { ...item, quantity: item.quantity + action.item.quantity }
              : item
          ),
        }
      }
      return { items: [...state.items, action.item] }
    }
    case 'REMOVE_ITEM':
      return {
        items: state.items.filter(
          (item) => item.productId !== action.productId
        ),
      }
    case 'SET_QUANTITY': {
      if (action.quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => item.productId !== action.productId
          ),
        }
      }
      return {
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: action.quantity }
            : item
        ),
      }
    }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

type CartContextValue = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  subtotal: number
  totalQuantity: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, readInitialState)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const totalQuantity = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    )

    return {
      items: state.items,
      addItem: (product, quantity = 1) =>
        dispatch({
          type: 'ADD_ITEM',
          item: {
            productId: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            imageKey: product.image_key,
            slug: product.slug,
            quantity,
          },
        }),
      removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
      setQuantity: (productId, quantity) =>
        dispatch({ type: 'SET_QUANTITY', productId, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
      subtotal,
      totalQuantity,
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
