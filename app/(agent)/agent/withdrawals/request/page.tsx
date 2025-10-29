'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

export default function WithdrawalRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [wallet, setWallet] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_earnings: 0,
    total_withdrawn: 0,
  })

  const [formData, setFormData] = useState({
    amount: '',
    method: 'mobile_money',
    recipient_name: '',
    account_number: '',
    bank_name: '',
    mobile_money_provider: 'mtn',
  })

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const response = await fetch('/api/agent/wallet')
      if (!response.ok) {
        throw new Error('Failed to fetch wallet')
      }
      const { data } = await response.json()
      setWallet(data.wallet)
    } catch (err) {
      setError('Failed to load wallet information')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const amount = parseFloat(formData.amount)

      if (amount < 10) {
        throw new Error('Minimum withdrawal amount is GHS 10.00')
      }

      if (amount > wallet.available_balance) {
        throw new Error('Amount exceeds available balance')
      }

      const response = await fetch('/api/agent/withdrawals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requested_amount: amount,
          method: formData.method,
          account_details: {
            recipient_name: formData.recipient_name,
            account_number: formData.account_number,
            bank_name: formData.bank_name,
            mobile_money_provider: formData.mobile_money_provider,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create withdrawal request')
      }

      // Redirect to withdrawals page
      router.push('/agent/withdrawals')
    } catch (err: any) {
      setError(err.message || 'Failed to create withdrawal request')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/agent/withdrawals" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to withdrawals
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Request Withdrawal</h1>
        <p className="mt-2 text-gray-400">
          Available balance: <span className="font-semibold text-green-400">{formatCurrency(wallet.available_balance)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg bg-gray-800 border border-gray-700">
        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
              Withdrawal Amount (GHS) *
            </label>
            <input
              type="number"
              id="amount"
              required
              min="10"
              step="0.01"
              max={wallet.available_balance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="100.00"
            />
            <p className="mt-1 text-xs text-gray-400">
              Minimum: GHS 10.00 | Maximum: {formatCurrency(wallet.available_balance)}
            </p>
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-300">
              Payment Method *
            </label>
            <select
              id="method"
              required
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-300">
              Recipient Name *
            </label>
            <input
              type="text"
              id="recipient_name"
              required
              value={formData.recipient_name}
              onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>

          {formData.method === 'mobile_money' ? (
            <>
              <div>
                <label htmlFor="mobile_money_provider" className="block text-sm font-medium text-gray-300">
                  Mobile Money Provider *
                </label>
                <select
                  id="mobile_money_provider"
                  required
                  value={formData.mobile_money_provider}
                  onChange={(e) => setFormData({ ...formData, mobile_money_provider: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="vodafone">Vodafone Cash</option>
                  <option value="airteltigo">AirtelTigo Money</option>
                </select>
              </div>
              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-300">
                  Mobile Money Number *
                </label>
                <input
                  type="tel"
                  id="account_number"
                  required
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0244123456"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-300">
                  Bank Name *
                </label>
                <input
                  type="text"
                  id="bank_name"
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Ghana Commercial Bank"
                />
              </div>
              <div>
                <label htmlFor="account_number" className="block text-sm font-medium text-gray-300">
                  Account Number *
                </label>
                <input
                  type="text"
                  id="account_number"
                  required
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="1234567890123"
                />
              </div>
            </>
          )}

          <div className="rounded-md bg-yellow-900/30 border border-yellow-500/50 p-4">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> Withdrawal requests are processed within 2-3 business days. You will be notified once your withdrawal is approved and processed.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 bg-gray-750 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="submit"
            disabled={loading || wallet.available_balance < 10}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
          >
            {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
          <Link
            href="/agent/withdrawals"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:mt-0 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

