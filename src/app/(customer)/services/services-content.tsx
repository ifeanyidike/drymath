'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ServiceItemCard } from '@/components/services/service-item-card'
import { CartSummary } from '@/components/cart/cart-summary'
import { Service, ServiceItem } from '@prisma/client'
import { cn } from '@/lib/utils'

type SerializedServiceItem = Omit<ServiceItem, 'price'> & { price: number }
type ServiceWithItems = Service & { items: SerializedServiceItem[] }

interface ServicesContentProps {
  services: ServiceWithItems[]
}

export function ServicesContent({ services }: ServicesContentProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>(services[0]?.slug || '')

  useEffect(() => {
    const serviceParam = searchParams.get('service')
    if (serviceParam && services.some(s => s.slug === serviceParam)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(serviceParam)
    }
  }, [searchParams, services])

  const activeService = services.find(s => s.slug === activeTab)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Services</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select items to add to your order
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Service Tabs */}
          <div className="flex gap-1 border-b border-slate-200">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.slug)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors relative',
                  activeTab === service.slug
                    ? 'text-green-600'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {service.name}
                {activeTab === service.slug && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
                )}
              </button>
            ))}
          </div>

          {/* Active Service Content */}
          {activeService && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-slate-600">{activeService.description}</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {activeService.items.map((item) => (
                  <ServiceItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="mt-8 lg:mt-0 lg:sticky lg:top-24">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
