import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializePayment } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, reference, email, amount } = body

    if (!orderId || !reference || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const callback_url = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`

    const result = await initializePayment({
      email,
      amount,
      reference,
      callback_url,
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
    })

    if (!result.status) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      authorization_url: result.data.authorization_url,
      access_code: result.data.access_code,
      reference: result.data.reference,
    })
  } catch (error) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
