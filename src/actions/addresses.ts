'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export async function createAddress(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    label: formData.get('label') as string,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postalCode: formData.get('postalCode') as string,
    isDefault: formData.get('isDefault') === 'true',
  }

  const validated = addressSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { label, street, city, state, postalCode, isDefault } = validated.data

  try {
    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Check if this is the first address, if so make it default
    const addressCount = await prisma.address.count({
      where: { userId: user.id },
    })

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label,
        street,
        city,
        state,
        postalCode: postalCode || null,
        isDefault: isDefault || addressCount === 0,
      },
    })

    revalidatePath('/addresses')
    return { success: true, address }
  } catch (error) {
    console.error('Failed to create address:', error)
    return { error: 'Failed to create address' }
  }
}

export async function updateAddress(addressId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    label: formData.get('label') as string,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    postalCode: formData.get('postalCode') as string,
    isDefault: formData.get('isDefault') === 'true',
  }

  const validated = addressSchema.safeParse(rawData)
  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { label, street, city, state, postalCode, isDefault } = validated.data

  try {
    // Verify ownership
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    })

    if (!existingAddress) {
      return { error: 'Address not found' }
    }

    // If this is set as default, remove default from other addresses
    if (isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        label,
        street,
        city,
        state,
        postalCode: postalCode || null,
        isDefault,
      },
    })

    revalidatePath('/addresses')
    return { success: true, address }
  } catch (error) {
    console.error('Failed to update address:', error)
    return { error: 'Failed to update address' }
  }
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    })

    if (!address) {
      return { error: 'Address not found' }
    }

    // Check if address is used in any orders
    const orderCount = await prisma.order.count({
      where: { addressId },
    })

    if (orderCount > 0) {
      return { error: 'Cannot delete address that is used in orders' }
    }

    await prisma.address.delete({
      where: { id: addressId },
    })

    // If deleted address was default, make another one default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      })

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        })
      }
    }

    revalidatePath('/addresses')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete address:', error)
    return { error: 'Failed to delete address' }
  }
}

export async function setDefaultAddress(addressId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    })

    if (!address) {
      return { error: 'Address not found' }
    }

    // Remove default from all addresses
    await prisma.address.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    })

    // Set new default
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    revalidatePath('/addresses')
    return { success: true }
  } catch (error) {
    console.error('Failed to set default address:', error)
    return { error: 'Failed to set default address' }
  }
}

export async function getAddresses() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return addresses
}
