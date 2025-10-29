'use client'

import { useState } from 'react'
import { updateOrderStatus } from '@/app/actions/agent'

interface UpdateOrderStatusProps {
  transactionId: string
  currentStatus: string
}

const statuses = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'completed', label: 'Completed', color: 'green' },
]

export default function UpdateOrderStatus({ transactionId, currentStatus }: UpdateOrderStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateOrderStatus({
        transactionId,
        status: selectedStatus as any,
        notes: notes || undefined,
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Order status updated successfully!' })
        setTimeout(() => {
          setIsOpen(false)
          setMessage(null)
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update status' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
      console.error('Status update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find(s => s.value === status)
    if (!statusConfig) return null

    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusConfig.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        statusConfig.color === 'blue' ? 'bg-blue-100 text-blue-800' :
        statusConfig.color === 'green' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {statusConfig.label}
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Update Status
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => !isLoading && setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="mb-2 text-2xl font-bold text-gray-900">Update Order Status</h2>
            <p className="mb-6 text-sm text-gray-600">Change the delivery status for this order</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Status
                </label>
                <div className="mb-4">{getStatusBadge(currentStatus)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  disabled={isLoading}
                  required
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Add any notes about this status change..."
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl p-4 ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
