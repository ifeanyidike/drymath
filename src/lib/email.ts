const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@drymath.com'
const FROM_NAME = process.env.FROM_NAME || 'DryMath'

interface SendEmailParams {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
}

async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams) {
  if (!BREVO_API_KEY) {
    console.warn('BREVO_API_KEY not set, skipping email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to,
        subject,
        htmlContent,
        textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Brevo API error:', error)
      return { success: false, error: 'Failed to send email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

// Email Templates
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: [{ email, name }],
    subject: 'Welcome to DryMath!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to DryMath!</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Thank you for creating an account with DryMath. We're excited to have you!</p>
        <p>With DryMath, you can:</p>
        <ul>
          <li>Schedule laundry pickups at your convenience</li>
          <li>Track your orders in real-time</li>
          <li>Enjoy professional cleaning services</li>
        </ul>
        <p>Ready to get started? <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/services" style="color: #2563eb;">Browse our services</a></p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  totalAmount: string,
  pickupDate: string,
  pickupSlot: string
) {
  return sendEmail({
    to: [{ email, name }],
    subject: `Order Confirmed - ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Confirmed!</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total:</strong> ${totalAmount}</p>
          <p><strong>Pickup Date:</strong> ${pickupDate}</p>
          <p><strong>Pickup Time:</strong> ${pickupSlot}</p>
        </div>
        <p>We'll notify you when our driver is on the way for pickup.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="color: #2563eb;">Track your order</a></p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}

export async function sendOrderStatusUpdateEmail(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  statusLabel: string
) {
  const statusMessages: Record<string, string> = {
    CONFIRMED: 'Your order has been confirmed and is being processed.',
    PICKED_UP: 'Your items have been picked up by our driver.',
    WASHING: 'Your items are currently being washed.',
    DRYING: 'Your items are being dried.',
    IRONING: 'Your items are being ironed.',
    READY: 'Your items are ready for delivery!',
    OUT_FOR_DELIVERY: 'Your items are out for delivery.',
    DELIVERED: 'Your items have been delivered. Thank you for choosing DryMath!',
    CANCELLED: 'Your order has been cancelled.',
  }

  const message = statusMessages[status] || `Your order status has been updated to: ${statusLabel}`

  return sendEmail({
    to: [{ email, name }],
    subject: `Order Update - ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Order Status Update</h1>
        <p>Hi ${name || 'there'},</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 18px; margin: 0;"><strong>Order:</strong> ${orderNumber}</p>
          <p style="font-size: 18px; margin: 10px 0 0;"><strong>Status:</strong> ${statusLabel}</p>
        </div>
        <p>${message}</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="color: #2563eb;">View order details</a></p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}

export async function sendPickupReminderEmail(
  email: string,
  name: string,
  orderNumber: string,
  pickupDate: string,
  pickupSlot: string
) {
  return sendEmail({
    to: [{ email, name }],
    subject: `Pickup Reminder - ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Pickup Reminder</h1>
        <p>Hi ${name || 'there'},</p>
        <p>This is a friendly reminder that we'll be picking up your laundry tomorrow.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Pickup Date:</strong> ${pickupDate}</p>
          <p><strong>Pickup Time:</strong> ${pickupSlot}</p>
        </div>
        <p>Please ensure your items are ready for pickup at the scheduled time.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="color: #2563eb;">View order details</a></p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}

export async function sendDeliveryNotificationEmail(
  email: string,
  name: string,
  orderNumber: string,
  deliverySlot: string
) {
  return sendEmail({
    to: [{ email, name }],
    subject: `Delivery on the Way - ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Your Order is On the Way!</h1>
        <p>Hi ${name || 'there'},</p>
        <p>Great news! Your freshly cleaned items are out for delivery.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${deliverySlot}</p>
        </div>
        <p>Please ensure someone is available to receive your items.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/orders" style="color: #2563eb;">Track your order</a></p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}

export async function sendRefundNotificationEmail(
  email: string,
  name: string,
  orderNumber: string,
  amount: string,
  reason: string
) {
  return sendEmail({
    to: [{ email, name }],
    subject: `Refund Processed - ${orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Refund Processed</h1>
        <p>Hi ${name || 'there'},</p>
        <p>A refund has been processed for your order.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Refund Amount:</strong> ${amount}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>The refund should appear in your account within 5-10 business days, depending on your bank.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br/>The DryMath Team</p>
      </div>
    `,
  })
}
