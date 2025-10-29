'use client'

import { useState } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'

interface Withdrawal {
  id: string
  withdrawal_id: string
  status: string
  requested_amount: number
  method: string
  account_details: any
  created_at: string
  processed_at?: string
  agent_stores?: {
    store_name: string
  }
}

interface ProcessWithdrawalButtonProps {
  withdrawal: Withdrawal
}

export default function ProcessWithdrawalButton({ withdrawal }: ProcessWithdrawalButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [paymentRef, setPaymentRef] = useState('')
  const [reason, setReason] = useState('')
  const [action, setAction] = useState<'approve' | 'complete' | 'reject' | null>(null)

  const handleAction = async (status: 'processing' | 'completed' | 'rejected', paymentReference?: string, rejectionReason?: string) => {
    setLoading(true)

    try {
      const body: any = { status }
      if (paymentReference) {
        body.payment_reference = paymentReference
      }
      if (rejectionReason && status === 'rejected') {
        body.rejection_reason = rejectionReason
      }

      const response = await fetch(`/api/admin/withdrawals/${withdrawal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update withdrawal')
      }

      // Reload page to show updated status
      window.location.reload()
    } catch (err: any) {
      console.error('Withdrawal update error:', err)
      alert(err.message || 'Failed to update withdrawal. Please try again.')
    } finally {
      setLoading(false)
      setShowModal(false)
      setAction(null)
      setPaymentRef('')
      setReason('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodDisplay = () => {
    if (!withdrawal.account_details) return 'N/A'
    
    if (withdrawal.method === 'momo' && withdrawal.account_details.momo_number) {
      const network = withdrawal.account_details.momo_network ? ` (${withdrawal.account_details.momo_network})` : ''
      return `${withdrawal.account_details.momo_number}${network}`
    }
    
    if (withdrawal.method === 'bank' && withdrawal.account_details.account_number) {
      return withdrawal.account_details.account_number
    }
    
    return 'N/A'
  }

  return (
    <>
      {withdrawal.status === 'pending' && (
        <>
          <button
            onClick={() => { setAction('approve'); setShowModal(true) }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Process Payment
          </button>
          <button
            onClick={() => { setAction('reject'); setShowModal(true) }}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}

      {withdrawal.status === 'processing' && (
        <button
          onClick={() => { setAction('complete'); setShowModal(true) }}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Mark Completed
        </button>
      )}

      {!['pending', 'processing'].includes(withdrawal.status) && (
        <span className={`px-3 py-2 rounded-lg text-sm font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
          {withdrawal.status}
        </span>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {action === 'reject' && 'Return to Balance'}
                {action === 'approve' && 'Process Withdrawal'}
                {action === 'complete' && 'Complete Withdrawal'}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Withdrawal Information */}
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(withdrawal.requested_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Store:</span>
                  <span className="font-semibold">{withdrawal.agent_stores?.store_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold capitalize">{withdrawal.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Details:</span>
                  <span className="font-semibold">{getMethodDisplay()}</span>
                </div>
              </div>

              {/* Action Selection (for reject) */}
              {action === 'reject' && (
                <>
                  <div>
                    <label htmlFor="actionSelect" className="block text-sm font-medium text-gray-700 mb-2">
                      Action
                    </label>
                    <select
                      id="actionSelect"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      defaultValue="reject"
                    >
                      <option value="reject">Cancel Withdrawal</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for returning funds
                      <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                      id="reason"
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for returning funds (required)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      required
                    />
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-yellow-800">
                        This will move {formatCurrency(withdrawal.requested_amount)} from pending balance back to available balance.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Payment Reference Input */}
              {(action === 'approve' || action === 'complete') && (
                <div>
                  <label htmlFor="paymentRef" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Reference / Transaction ID
                    <span className="text-gray-500 font-normal"> (Optional)</span>
                  </label>
                  <input
                    id="paymentRef"
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g., T123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              {action === 'reject' ? (
                <>
                  <button
                    onClick={() => handleAction('rejected', undefined, reason)}
                    disabled={loading || !reason.trim()}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Return Funds'}
                  </button>
                  <button
                    onClick={() => { setShowModal(false); setAction(null); setReason('') }}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setShowModal(false); setAction(null) }}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction(action === 'approve' ? 'processing' : 'completed', paymentRef)}
                    disabled={loading}
                    className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      action === 'approve' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Processing...' : action === 'approve' ? 'Process Payment' : 'Complete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
