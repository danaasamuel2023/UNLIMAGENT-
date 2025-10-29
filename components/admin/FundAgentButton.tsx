'use client'

import { useState } from 'react'
import { fundAgentWallet } from '@/app/actions/admin'

interface FundAgentButtonProps {
  agentId: string
  agentEmail: string
}

export default function FundAgentButton({ agentId, agentEmail }: FundAgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        setMessage({ type: 'error', text: 'Please enter a valid amount' })
        setIsLoading(false)
        return
      }

      const result = await fundAgentWallet({
        agentId,
        amount: numAmount,
        description: description || 'Manual funding by admin',
      })

      if (result.success) {
        setMessage({ type: 'success', text: `Successfully funded GHS ${numAmount.toFixed(2)} to ${agentEmail}` })
        setAmount('')
        setDescription('')
        setTimeout(() => {
          setIsOpen(false)
          setMessage(null)
          window.location.reload()
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fund agent account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
      console.error('Funding error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Funds to Wallet
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

            <h2 className="mb-2 text-2xl font-bold text-gray-900">Fund Agent Wallet</h2>
            <p className="mb-6 text-sm text-gray-600">Add funds to {agentEmail}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (GHS)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  placeholder="Reason for funding..."
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
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Fund Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

