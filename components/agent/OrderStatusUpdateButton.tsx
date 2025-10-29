'use client'

import { useState } from 'react'

interface Order {
  id: string
  transaction_id: string
  order_status: string
  payment_status: string
}

interface OrderStatusUpdateButtonProps {
  order: Order
}

export default function OrderStatusUpdateButton({ order }: OrderStatusUpdateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [orderStatus, setOrderStatus] = useState(order.order_status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)

  const handleStatusUpdate = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/agent/orders/${order.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_status: orderStatus,
          payment_status: paymentStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      // Show success message
      alert('Order updated successfully!')
      window.location.reload()
    } catch (err) {
      alert('Failed to update order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Status
        </label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Status
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <button
        onClick={handleStatusUpdate}
        disabled={loading || (
          orderStatus === order.order_status && 
          paymentStatus === order.payment_status
        )}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  )
}

