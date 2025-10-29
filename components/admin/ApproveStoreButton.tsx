'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApproveStoreButtonProps {
  storeId: string
  storeName?: string
}

export default function ApproveStoreButton({ storeId, storeName }: ApproveStoreButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve store')
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 inline-flex items-center gap-2">
        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="text-sm font-medium text-green-800">Store Approved!</span>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <button
        onClick={handleApprove}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Approving...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approve Store
          </>
        )}
      </button>
    </div>
  )
}
