'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { deleteAddress, setDefaultAddress } from '@/actions/addresses'
import { Address } from '@prisma/client'

interface AddressCardProps {
  address: Address
  onEdit: (address: Address) => void
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this address?')) return

    setIsDeleting(true)
    const result = await deleteAddress(address.id)
    if (result.error) {
      alert(result.error)
    }
    setIsDeleting(false)
    setShowMenu(false)
  }

  async function handleSetDefault() {
    setIsSettingDefault(true)
    await setDefaultAddress(address.id)
    setIsSettingDefault(false)
    setShowMenu(false)
  }

  return (
    <div className={`bg-white rounded-xl border ${address.isDefault ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{address.label}</h3>
              {address.isDefault && (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">{address.street}</p>
            <p className="text-sm text-slate-500">
              {address.city}, {address.state} {address.postalCode}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(address)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={handleSetDefault}
                      disabled={isSettingDefault}
                      className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
                    >
                      {isSettingDefault ? 'Setting...' : 'Set as Default'}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
