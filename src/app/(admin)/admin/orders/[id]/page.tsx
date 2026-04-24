import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'
import { OrderStatusUpdater } from './order-status-updater'

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Order Details | Admin | DryMath`,
    description: `Manage order ${id}`,
  }
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: {
        include: {
          serviceItem: {
            include: {
              service: true,
            },
          },
        },
      },
      payment: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
        include: {
          order: false,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-block">
          &larr; Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Created {format(new Date(order.createdAt), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)} w-fit`}>
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{order.user.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Customer Since</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{format(new Date(order.user.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Item</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Service</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Qty</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {item.serviceItem.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {item.serviceItem.service.name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-900 text-right">
                        {formatCurrency(item.unitPrice.toString())}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900 text-right">
                        {formatCurrency(item.subtotal.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Pickup</p>
                  <p className="text-sm font-medium text-slate-900">
                    {format(new Date(order.pickupDate), 'EEE, MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-500">{order.pickupSlot}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Delivery</p>
                  <p className="text-sm font-medium text-slate-900">
                    {format(new Date(order.deliveryDate), 'EEE, MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-500">{order.deliverySlot}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Status History</h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex items-start gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${index === 0 ? 'bg-green-500' : 'bg-slate-300'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{getStatusLabel(history.status)}</p>
                      {history.note && <p className="text-sm text-slate-500 mt-0.5">{history.note}</p>}
                      <p className="text-xs text-slate-400 mt-1">
                        {format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Update Status */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

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
              {order.address.postalCode && (
                <p className="text-sm text-slate-500">{order.address.postalCode}</p>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">{formatCurrency(order.subtotal.toString())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="text-slate-900">
                  {Number(order.deliveryFee) === 0 ? 'FREE' : formatCurrency(order.deliveryFee.toString())}
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
                    : order.payment?.status === 'REFUNDED'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment?.status === 'SUCCESS' ? 'Paid' : order.payment?.status === 'REFUNDED' ? 'Refunded' : 'Pending'}
                </span>
              </div>
              {order.payment?.paidAt && (
                <p className="text-xs text-slate-500">
                  Paid on {format(new Date(order.payment.paidAt), 'MMM d, yyyy h:mm a')}
                </p>
              )}
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
