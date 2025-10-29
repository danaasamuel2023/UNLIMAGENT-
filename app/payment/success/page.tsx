'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function PurchaseSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransaction = async () => {
      const reference = searchParams.get('reference')
      
      if (!reference) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        
        // Get transaction by reference
        const { data, error } = await supabase
          .from('agent_transactions')
          .select('*, agent_products(*), agent_stores(*)')
          .eq('payment_reference', reference)
          .single()

        if (data) {
          setTransaction(data)
        }
      } catch (error) {
        console.error('Error fetching transaction:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransaction()
  }, [searchParams])

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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Purchase Successful!</h1>
          <p className="text-white/90 text-lg">Your order is being processed</p>
        </div>

        {/* Transaction Details */}
        <div className="px-8 py-8">
          {transaction && (
            <>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="h-6 w-6 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-green-900 text-lg mb-1">Order Confirmed</h3>
                    <p className="text-green-700 text-sm">
                      We've received your payment and your order is being processed
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Transaction ID
                  </label>
                  <p className="text-gray-900 font-mono text-lg">{transaction.transaction_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Network
                    </label>
                    <p className="text-gray-900 font-bold">{transaction.network}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Data Bundle
                    </label>
                    <p className="text-gray-900 font-bold">{transaction.capacity} GB</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Phone Number
                  </label>
                  <p className="text-gray-900 font-bold">{transaction.phone_number}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Amount Paid
                    </label>
                    <p className="text-gray-900 font-bold text-xl">
                      GHS {parseFloat(transaction.selling_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Status
                    </label>
                    <p className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                      {transaction.order_status === 'completed' ? 'Completed' : 'Processing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">What's Next?</h4>
                    <p className="text-blue-700 text-sm">
                      Your data bundle will be delivered to {transaction.phone_number} within 10-60 minutes. 
                      You'll receive a confirmation SMS once your data has been credited.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={transaction?.agent_stores ? `/store/${transaction.agent_stores.store_slug}` : '/'}
              className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-4 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href={`/track/${transaction?.transaction_id || ''}`}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-center font-semibold text-white hover:shadow-lg transition-all"
            >
              Track Order
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Need help? <Link href="/support" className="text-blue-600 hover:text-blue-700 font-semibold">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

