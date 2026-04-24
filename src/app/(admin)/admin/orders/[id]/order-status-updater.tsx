'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { updateOrderStatus, processRefund } from '@/actions/admin'
import { OrderStatus } from '@prisma/client'
import { getStatusLabel } from '@/lib/utils'

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: string
}

const statusFlow: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PICKED_UP,
  OrderStatus.WASHING,
  OrderStatus.DRYING,
  OrderStatus.IRONING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
]

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundReason, setRefundReason] = useState('')

  const currentIndex = statusFlow.indexOf(currentStatus as OrderStatus)
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null

  async function handleStatusUpdate(status: OrderStatus) {
    setIsLoading(true)
    setError(null)

    const result = await updateOrderStatus(orderId, status)

    if (result.error) {
      setError(result.error)
    }

    setIsLoading(false)
  }

  async function handleRefund() {
    if (!refundReason.trim()) {
      setError('Please provide a reason for the refund')
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await processRefund(orderId, refundReason)

    if (result.error) {
      setError(result.error)
    } else {
      setShowRefundForm(false)
      setRefundReason('')
    }

    setIsLoading(false)
  }

  if (currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.CANCELLED) {
    return (
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Order Complete</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-500">
            This order has been {currentStatus === OrderStatus.DELIVERED ? 'delivered' : 'cancelled'}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Update Status</h2>
      </div>
      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!showRefundForm ? (
          <div className="space-y-3">
            {nextStatus && (
              <Button
                className="w-full"
                onClick={() => handleStatusUpdate(nextStatus)}
                isLoading={isLoading}
              >
                Mark as {getStatusLabel(nextStatus)}
              </Button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or select status</span>
              </div>
            </div>

            <select
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleStatusUpdate(e.target.value as OrderStatus)
                }
              }}
              disabled={isLoading}
            >
              <option value="">Select status...</option>
              {statusFlow.map((status) => (
                <option key={status} value={status} disabled={status === currentStatus}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
              onClick={() => setShowRefundForm(true)}
            >
              Process Refund
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Are you sure you want to process a refund? This will cancel the order.
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRefundForm(false)
                  setRefundReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRefund}
                isLoading={isLoading}
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
