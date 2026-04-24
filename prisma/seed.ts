import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin User
  const adminEmail = 'lorddickson751@gmail.com'

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('Admin user created/updated:', adminUser.email)

  // Create Services
  const washAndFold = await prisma.service.upsert({
    where: { slug: 'wash-and-fold' },
    update: {},
    create: {
      name: 'Wash & Fold',
      slug: 'wash-and-fold',
      description: 'Professional washing and folding service for your everyday clothes. We handle everything from sorting to folding with care.',
      image: '/images/services/wash-fold.jpg',
      isActive: true,
      sortOrder: 1,
    },
  })

  const dryCleaning = await prisma.service.upsert({
    where: { slug: 'dry-cleaning' },
    update: {},
    create: {
      name: 'Dry Cleaning',
      slug: 'dry-cleaning',
      description: 'Expert dry cleaning for delicate fabrics, suits, dresses, and formal wear. Your garments are treated with the utmost care.',
      image: '/images/services/dry-cleaning.jpg',
      isActive: true,
      sortOrder: 2,
    },
  })

  console.log('Services created:', { washAndFold, dryCleaning })

  // Create Service Items for Wash & Fold
  const washFoldItems = [
    { name: 'T-Shirt', price: 500, unit: 'item', sortOrder: 1 },
    { name: 'Shirt', price: 600, unit: 'item', sortOrder: 2 },
    { name: 'Trousers/Pants', price: 700, unit: 'item', sortOrder: 3 },
    { name: 'Jeans', price: 800, unit: 'item', sortOrder: 4 },
    { name: 'Shorts', price: 500, unit: 'item', sortOrder: 5 },
    { name: 'Underwear', price: 200, unit: 'item', sortOrder: 6 },
    { name: 'Socks (pair)', price: 150, unit: 'pair', sortOrder: 7 },
    { name: 'Towel (Small)', price: 400, unit: 'item', sortOrder: 8 },
    { name: 'Towel (Large)', price: 600, unit: 'item', sortOrder: 9 },
    { name: 'Bed Sheet (Single)', price: 800, unit: 'item', sortOrder: 10 },
    { name: 'Bed Sheet (Double)', price: 1200, unit: 'item', sortOrder: 11 },
    { name: 'Pillowcase', price: 300, unit: 'item', sortOrder: 12 },
    { name: 'Duvet Cover', price: 1500, unit: 'item', sortOrder: 13 },
  ]

  for (const item of washFoldItems) {
    await prisma.serviceItem.upsert({
      where: {
        serviceId_name: {
          serviceId: washAndFold.id,
          name: item.name,
        },
      },
      update: { price: item.price, sortOrder: item.sortOrder },
      create: {
        serviceId: washAndFold.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    })
  }

  console.log('Wash & Fold items created')

  // Create Service Items for Dry Cleaning
  const dryCleaningItems = [
    { name: 'Suit (2-piece)', price: 3500, unit: 'item', sortOrder: 1 },
    { name: 'Suit (3-piece)', price: 4500, unit: 'item', sortOrder: 2 },
    { name: 'Blazer/Jacket', price: 2000, unit: 'item', sortOrder: 3 },
    { name: 'Dress Shirt', price: 1000, unit: 'item', sortOrder: 4 },
    { name: 'Dress', price: 2500, unit: 'item', sortOrder: 5 },
    { name: 'Evening Gown', price: 4000, unit: 'item', sortOrder: 6 },
    { name: 'Skirt', price: 1200, unit: 'item', sortOrder: 7 },
    { name: 'Coat/Overcoat', price: 3000, unit: 'item', sortOrder: 8 },
    { name: 'Tie', price: 500, unit: 'item', sortOrder: 9 },
    { name: 'Silk Blouse', price: 1500, unit: 'item', sortOrder: 10 },
    { name: 'Leather Jacket', price: 5000, unit: 'item', sortOrder: 11 },
    { name: 'Wedding Dress', price: 15000, unit: 'item', sortOrder: 12 },
    { name: 'Curtains (per panel)', price: 2000, unit: 'item', sortOrder: 13 },
  ]

  for (const item of dryCleaningItems) {
    await prisma.serviceItem.upsert({
      where: {
        serviceId_name: {
          serviceId: dryCleaning.id,
          name: item.name,
        },
      },
      update: { price: item.price, sortOrder: item.sortOrder },
      create: {
        serviceId: dryCleaning.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    })
  }

  console.log('Dry Cleaning items created')

  // Create Time Slots
  const timeSlots = [
    { startTime: '08:00', endTime: '10:00', label: 'Morning (8AM - 10AM)', maxOrders: 10 },
    { startTime: '10:00', endTime: '12:00', label: 'Late Morning (10AM - 12PM)', maxOrders: 10 },
    { startTime: '12:00', endTime: '14:00', label: 'Afternoon (12PM - 2PM)', maxOrders: 10 },
    { startTime: '14:00', endTime: '16:00', label: 'Late Afternoon (2PM - 4PM)', maxOrders: 10 },
    { startTime: '16:00', endTime: '18:00', label: 'Evening (4PM - 6PM)', maxOrders: 10 },
    { startTime: '18:00', endTime: '20:00', label: 'Late Evening (6PM - 8PM)', maxOrders: 8 },
  ]

  for (const slot of timeSlots) {
    await prisma.timeSlot.upsert({
      where: {
        startTime_endTime: {
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      },
      update: { label: slot.label, maxOrders: slot.maxOrders },
      create: {
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
        maxOrders: slot.maxOrders,
        isActive: true,
      },
    })
  }

  console.log('Time slots created')

  // Create default settings
  const defaultSettings = [
    {
      key: 'delivery_fee',
      value: { amount: 1000, freeAbove: 10000 },
    },
    {
      key: 'minimum_order',
      value: { amount: 2000 },
    },
    {
      key: 'business_hours',
      value: {
        monday: { open: '08:00', close: '20:00', isOpen: true },
        tuesday: { open: '08:00', close: '20:00', isOpen: true },
        wednesday: { open: '08:00', close: '20:00', isOpen: true },
        thursday: { open: '08:00', close: '20:00', isOpen: true },
        friday: { open: '08:00', close: '20:00', isOpen: true },
        saturday: { open: '09:00', close: '18:00', isOpen: true },
        sunday: { open: '10:00', close: '16:00', isOpen: false },
      },
    },
    {
      key: 'processing_days',
      value: { washAndFold: 2, dryCleaning: 3 },
    },
  ]

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
      },
    })
  }

  console.log('Settings created')

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
