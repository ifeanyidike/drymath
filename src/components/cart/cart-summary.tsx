'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'
import { useCart } from '@/contexts/cart-context'
import { formatCurrency } from '@/lib/utils'

export function CartSummary() {
  const { items, totalItems, subtotal, clearCart, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Your cart is empty</p>
          <p className="text-xs text-slate-400 mt-1">Add items to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">
          Cart ({totalItems})
        </span>
        <button
          onClick={clearCart}
          className="text-xs text-slate-500 hover:text-red-600 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.serviceItem.id} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {item.serviceItem.name}
              </p>
              <p className="text-xs text-slate-500">
                {formatCurrency(item.serviceItem.price.toString())} x {item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={item.quantity}
                onChange={(e) => updateQuantity(item.serviceItem.id, Number(e.target.value))}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <button
                onClick={() => removeItem(item.serviceItem.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Delivery</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      <div className="p-4 pt-0">
        <Link href="/booking">
          <Button className="w-full">
            Continue
          </Button>
        </Link>
      </div>
    </div>
  )
}
