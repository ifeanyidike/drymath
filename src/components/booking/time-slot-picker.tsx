'use client'

import { TimeSlot } from '@prisma/client'
import { cn } from '@/lib/utils'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
  label?: string
}

export function TimeSlotPicker({ slots, selectedSlot, onSelectSlot, label }: TimeSlotPickerProps) {
  const activeSlots = slots.filter(slot => slot.isActive)

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {activeSlots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onSelectSlot(slot.label)}
            className={cn(
              'px-3 py-2 text-sm rounded-lg border transition-colors text-center',
              selectedSlot === slot.label
                ? 'bg-green-600 border-green-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-green-300 hover:bg-green-50'
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  )
}
