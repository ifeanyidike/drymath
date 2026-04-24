'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { updateProfile } from '@/actions/auth'

interface ProfileFormProps {
  user: {
    name: string | null
    email: string
    phone: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess('Profile updated successfully!')
    }

    setIsLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Update your personal details</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={user.email}
            disabled
            hint="Email cannot be changed"
          />

          <Input
            label="Full name"
            name="name"
            type="text"
            defaultValue={user.name || ''}
            required
            placeholder="John Doe"
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={user.phone || ''}
            placeholder="+234 800 000 0000"
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
