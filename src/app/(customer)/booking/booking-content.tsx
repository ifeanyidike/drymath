'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addDays, format } from 'date-fns'
import { Button } from '@/components/ui'
import { DatePicker } from '@/components/booking/date-picker'
import { TimeSlotPicker } from '@/components/booking/time-slot-picker'
import { useCart } from '@/contexts/cart-context'
import { Address, TimeSlot } from '@prisma/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface BookingContentProps {
  addresses: Address[]
  timeSlots: TimeSlot[]
}

export function BookingContent({ addresses, timeSlots }: BookingContentProps) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find(a => a.isDefault)?.id || addresses[0]?.id || ''
  )
  const [pickupDate, setPickupDate] = useState<Date | null>(null)
  const [pickupSlot, setPickupSlot] = useState<string | null>(null)
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [deliverySlot, setDeliverySlot] = useState<string | null>(null)

  // Calculate minimum delivery date based on pickup date (at least 2 days after pickup)
  const minDeliveryDate = pickupDate ? addDays(pickupDate, 2) : addDays(new Date(), 3)

  // Reset delivery date if it's before the new minimum
  useEffect(() => {
    if (deliveryDate && pickupDate && deliveryDate < minDeliveryDate) {
      setDeliveryDate(null)
      setDeliverySlot(null)
    }
  }, [pickupDate, deliveryDate, minDeliveryDate])

  // Check if cart is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h2>
        <p className="text-sm text-slate-500 mb-6">Add some items before scheduling a pickup.</p>
        <Link href="/services">
          <Button>Browse Services</Button>
        </Link>
      </div>
    )
  }

  // Check if no addresses
  if (addresses.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">No address found</h2>
        <p className="text-sm text-slate-500 mb-6">Please add an address before scheduling a pickup.</p>
        <Link href="/addresses">
          <Button>Add Address</Button>
        </Link>
      </div>
    )
  }

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)
  const isComplete = selectedAddressId && pickupDate && pickupSlot && deliveryDate && deliverySlot

  function handleProceedToCheckout() {
    if (!isComplete) return

    // Store booking details in sessionStorage for checkout
    sessionStorage.setItem('booking', JSON.stringify({
      addressId: selectedAddressId,
      pickupDate: pickupDate?.toISOString(),
      pickupSlot,
      deliveryDate: deliveryDate?.toISOString(),
      deliverySlot,
    }))

    router.push('/checkout')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link href="/services" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
          &larr; Back to Services
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Schedule Your Pickup</h1>
        <p className="text-sm text-slate-500 mt-1">Select your address and preferred pickup & delivery times</p>
      </div>

      <div className="space-y-6">
        {/* Address Selection */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Pickup & Delivery Address</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={cn(
                    'flex flex-col items-start p-4 rounded-lg border-2 text-left transition-colors',
                    selectedAddressId === address.id
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <span className="text-sm font-medium text-slate-900">{address.label}</span>
                  <span className="text-sm text-slate-500 mt-1">{address.street}</span>
                  <span className="text-sm text-slate-500">
                    {address.city}, {address.state}
                  </span>
                </button>
              ))}
            </div>
            <Link href="/addresses" className="inline-block mt-4 text-sm text-green-600 hover:text-green-700">
              + Add new address
            </Link>
          </div>
        </div>

        {/* Pickup Schedule */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Pickup Schedule</h2>
          </div>
          <div className="p-5 space-y-6">
            <DatePicker
              selectedDate={pickupDate}
              onSelectDate={setPickupDate}
              minDate={addDays(new Date(), 1)}
              label="Select Pickup Date"
            />

            {pickupDate && (
              <TimeSlotPicker
                slots={timeSlots}
                selectedSlot={pickupSlot}
                onSelectSlot={setPickupSlot}
                label="Select Pickup Time"
              />
            )}
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Delivery Schedule</h2>
          </div>
          <div className="p-5 space-y-6">
            {!pickupDate ? (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500">
                Please select a pickup date first
              </div>
            ) : (
              <>
                <DatePicker
                  selectedDate={deliveryDate}
                  onSelectDate={setDeliveryDate}
                  minDate={minDeliveryDate}
                  label="Select Delivery Date"
                />

                {deliveryDate && (
                  <TimeSlotPicker
                    slots={timeSlots}
                    selectedSlot={deliverySlot}
                    onSelectSlot={setDeliverySlot}
                    label="Select Delivery Time"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Summary & Continue */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="font-medium text-slate-900">{items.length} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {selectedAddress && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Address</span>
                  <span className="font-medium text-slate-900">{selectedAddress.label}</span>
                </div>
              )}
              {pickupDate && pickupSlot && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pickup</span>
                  <span className="font-medium text-slate-900">{format(pickupDate, 'MMM d')} - {pickupSlot}</span>
                </div>
              )}
              {deliveryDate && deliverySlot && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery</span>
                  <span className="font-medium text-slate-900">{format(deliveryDate, 'MMM d')} - {deliverySlot}</span>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleProceedToCheckout}
              disabled={!isComplete}
            >
              Continue to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
