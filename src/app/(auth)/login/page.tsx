import { Metadata } from 'next'
import { LoginForm } from '@/components/forms/login-form'

export const metadata: Metadata = {
  title: 'Sign In | DryMath',
  description: 'Sign in to your DryMath account.',
}

export default function LoginPage() {
  return <LoginForm />
}
