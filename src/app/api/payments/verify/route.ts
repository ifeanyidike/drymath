import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { updatePaymentStatus } from '@/actions/orders'
import { PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const result = await verifyPayment(reference)

    if (!result.status) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    const { status } = result.data

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

    await updatePaymentStatus(reference, paymentStatus)

    return NextResponse.json({
      success: paymentStatus === PaymentStatus.SUCCESS,
      status: paymentStatus,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
