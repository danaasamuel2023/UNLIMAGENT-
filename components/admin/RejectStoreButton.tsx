'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RejectStoreButtonProps {
  storeId: string
  storeName?: string
}

export default function RejectStoreButton({ storeId, storeName }: RejectStoreButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')

  const handleOpenModal = () => {
    setShowModal(true)
    setError('')
    setReason('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setReason('')
    setError('')
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/stores/${storeId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject store')
      }

      router.push('/admin/stores')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Reject Store
      </button>

      {/* Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Reject Store</h3>
            <p className="text-sm text-gray-600 mb-6">
              {storeName && (
                <>Are you sure you want to reject <strong>{storeName}</strong>?</>
              )}
              {!storeName && 'Are you sure you want to reject this store?'}
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
                placeholder="Please provide a reason for rejecting this store (e.g., incomplete information, policy violation, etc.)"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 rounded-xl bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading || !reason.trim()}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
