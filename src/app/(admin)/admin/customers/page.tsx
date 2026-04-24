import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Customers | Admin | DryMath',
  description: 'View all customers',
}

interface CustomersPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const { search } = await searchParams

  const where: Record<string, unknown> = { role: 'CUSTOMER' }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }

  const customers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true, totalAmount: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">View and search customer database</p>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search || ''}
          placeholder="Search by name, email, or phone..."
          className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <button
          type="submit"
          className="h-10 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-sm text-slate-500">Total Customers</p>
        <p className="text-2xl font-semibold text-slate-900 mt-1">{customers.length}</p>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Contact</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Orders</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Last Order</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {customer.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{customer.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">ID: {customer.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-900">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-xs text-slate-500 mt-0.5">{customer.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-medium text-slate-900">{customer._count.orders}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {customer.orders[0] ? formatDate(customer.orders[0].createdAt) : 'Never'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(customer.createdAt)}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
