import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { AdminSidebar } from './admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar user={user} />

      <div className="lg:pl-64">
        <main className="py-6 pt-20 lg:pt-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
