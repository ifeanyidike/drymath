'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { AddressForm } from '@/components/forms/address-form'
import { AddressCard } from './address-card'
import { Address } from '@prisma/client'

interface AddressesListProps {
  addresses: Address[]
}

export function AddressesList({ addresses }: AddressesListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  function handleEdit(address: Address) {
    setEditingAddress(address)
    setShowForm(true)
  }

  function handleSuccess() {
    setShowForm(false)
    setEditingAddress(null)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingAddress(null)
  }

  if (showForm) {
    return (
      <AddressForm
        address={editingAddress || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-2">No addresses yet</h3>
          <p className="text-sm text-slate-500 mb-4">
            Add your first address to start booking pickups
          </p>
          <Button onClick={() => setShowForm(true)}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
