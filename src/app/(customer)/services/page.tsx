import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { ServicesContent } from './services-content'

export const metadata: Metadata = {
  title: 'Services & Pricing | DryMath',
  description: 'View our laundry and dry cleaning services and pricing.',
}

export default async function ServicesPage() {
  const servicesData = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Serialize Decimal to number for client component
  const services = servicesData.map(service => ({
    ...service,
    items: service.items.map(item => ({
      ...item,
      price: Number(item.price),
    })),
  }))

  return <ServicesContent services={services} />
}
