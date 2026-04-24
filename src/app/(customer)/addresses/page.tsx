import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/actions/auth'
import { getAddresses } from '@/actions/addresses'
import { AddressesList } from '@/components/addresses/addresses-list'

export const metadata: Metadata = {
  title: 'My Addresses | DryMath',
  description: 'Manage your pickup and delivery addresses.',
}

export default async function AddressesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const addresses = await getAddresses()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">My Addresses</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your pickup and delivery addresses
        </p>
      </div>

      <AddressesList addresses={addresses} />
    </div>
  )
}
