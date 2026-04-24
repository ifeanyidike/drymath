'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import {
  createService,
  updateService,
  deleteService,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
  toggleServiceItemActive,
} from '@/actions/admin'
import { formatCurrency } from '@/lib/utils'
import { Service, ServiceItem } from '@prisma/client'

type SerializedServiceItem = Omit<ServiceItem, 'price'> & { price: number }
type ServiceWithItems = Service & { items: SerializedServiceItem[] }

interface ServicesContentProps {
  services: ServiceWithItems[]
}

export function ServicesContent({ services: initialServices }: ServicesContentProps) {
  const [services] = useState(initialServices)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [showAddItem, setShowAddItem] = useState<string | null>(null)
  const [editingService, setEditingService] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  // Form states
  const [newService, setNewService] = useState({ name: '', description: '' })
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', unit: 'item' })
  const [editServiceData, setEditServiceData] = useState({ name: '', description: '', isActive: true })
  const [editItemData, setEditItemData] = useState({ name: '', description: '', price: '', unit: '', isActive: true })

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault()
    if (!newService.name.trim()) return

    setIsLoading(true)
    const result = await createService(newService)
    if (result.error) {
      alert(result.error)
    } else {
      setNewService({ name: '', description: '' })
      setShowAddService(false)
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleUpdateService(serviceId: string) {
    setIsLoading(true)
    const result = await updateService(serviceId, editServiceData)
    if (result.error) {
      alert(result.error)
    } else {
      setEditingService(null)
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleDeleteService(serviceId: string, serviceName: string) {
    if (!confirm(`Are you sure you want to delete "${serviceName}"? This will also delete all items in this service.`)) {
      return
    }

    setIsLoading(true)
    const result = await deleteService(serviceId)
    if (result.error) {
      alert(result.error)
    } else {
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleCreateItem(e: React.FormEvent, serviceId: string) {
    e.preventDefault()
    const price = parseFloat(newItem.price)
    if (!newItem.name.trim() || isNaN(price) || price < 0) {
      alert('Please enter valid item details')
      return
    }

    setIsLoading(true)
    const result = await createServiceItem({
      serviceId,
      name: newItem.name,
      description: newItem.description || undefined,
      price,
      unit: newItem.unit,
    })
    if (result.error) {
      alert(result.error)
    } else {
      setNewItem({ name: '', description: '', price: '', unit: 'item' })
      setShowAddItem(null)
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleUpdateItem(itemId: string) {
    const price = parseFloat(editItemData.price)
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price')
      return
    }

    setIsLoading(true)
    const result = await updateServiceItem(itemId, {
      name: editItemData.name,
      description: editItemData.description || undefined,
      price,
      unit: editItemData.unit,
      isActive: editItemData.isActive,
    })
    if (result.error) {
      alert(result.error)
    } else {
      setEditingItem(null)
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleDeleteItem(itemId: string, itemName: string) {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return
    }

    setIsLoading(true)
    const result = await deleteServiceItem(itemId)
    if (result.error) {
      alert(result.error)
    } else {
      window.location.reload()
    }
    setIsLoading(false)
  }

  async function handleToggleItemActive(itemId: string, currentActive: boolean) {
    setIsLoading(true)
    const result = await toggleServiceItemActive(itemId, !currentActive)
    if (result.error) {
      alert(result.error)
    } else {
      window.location.reload()
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Services Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add, edit, and manage your laundry services</p>
        </div>
        <Button onClick={() => setShowAddService(true)} disabled={isLoading}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Service
        </Button>
      </div>

      {/* Add Service Form */}
      {showAddService && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Service</h3>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
              <Input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g., Wash & Fold"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <Input
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                placeholder="Brief description of the service"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Service'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddService(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
          <p className="text-sm text-slate-500 mb-6">Get started by adding your first service</p>
          <Button onClick={() => setShowAddService(true)}>Add Your First Service</Button>
        </div>
      ) : (
        services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Service Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              {editingService === service.id ? (
                <div className="space-y-3">
                  <Input
                    value={editServiceData.name}
                    onChange={(e) => setEditServiceData({ ...editServiceData, name: e.target.value })}
                    placeholder="Service name"
                  />
                  <Input
                    value={editServiceData.description}
                    onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editServiceData.isActive}
                        onChange={(e) => setEditServiceData({ ...editServiceData, isActive: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      Active
                    </label>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateService(service.id)} disabled={isLoading}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingService(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">{service.name}</h2>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditServiceData({
                          name: service.name,
                          description: service.description || '',
                          isActive: service.isActive,
                        })
                        setEditingService(service.id)
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteService(service.id, service.name)}
                      disabled={isLoading}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Service Items */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Item</th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Unit</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Price</th>
                    <th className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {service.items.map((item) => (
                    <tr key={item.id} className={!item.isActive ? 'bg-slate-50' : 'hover:bg-slate-50/50'}>
                      {editingItem === item.id ? (
                        <>
                          <td className="px-6 py-3">
                            <div className="space-y-2">
                              <Input
                                value={editItemData.name}
                                onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                                placeholder="Item name"
                                className="text-sm"
                              />
                              <Input
                                value={editItemData.description}
                                onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                                placeholder="Description (optional)"
                                className="text-sm"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <Input
                              value={editItemData.unit}
                              onChange={(e) => setEditItemData({ ...editItemData, unit: e.target.value })}
                              className="w-20 text-sm"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <Input
                              type="number"
                              value={editItemData.price}
                              onChange={(e) => setEditItemData({ ...editItemData, price: e.target.value })}
                              className="w-24 text-right text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <label className="flex items-center justify-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editItemData.isActive}
                                onChange={(e) => setEditItemData({ ...editItemData, isActive: e.target.checked })}
                                className="rounded border-slate-300"
                              />
                            </label>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleUpdateItem(item.id)} disabled={isLoading}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{item.unit}</td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-medium text-slate-900">{formatCurrency(item.price.toString())}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleItemActive(item.id, item.isActive)}
                              disabled={isLoading}
                              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                                item.isActive
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditItemData({
                                    name: item.name,
                                    description: item.description || '',
                                    price: item.price.toString(),
                                    unit: item.unit,
                                    isActive: item.isActive,
                                  })
                                  setEditingItem(item.id)
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}

                  {/* Add Item Row */}
                  {showAddItem === service.id ? (
                    <tr className="bg-green-50/50">
                      <td className="px-6 py-3">
                        <div className="space-y-2">
                          <Input
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="Item name"
                            className="text-sm"
                          />
                          <Input
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Description (optional)"
                            className="text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Input
                          value={newItem.unit}
                          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                          placeholder="item"
                          className="w-20 text-sm"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <Input
                          type="number"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          placeholder="0"
                          className="w-24 text-right text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-slate-500">-</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={(e) => handleCreateItem(e, service.id)} disabled={isLoading}>
                            Add
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowAddItem(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-3">
                        <button
                          onClick={() => {
                            setNewItem({ name: '', description: '', price: '', unit: 'item' })
                            setShowAddItem(service.id)
                          }}
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Item
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
