'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  id: string
  order_status: 'pending' | 'processing' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'refunded'
  transaction_id: string
}

interface ProcessOrderButtonProps {
  order: Order
}

export default function ProcessOrderButton({ order }: ProcessOrderButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStatusChange = async (newStatus: string, field: 'order_status' | 'payment_status') => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/agent/orders/${order.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: newStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order')
      }

      // Refresh the page to show updated status
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Update Order Status</label>
          <div className="mt-2 flex gap-2">
            {order.order_status === 'pending' && (
              <button
                onClick={() => handleStatusChange('processing', 'order_status')}
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Mark as Processing'}
              </button>
            )}
            {order.order_status === 'processing' && (
              <button
                onClick={() => handleStatusChange('completed', 'order_status')}
                disabled={loading}
                className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Mark as Completed'}
              </button>
            )}
          </div>
        </div>
      )}

      {order.payment_status === 'pending' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Update Payment Status</label>
          <div className="mt-2">
            <button
              onClick={() => handleStatusChange('completed', 'payment_status')}
              disabled={loading}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Mark Payment as Completed'}
            </button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Transaction ID: {order.transaction_id}
      </div>
    </div>
  )
}

