'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { createAddress, updateAddress } from '@/actions/addresses'
import { Address } from '@prisma/client'

interface AddressFormProps {
  address?: Address
  onSuccess?: () => void
  onCancel?: () => void
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!address

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    const result = isEditing
      ? await updateAddress(address.id, formData)
      : await createAddress(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onSuccess?.()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Address Label"
            name="label"
            type="text"
            defaultValue={address?.label || ''}
            required
            placeholder="Home, Office, etc."
          />

          <Input
            label="Street Address"
            name="street"
            type="text"
            defaultValue={address?.street || ''}
            required
            placeholder="123 Main Street, Apt 4B"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              type="text"
              defaultValue={address?.city || ''}
              required
              placeholder="Lagos"
            />

            <Input
              label="State"
              name="state"
              type="text"
              defaultValue={address?.state || ''}
              required
              placeholder="Lagos"
            />
          </div>

          <Input
            label="Postal Code (Optional)"
            name="postalCode"
            type="text"
            defaultValue={address?.postalCode || ''}
            placeholder="100001"
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              value="true"
              defaultChecked={address?.isDefault || false}
              className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-slate-700">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Update Address' : 'Add Address'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
