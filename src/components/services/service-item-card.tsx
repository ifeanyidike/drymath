'use client'

import { Button } from '@/components/ui'
import { useCart, type CartServiceItem } from '@/contexts/cart-context'
import { formatCurrency } from '@/lib/utils'

interface ServiceItemCardProps {
  item: CartServiceItem
}

export function ServiceItemCard({ item }: ServiceItemCardProps) {
  const { addItem, removeItem, updateQuantity, getItemQuantity, serviceId } = useCart()

  const quantity = getItemQuantity(item.id)
  const isFromDifferentService = serviceId && serviceId !== item.serviceId

  function handleAdd() {
    if (isFromDifferentService) {
      if (!confirm('Adding items from a different service will clear your current cart. Continue?')) {
        return
      }
    }
    addItem(item)
  }

  function handleIncrement() {
    updateQuantity(item.id, quantity + 1)
  }

  function handleDecrement() {
    if (quantity === 1) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, quantity - 1)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-slate-900">{item.name}</span>
          <span className="text-sm text-slate-500">
            {formatCurrency(item.price)}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
        )}
      </div>

      {quantity === 0 ? (
        <Button
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={Boolean(isFromDifferentService && serviceId)}
          className="shrink-0"
        >
          Add
        </Button>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDecrement}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-8 text-center text-sm font-medium text-slate-900">{quantity}</span>
          <button
            onClick={handleIncrement}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
