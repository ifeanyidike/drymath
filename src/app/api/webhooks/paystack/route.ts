import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/paystack'
import { updatePaymentStatus } from '@/actions/orders'
import { PaymentStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Validate webhook signature
    if (!validateWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    if (event.event === 'charge.success') {
      const { reference, status } = event.data

      // Update payment status
      let paymentStatus: PaymentStatus
      switch (status) {
        case 'success':
          paymentStatus = PaymentStatus.SUCCESS
          break
        case 'failed':
          paymentStatus = PaymentStatus.FAILED
          break
        default:
          paymentStatus = PaymentStatus.PENDING
      }

      await updatePaymentStatus(reference, paymentStatus, event.data.id?.toString())
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
