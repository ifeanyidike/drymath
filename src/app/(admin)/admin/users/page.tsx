import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { UsersContent } from './users-content'

export const metadata: Metadata = {
  title: 'Users | Admin | DryMath',
  description: 'Manage staff and driver accounts',
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'STAFF', 'DRIVER'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <UsersContent users={users} />
}
