'use client'

import { useState } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'

export default function TrackOrderPage() {
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await fetch(`/api/orders/track/${transactionId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Order not found')
      }

      const { data } = await response.json()
      setOrder(data)
    } catch (err: any) {
      setError(err.message || 'Failed to track order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Track Your Order</h1>
          <p className="mt-4 text-lg text-gray-600">
            Enter your transaction ID to track your order status
          </p>
        </div>

        <div className="mt-10">
          <form onSubmit={handleTrack} className="rounded-lg bg-white p-8 shadow">
            <div>
              <label htmlFor="transaction_id" className="block text-sm font-medium text-gray-700">
                Transaction ID
              </label>
              <div className="mt-2 flex">
                <input
                  type="text"
                  id="transaction_id"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., TXN12345..."
                />
                <button
                  type="submit"
                  disabled={loading || !transactionId}
                  className="rounded-r-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Tracking...' : 'Track Order'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </form>

          {order && (
            <div className="mt-8 rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-600">Transaction ID: {order.transaction_id}</p>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-500">Order Status</h3>
                    <p className={`mt-1 text-2xl font-bold ${
                      order.order_status === 'completed' ? 'text-green-600' :
                      order.order_status === 'processing' ? 'text-blue-600' :
                      order.order_status === 'pending' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                    <p className={`mt-1 text-2xl font-bold ${
                      order.payment_status === 'completed' ? 'text-green-600' :
                      order.payment_status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Network</dt>
                      <dd className="text-sm font-medium text-gray-900">{order.network}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Capacity</dt>
                      <dd className="text-sm font-medium text-gray-900">{order.capacity} GB</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Amount Paid</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(order.selling_price)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Order Timeline */}
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-500">Order Created</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDateTime(order.created_at)}</dd>
                    </div>
                    {order.updated_at && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Last Updated</dt>
                        <dd className="text-sm font-medium text-gray-900">{formatDateTime(order.updated_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Contact */}
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Need help?</strong> Contact the agent for assistance with your order.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

