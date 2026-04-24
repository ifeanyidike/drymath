import { Metadata } from 'next'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password | DryMath',
  description: 'Reset your DryMath account password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
