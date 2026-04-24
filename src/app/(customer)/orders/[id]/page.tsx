import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getCurrentUser } from '@/actions/auth'
import { getOrder } from '@/actions/orders'
import { Button } from '@/components/ui'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment?: string }>
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order Details | DryMath`,
    description: `View order ${id} details`,
  }
}

const statusOrder: OrderStatus[] = [
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

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const { id } = await params
  const { payment } = await searchParams

  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  // Verify payment if coming from Paystack
  if (payment === 'success' && order.payment?.status === 'PENDING') {
    // Trigger payment verification
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify?reference=${order.payment.reference}`)
  }

  const currentStatusIndex = statusOrder.indexOf(order.status as OrderStatus)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
          &larr; Back to Orders
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {payment === 'success' && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-100 p-4 text-green-700">
          <p className="font-medium">Payment successful!</p>
          <p className="text-sm mt-1">Your order has been confirmed.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Order Progress</h2>
            </div>
            <div className="p-5">
              <div className="relative">
                {statusOrder.slice(0, -1).map((status, index) => {
                  const isCompleted = index < currentStatusIndex
                  const isCurrent = index === currentStatusIndex
                  const isLast = index === statusOrder.length - 2

                  return (
                    <div key={status} className="flex items-start mb-4 last:mb-0">
                      <div className="flex flex-col items-center mr-4">
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-green-500' : 'bg-slate-200'
                        }`} />
                        {!isLast && (
                          <div className={`w-0.5 h-8 mt-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isCurrent ? 'text-green-600' : isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                          {getStatusLabel(status)}
                        </p>
                        {order.statusHistory.find(h => h.status === status) && (
                          <p className="text-xs text-slate-500">
                            {format(
                              new Date(order.statusHistory.find(h => h.status === status)!.createdAt),
                              'MMM d, h:mm a'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="p-5">
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.serviceItem.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatCurrency(item.unitPrice.toString())} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      {formatCurrency(item.subtotal.toString())}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Pickup</p>
                  <p className="text-sm font-medium text-slate-900">{format(new Date(order.pickupDate), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-slate-500">{order.pickupSlot}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Delivery</p>
                  <p className="text-sm font-medium text-slate-900">{format(new Date(order.deliveryDate), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-sm text-slate-500">{order.deliverySlot}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Address */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Address</h2>
            </div>
            <div className="p-5">
              <p className="text-sm font-medium text-slate-900">{order.address.label}</p>
              <p className="text-sm text-slate-500 mt-1">{order.address.street}</p>
              <p className="text-sm text-slate-500">
                {order.address.city}, {order.address.state}
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Payment Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">{formatCurrency(order.subtotal.toString())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="text-slate-900">
                  {Number(order.deliveryFee) === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatCurrency(order.deliveryFee.toString())
                  )}
                </span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-green-600">-{formatCurrency(order.discount.toString())}</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-slate-900">Total</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(order.totalAmount.toString())}</span>
              </div>
              <div className="pt-2">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                  order.payment?.status === 'SUCCESS'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment?.status === 'SUCCESS' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.specialInstructions) && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
              </div>
              <div className="p-5 space-y-3">
                {order.notes && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Order Notes</p>
                    <p className="text-sm text-slate-700 mt-1">{order.notes}</p>
                  </div>
                )}
                {order.specialInstructions && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Special Instructions</p>
                    <p className="text-sm text-slate-700 mt-1">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
