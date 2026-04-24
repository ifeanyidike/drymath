import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { CheckoutContent } from './checkout-content'

export const metadata: Metadata = {
  title: 'Checkout | DryMath',
  description: 'Complete your laundry order.',
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?redirectTo=/checkout')
  }

  return <CheckoutContent user={user} />
}
