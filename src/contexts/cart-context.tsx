'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ServiceItem } from '@prisma/client'

export type CartServiceItem = Omit<ServiceItem, 'price'> & { price: number }

export interface CartItem {
  serviceItem: CartServiceItem
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  serviceId: string | null
  addItem: (item: CartServiceItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (itemId: string) => number
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'drymath_cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(parsed.items || [])
        setServiceId(parsed.serviceId || null)
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, serviceId }))
    }
  }, [items, serviceId, isLoaded])

  function addItem(serviceItem: CartServiceItem) {
    setItems((prevItems) => {
      // Check if item already exists
      const existingIndex = prevItems.findIndex(
        (item) => item.serviceItem.id === serviceItem.id
      )

      if (existingIndex >= 0) {
        // Increment quantity
        const newItems = [...prevItems]
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        }
        return newItems
      }

      // Add new item
      return [...prevItems, { serviceItem, quantity: 1 }]
    })

    // Set service ID if not set
    if (!serviceId) {
      setServiceId(serviceItem.serviceId)
    }
  }

  function removeItem(itemId: string) {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.serviceItem.id !== itemId)
      if (newItems.length === 0) {
        setServiceId(null)
      }
      return newItems
    })
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.serviceItem.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  function clearCart() {
    setItems([])
    setServiceId(null)
  }

  function getItemQuantity(itemId: string): number {
    const item = items.find((item) => item.serviceItem.id === itemId)
    return item?.quantity || 0
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const subtotal = items.reduce(
    (sum, item) => sum + item.serviceItem.price * item.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items,
        serviceId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
