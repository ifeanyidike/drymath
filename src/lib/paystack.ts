const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface InitializePaymentParams {
  email: string
  amount: number // in kobo (multiply by 100)
  reference: string
  callback_url: string
  metadata?: Record<string, unknown>
}

export interface PaystackResponse<T> {
  status: boolean
  message: string
  data: T
}

export interface InitializePaymentData {
  authorization_url: string
  access_code: string
  reference: string
}

export interface VerifyPaymentData {
  status: string // 'success', 'failed', 'abandoned'
  reference: string
  amount: number
  channel: string
  currency: string
  paid_at: string
  metadata?: Record<string, unknown>
  customer: {
    email: string
    customer_code: string
  }
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<PaystackResponse<InitializePaymentData>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  return response.json()
}

export async function verifyPayment(
  reference: string
): Promise<PaystackResponse<VerifyPaymentData>> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  )

  return response.json()
}

export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')
  return hash === signature
}
