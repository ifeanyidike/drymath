'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui'
import { useCart } from '@/contexts/cart-context'
import { createOrder } from '@/actions/orders'
import { formatCurrency } from '@/lib/utils'
import { User } from '@prisma/client'

interface CheckoutContentProps {
  user: User
}

interface BookingData {
  addressId: string
  pickupDate: string
  pickupSlot: string
  deliveryDate: string
  deliverySlot: string
}

export function CheckoutContent({ user }: CheckoutContentProps) {
  const { items, subtotal, clearCart } = useCart()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [notes, setNotes] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load booking data from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem('booking')
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBooking(JSON.parse(stored))
    }
  }, [])

  // Calculate delivery fee
  const deliveryFee = subtotal >= 10000 ? 0 : 1000
  const totalAmount = subtotal + deliveryFee

  // Redirect if no items or booking
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add some items before checking out.</p>
        <Link href="/services">
          <Button>Browse Services</Button>
        </Link>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">No booking found</h2>
        <p className="text-sm text-slate-500 mb-6">Please schedule a pickup first.</p>
        <Link href="/booking">
          <Button>Schedule Pickup</Button>
        </Link>
      </div>
    )
  }

  async function handlePayment() {
    if (!booking) return

    setIsLoading(true)
    setError(null)

    // Create order
    const orderResult = await createOrder({
      addressId: booking.addressId,
      pickupDate: booking.pickupDate,
      pickupSlot: booking.pickupSlot,
      deliveryDate: booking.deliveryDate,
      deliverySlot: booking.deliverySlot,
      items: items.map(item => ({
        serviceItemId: item.serviceItem.id,
        quantity: item.quantity,
        unitPrice: item.serviceItem.price,
      })),
      notes,
      specialInstructions,
    })

    if (orderResult.error) {
      setError(orderResult.error)
      setIsLoading(false)
      return
    }

    // Initialize Paystack payment
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderResult.order!.id,
          reference: orderResult.payment!.reference,
          email: user.email,
          amount: totalAmount * 100, // Convert to kobo
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsLoading(false)
        return
      }

      // Clear cart and booking data
      clearCart()
      sessionStorage.removeItem('booking')

      // Redirect to Paystack
      window.location.href = data.authorization_url
    } catch {
      setError('Failed to initialize payment')
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link href="/booking" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
          &larr; Back to Booking
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Review your order and complete payment</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-100 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="p-5">
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.serviceItem.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.serviceItem.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(item.serviceItem.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(item.serviceItem.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Summary */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pickup</p>
                  <p className="text-sm font-medium text-slate-900">{format(new Date(booking.pickupDate), 'EEE, MMM d')}</p>
                  <p className="text-sm text-slate-500">{booking.pickupSlot}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Delivery</p>
                  <p className="text-sm font-medium text-slate-900">{format(new Date(booking.deliveryDate), 'EEE, MMM d')}</p>
                  <p className="text-sm text-slate-500">{booking.deliverySlot}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Additional Information</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  rows={2}
                  placeholder="Any additional notes for the order..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  rows={2}
                  placeholder="Special care instructions for your clothes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 sticky top-24">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
            </div>
            <div className="p-5">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Fee</span>
                  <span className="font-medium text-slate-900">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-slate-500">
                    Free delivery on orders above {formatCurrency(10000)}
                  </p>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-semibold text-lg text-slate-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                isLoading={isLoading}
              >
                Pay {formatCurrency(totalAmount)}
              </Button>

              <div className="mt-4 text-center text-xs text-slate-500">
                Secured by Paystack
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
