'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const reference = searchParams.get('reference')
    const error = searchParams.get('error')
    const type = searchParams.get('type') || 'deposit'

    if (error) {
      setStatus('error')
      setMessage('Payment failed or was cancelled')
      return
    }

    if (!reference) {
      setStatus('error')
      setMessage('No payment reference found')
      return
    }

    // Verify payment
    const verifyPayment = async () => {
      try {
        let apiUrl = '/api/customer/wallet/verify-payment'
        
        // Use purchase verification if it's a purchase type
        if (type === 'purchase') {
          apiUrl = '/api/payment/verify-purchase'
        }
        
        const response = await fetch(`${apiUrl}?reference=${reference}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage(data.data.message || 'Purchase made successfully! Your data bundle is being processed.')

          // Redirect after 5 seconds to allow user to read the message
          setTimeout(() => {
            if (type === 'deposit') {
              router.push('/wallet?deposit=success')
            } else if (type === 'purchase') {
              // Redirect to store with success message
              const storeSlug = data.data.store_slug
              if (storeSlug) {
                router.push(`/store/${storeSlug}?purchase=success`)
              } else {
                // Fallback to stores page
                router.push('/stores?purchase=success')
              }
            } else {
              router.push('/dashboard?payment=success')
            }
          }, 5000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Payment verification failed')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Failed to verify payment')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we verify your payment...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 animate-bounce">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Successful!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting in 5 seconds...
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/wallet')}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold hover:shadow-lg transition-all"
            >
              Back to Wallet
            </button>
          </>
        )}
      </div>
    </div>
  )
}

