import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { ServicesContent } from './services-content'

export const metadata: Metadata = {
  title: 'Services | Admin | DryMath',
  description: 'Manage services and pricing',
}

export default async function AdminServicesPage() {
  const servicesData = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
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
