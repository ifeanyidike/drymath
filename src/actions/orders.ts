'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateOrderNumber, generatePaymentReference, formatCurrency } from '@/lib/utils'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { sendOrderConfirmationEmail } from '@/lib/email'
import { format } from 'date-fns'

interface OrderItem {
  serviceItemId: string
  quantity: number
  unitPrice: number
}

interface CreateOrderInput {
  addressId: string
  pickupDate: string
  pickupSlot: string
  deliveryDate: string
  deliverySlot: string
  items: OrderItem[]
  notes?: string
  specialInstructions?: string
}

export async function createOrder(input: CreateOrderInput) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { addressId, pickupDate, pickupSlot, deliveryDate, deliverySlot, items, notes, specialInstructions } = input

  // Validate address belongs to user
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  })

  if (!address) {
    return { error: 'Address not found' }
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

  // Get delivery fee settings
  const deliveryFeeSetting = await prisma.settings.findUnique({
    where: { key: 'delivery_fee' },
  })

  let deliveryFee = 1000 // Default fee
  if (deliveryFeeSetting) {
    const settings = deliveryFeeSetting.value as { amount: number; freeAbove: number }
    deliveryFee = subtotal >= settings.freeAbove ? 0 : settings.amount
  }

  const totalAmount = subtotal + deliveryFee

  try {
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        addressId,
        pickupDate: new Date(pickupDate),
        pickupSlot,
        deliveryDate: new Date(deliveryDate),
        deliverySlot,
        status: OrderStatus.PENDING,
        subtotal,
        deliveryFee,
        totalAmount,
        notes,
        specialInstructions,
        items: {
          create: items.map(item => ({
            serviceItemId: item.serviceItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.unitPrice * item.quantity,
          })),
        },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            note: 'Order created',
          },
        },
      },
      include: {
        items: {
          include: {
            serviceItem: true,
          },
        },
        address: true,
      },
    })

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        reference: generatePaymentReference(),
        status: PaymentStatus.PENDING,
      },
    })

    revalidatePath('/orders')

    // Serialize Decimal fields for client component compatibility
    const serializedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      totalAmount: Number(order.totalAmount),
      items: order.items.map(item => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        serviceItem: {
          ...item.serviceItem,
          price: Number(item.serviceItem.price),
        },
      })),
    }

    const serializedPayment = {
      ...payment,
      amount: Number(payment.amount),
    }

    return {
      success: true,
      order: serializedOrder,
      payment: serializedPayment,
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    return { error: 'Failed to create order' }
  }
}

export async function getOrders() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          serviceItem: true,
        },
      },
      address: true,
      payment: true,
    },
  })

  return orders
}

export async function getOrder(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: {
          serviceItem: {
            include: {
              service: true,
            },
          },
        },
      },
      address: true,
      payment: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return order
}

export async function updatePaymentStatus(
  reference: string,
  status: PaymentStatus,
  paystackRef?: string
) {
  try {
    const payment = await prisma.payment.update({
      where: { reference },
      data: {
        status,
        paystackRef,
        paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
      },
    })

    // If payment successful, update order status and send confirmation email
    if (status === PaymentStatus.SUCCESS) {
      const order = await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
        include: { user: true },
      })

      await prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: OrderStatus.CONFIRMED,
          note: 'Payment confirmed',
        },
      })

      // Send order confirmation email
      if (order.user.email) {
        sendOrderConfirmationEmail(
          order.user.email,
          order.user.name || 'Customer',
          order.orderNumber,
          formatCurrency(order.totalAmount.toString()),
          format(new Date(order.pickupDate), 'EEE, MMM d, yyyy'),
          order.pickupSlot
        ).catch(console.error)
      }
    }

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Failed to update payment status:', error)
    return { error: 'Failed to update payment status' }
  }
}
