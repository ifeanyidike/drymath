import { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Orders | Admin | DryMath',
  description: 'Manage all orders',
}

interface OrdersPageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status, page = '1' } = await searchParams

  const pageNum = parseInt(page)
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (status === 'pending') {
    where.status = OrderStatus.PENDING
  } else if (status === 'in_progress') {
    where.status = {
      in: [OrderStatus.CONFIRMED, OrderStatus.PICKED_UP, OrderStatus.WASHING, OrderStatus.DRYING, OrderStatus.IRONING, OrderStatus.READY],
    }
  } else if (status === 'completed') {
    where.status = OrderStatus.DELIVERED
  } else if (status === 'cancelled') {
    where.status = OrderStatus.CANCELLED
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * perPage,
      take: perPage,
      include: {
        user: true,
        payment: true,
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const statusFilters = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track all orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {statusFilters.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/orders${filter.value ? `?status=${filter.value}` : ''}`}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              (status || '') === filter.value
                ? 'bg-green-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Order</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Items</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Payment</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-green-600 hover:text-green-700">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-900">{order.user.name}</p>
                    <p className="text-xs text-slate-500">{order.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {order.items.length} items
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.payment?.status === 'SUCCESS'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment?.status === 'SUCCESS' ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-900">
                    {formatCurrency(order.totalAmount.toString())}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {(pageNum - 1) * perPage + 1} to {Math.min(pageNum * perPage, total)} of {total}
            </p>
            <div className="flex gap-2">
              {pageNum > 1 && (
                <Link
                  href={`/admin/orders?page=${pageNum - 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-300"
                >
                  Previous
                </Link>
              )}
              {pageNum < totalPages && (
                <Link
                  href={`/admin/orders?page=${pageNum + 1}${status ? `&status=${status}` : ''}`}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:border-slate-300"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
