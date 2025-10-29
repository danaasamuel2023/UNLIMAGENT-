'use client'

import { useState } from 'react'

type TimePeriod = 'today' | 'week' | 'month' | 'all'

export default function TimePeriodSelector() {
  const [selected, setSelected] = useState<TimePeriod>('today')

  const periods = [
    { id: 'today' as TimePeriod, label: 'Today' },
    { id: 'week' as TimePeriod, label: 'This Week' },
    { id: 'month' as TimePeriod, label: 'This Month' },
    { id: 'all' as TimePeriod, label: 'All Time' },
  ]

  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => setSelected(period.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === period.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

