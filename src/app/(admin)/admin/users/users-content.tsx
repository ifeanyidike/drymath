'use client'

import { useState } from 'react'
import { updateUserRole } from '@/actions/admin'
import { formatDate } from '@/lib/utils'
import { User, UserRole } from '@prisma/client'

interface UsersContentProps {
  users: User[]
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  STAFF: 'bg-blue-100 text-blue-700',
  DRIVER: 'bg-green-100 text-green-700',
  CUSTOMER: 'bg-slate-100 text-slate-700',
}

export function UsersContent({ users }: UsersContentProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setIsLoading(userId)
    setError(null)

    const result = await updateUserRole(userId, newRole)

    if (result.error) {
      setError(result.error)
    }

    setIsLoading(null)
  }

  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const staffCount = users.filter((u) => u.role === 'STAFF').length
  const driverCount = users.filter((u) => u.role === 'DRIVER').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">Manage staff, drivers, and admin accounts</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{adminCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Staff</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{staffCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm text-slate-500">Drivers</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{driverCount}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">All Team Members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Contact</th>
                <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Joined</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-slate-600">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-900">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-slate-500 mt-0.5">{user.phone}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      disabled={isLoading === user.id}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="STAFF">Staff</option>
                      <option value="DRIVER">Driver</option>
                      <option value="CUSTOMER">Customer</option>
                    </select>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Role Permissions</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors.ADMIN}`}>Admin</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Full access to all features including user management, pricing, and all orders.</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors.STAFF}`}>Staff</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Can view and update order statuses, manage pricing, and view customer information.</p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${roleColors.DRIVER}`}>Driver</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Can view assigned orders and update pickup/delivery statuses.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
