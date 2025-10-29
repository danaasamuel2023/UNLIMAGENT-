'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DepositPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [email, setEmail] = useState('')
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check for success message from wallet
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setMessage('Deposit successful! Your wallet balance has been updated.')
      setTimeout(() => setMessage(''), 5000)
    }

    // Get user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          setEmail(data.user.email || '')
        }
        // Get wallet balance
        getBalance()
      })
      .catch(() => router.push('/login'))
  }, [])

  const getBalance = async () => {
    try {
      const res = await fetch('/api/customer/wallet/get-balance')
      const data = await res.json()
      if (data.success) {
        setBalance(data.data.balance)
      }
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!user) {
      setError('Please log in to deposit')
      return
    }

    const depositAmount = parseFloat(amount)
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (depositAmount < 1) {
      setError('Minimum deposit is GHS 1.00')
      return
    }

    if (depositAmount > 50000) {
      setError('Maximum deposit is GHS 50,000')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/customer/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: depositAmount,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack payment page
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process deposit')
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Funds</h1>
          <p className="text-gray-600 mt-2">Top up your wallet to purchase data bundles</p>
        </div>

        {/* Current Balance */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Current Balance</p>
            <p className="text-4xl font-bold text-gray-900">{balance.toFixed(2)} GHS</p>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deposit Amount (GHS)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max="50000"
                placeholder="Enter amount (min: GHS 1.00)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Min: GHS 1.00 | Max: GHS 50,000</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              />
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Continue to Payment'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">Secure Payment Processing</p>
                <p>Your payment is processed securely via Paystack. All transactions are encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

