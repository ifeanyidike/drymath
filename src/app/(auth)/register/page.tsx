import { Metadata } from 'next'
import { RegisterForm } from '@/components/forms/register-form'

export const metadata: Metadata = {
  title: 'Create Account | DryMath',
  description: 'Create your DryMath account to start using our laundry and dry cleaning services.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
