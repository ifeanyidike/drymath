import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { getAddresses } from '@/actions/addresses'
import { BookingContent } from './booking-content'

export const metadata: Metadata = {
  title: 'Schedule Pickup | DryMath',
  description: 'Schedule your laundry pickup and delivery.',
}

export default async function BookingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/booking')
  }

  const [addresses, timeSlots] = await Promise.all([
    getAddresses(),
    prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' },
    }),
  ])

  return <BookingContent addresses={addresses} timeSlots={timeSlots} />
}
