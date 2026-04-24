'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client'
import { sendOrderStatusUpdateEmail, sendRefundNotificationEmail, sendDeliveryNotificationEmail } from '@/lib/email'
import { getStatusLabel, formatCurrency } from '@/lib/utils'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', user: null }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'STAFF')) {
    return { error: 'Not authorized', user: null }
  }

  return { error: null, user: dbUser }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const { error, user } = await checkAdmin()
  if (error) return { error }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true },
    })

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status,
        note,
        createdBy: user!.id,
      },
    })

    // Send status update email
    if (order.user.email) {
      if (status === OrderStatus.OUT_FOR_DELIVERY) {
        sendDeliveryNotificationEmail(
          order.user.email,
          order.user.name || 'Customer',
          order.orderNumber,
          order.deliverySlot
        ).catch(console.error)
      } else {
        sendOrderStatusUpdateEmail(
          order.user.email,
          order.user.name || 'Customer',
          order.orderNumber,
          status,
          getStatusLabel(status)
        ).catch(console.error)
      }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (err) {
    console.error('Failed to update order status:', err)
    return { error: 'Failed to update order status' }
  }
}

export async function processRefund(orderId: string, reason: string) {
  const { error, user } = await checkAdmin()
  if (error) return { error }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, user: true },
    })

    if (!order || !order.payment) {
      return { error: 'Order or payment not found' }
    }

    if (order.payment.status !== PaymentStatus.SUCCESS) {
      return { error: 'Payment was not successful, cannot refund' }
    }

    // Update payment status to refunded
    await prisma.payment.update({
      where: { id: order.payment.id },
      data: { status: PaymentStatus.REFUNDED },
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    })

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        status: OrderStatus.CANCELLED,
        note: `Refunded: ${reason}`,
        createdBy: user!.id,
      },
    })

    // Send refund notification email
    if (order.user.email) {
      sendRefundNotificationEmail(
        order.user.email,
        order.user.name || 'Customer',
        order.orderNumber,
        formatCurrency(order.totalAmount.toString()),
        reason
      ).catch(console.error)
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (err) {
    console.error('Failed to process refund:', err)
    return { error: 'Failed to process refund' }
  }
}

export async function updateServiceItemPrice(itemId: string, price: number) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    await prisma.serviceItem.update({
      where: { id: itemId },
      data: { price },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    return { success: true }
  } catch (err) {
    console.error('Failed to update price:', err)
    return { error: 'Failed to update price' }
  }
}

export async function toggleServiceItemActive(itemId: string, isActive: boolean) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    await prisma.serviceItem.update({
      where: { id: itemId },
      data: { isActive },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    return { success: true }
  } catch (err) {
    console.error('Failed to toggle service item:', err)
    return { error: 'Failed to toggle service item' }
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const { error, user } = await checkAdmin()
  if (error) return { error }

  if (user!.role !== 'ADMIN') {
    return { error: 'Only admins can change user roles' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    })

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    console.error('Failed to update user role:', err)
    return { error: 'Failed to update user role' }
  }
}

export async function getCustomers(search?: string) {
  const { error } = await checkAdmin()
  if (error) return []

  const where: Record<string, unknown> = { role: 'CUSTOMER' }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const customers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return customers
}

export async function getUsers() {
  const { error, user } = await checkAdmin()
  if (error) return []

  if (user!.role !== 'ADMIN') {
    return []
  }

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'STAFF', 'DRIVER'] },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users
}

// Service CRUD operations
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createService(data: { name: string; description: string }) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    const slug = generateSlug(data.name)

    // Check if slug already exists
    const existing = await prisma.service.findUnique({ where: { slug } })
    if (existing) {
      return { error: 'A service with this name already exists' }
    }

    // Get max sort order
    const maxOrder = await prisma.service.aggregate({ _max: { sortOrder: true } })
    const sortOrder = (maxOrder._max.sortOrder || 0) + 1

    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        isActive: true,
        sortOrder,
      },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true, service }
  } catch (err) {
    console.error('Failed to create service:', err)
    return { error: 'Failed to create service' }
  }
}

export async function updateService(serviceId: string, data: { name: string; description: string; isActive: boolean }) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Failed to update service:', err)
    return { error: 'Failed to update service' }
  }
}

export async function deleteService(serviceId: string) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    // Check if service has any order items
    const orderItems = await prisma.orderItem.count({
      where: { serviceItem: { serviceId } },
    })

    if (orderItems > 0) {
      return { error: 'Cannot delete service with existing orders. Deactivate it instead.' }
    }

    // Delete service items first
    await prisma.serviceItem.deleteMany({ where: { serviceId } })

    // Delete service
    await prisma.service.delete({ where: { id: serviceId } })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Failed to delete service:', err)
    return { error: 'Failed to delete service' }
  }
}

export async function createServiceItem(data: {
  serviceId: string
  name: string
  description?: string
  price: number
  unit: string
}) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    // Get max sort order for this service
    const maxOrder = await prisma.serviceItem.aggregate({
      where: { serviceId: data.serviceId },
      _max: { sortOrder: true },
    })
    const sortOrder = (maxOrder._max.sortOrder || 0) + 1

    const item = await prisma.serviceItem.create({
      data: {
        serviceId: data.serviceId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        unit: data.unit,
        sortOrder,
        isActive: true,
      },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true, item }
  } catch (err) {
    console.error('Failed to create service item:', err)
    return { error: 'Failed to create service item' }
  }
}

export async function updateServiceItem(itemId: string, data: {
  name: string
  description?: string
  price: number
  unit: string
  isActive: boolean
}) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    await prisma.serviceItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        unit: data.unit,
        isActive: data.isActive,
      },
    })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Failed to update service item:', err)
    return { error: 'Failed to update service item' }
  }
}

export async function deleteServiceItem(itemId: string) {
  const { error } = await checkAdmin()
  if (error) return { error }

  try {
    // Check if item has any order items
    const orderItems = await prisma.orderItem.count({
      where: { serviceItemId: itemId },
    })

    if (orderItems > 0) {
      return { error: 'Cannot delete item with existing orders. Deactivate it instead.' }
    }

    await prisma.serviceItem.delete({ where: { id: itemId } })

    revalidatePath('/admin/services')
    revalidatePath('/services')
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('Failed to delete service item:', err)
    return { error: 'Failed to delete service item' }
  }
}
