import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | DryMath',
  description: 'Set a new password for your DryMath account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
