'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import Link from 'next/link'

export default function TrackOrderByIdPage() {
  const params = useParams()
  const transactionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
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

    if (transactionId) {
      fetchOrder()
    }
  }, [transactionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/track"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition-all"
          >
            Track Another Order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Order Tracking</h1>
          <p className="mt-4 text-lg text-gray-600">Transaction ID: {order.transaction_id}</p>
        </div>

        {order && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Status Banner */}
            <div className={`${
              order.order_status === 'completed' ? 'bg-green-500' :
              order.order_status === 'processing' ? 'bg-blue-500' :
              order.order_status === 'pending' ? 'bg-yellow-500' :
              'bg-gray-500'
            } px-8 py-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Status</h2>
                  <p className="text-white/90 capitalize">{order.order_status}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold">Payment</h3>
                  <p className={`font-bold ${
                    order.payment_status === 'completed' ? 'text-green-200' :
                    'text-white/70'
                  }`}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Product Details */}
              <div className="rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Product Details
                </h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Network</dt>
                    <dd className="mt-1 text-lg font-bold text-gray-900">{order.network}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data Bundle</dt>
                    <dd className="mt-1 text-lg font-bold text-gray-900">{order.capacity} GB</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="mt-1 text-lg font-bold text-gray-900">{order.phone_number}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Paid</dt>
                    <dd className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(order.selling_price)}</dd>
                  </div>
                </dl>
              </div>

              {/* Order Timeline */}
              <div className="rounded-xl border-2 border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center">
                    <dt className="text-sm font-medium text-gray-700">Order Created</dt>
                    <dd className="text-sm font-bold text-gray-900">{formatDateTime(order.created_at)}</dd>
                  </div>
                  {order.updated_at && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm font-medium text-gray-700">Last Updated</dt>
                      <dd className="text-sm font-bold text-gray-900">{formatDateTime(order.updated_at)}</dd>
                    </div>
                  )}
                  {order.payment_reference && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm font-medium text-gray-700">Payment Reference</dt>
                      <dd className="text-sm font-mono font-bold text-blue-600">{order.payment_reference}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Status Information */}
              <div className={`rounded-xl p-6 ${
                order.order_status === 'completed' ? 'bg-green-50 border-2 border-green-200' :
                order.order_status === 'processing' ? 'bg-blue-50 border-2 border-blue-200' :
                order.order_status === 'pending' ? 'bg-yellow-50 border-2 border-yellow-200' :
                'bg-gray-50 border-2 border-gray-200'
              }`}>
                <div className="flex gap-3">
                  {order.order_status === 'completed' ? (
                    <svg className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : order.order_status === 'processing' ? (
                    <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      {order.order_status === 'completed' ? 'Order Completed' :
                       order.order_status === 'processing' ? 'Processing Your Order' :
                       'Order Pending'}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {order.order_status === 'completed' 
                        ? 'Your data bundle has been successfully delivered to your phone number. Thank you for your purchase!' 
                        : order.order_status === 'processing'
                        ? 'Your order is currently being processed. Data will be delivered shortly.'
                        : 'Your payment is being verified. Please wait...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                <Link
                  href="/track"
                  className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Track Another Order
                </Link>
                <Link
                  href="/"
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center font-semibold text-white hover:shadow-lg transition-all"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

