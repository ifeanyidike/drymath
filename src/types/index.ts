import { User, Address, Service, ServiceItem, Order, OrderItem, Payment, TimeSlot, UserRole, OrderStatus, PaymentStatus } from '@prisma/client'

export type { User, Address, Service, ServiceItem, Order, OrderItem, Payment, TimeSlot, UserRole, OrderStatus, PaymentStatus }

export type ServiceWithItems = Service & {
  items: ServiceItem[]
}

export type OrderWithDetails = Order & {
  items: (OrderItem & {
    serviceItem: ServiceItem
  })[]
  address: Address
  payment: Payment | null
}

export type UserWithAddresses = User & {
  addresses: Address[]
}

export interface CartItem {
  serviceItem: ServiceItem
  quantity: number
}

export interface Cart {
  items: CartItem[]
  serviceId: string
}

export interface BookingSchedule {
  pickupDate: Date
  pickupSlot: string
  deliveryDate: Date
  deliverySlot: string
}

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
