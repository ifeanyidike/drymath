'use client'

import { useState } from 'react'
import { format, addDays, isSameDay, isAfter, startOfDay, isBefore } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

interface DatePickerProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  minDate?: Date
  label?: string
}

export function DatePicker({ selectedDate, onSelectDate, minDate, label }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(minDate || new Date())

  const minimumDate = minDate || startOfDay(new Date())

  // Generate array of 14 days starting from viewDate
  const dates = Array.from({ length: 14 }, (_, i) => addDays(viewDate, i))

  function handlePrevious() {
    const newDate = addDays(viewDate, -7)
    if (!isBefore(newDate, minimumDate)) {
      setViewDate(newDate)
    }
  }

  function handleNext() {
    setViewDate(addDays(viewDate, 7))
  }

  const canGoPrevious = isAfter(viewDate, minimumDate)

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-slate-700">{label}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
        >
          &larr;
        </Button>
        <span className="text-sm font-medium text-slate-700">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <Button variant="ghost" size="sm" onClick={handleNext}>
          &rarr;
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isPast = isBefore(date, minimumDate)
          const isToday = isSameDay(date, new Date())

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onSelectDate(date)}
              disabled={isPast}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                isSelected
                  ? 'bg-green-600 text-white'
                  : isPast
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-900',
                isToday && !isSelected && 'ring-2 ring-green-200'
              )}
            >
              <span className="text-xs text-inherit opacity-70">
                {format(date, 'EEE')}
              </span>
              <span className="text-lg font-medium">{format(date, 'd')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
