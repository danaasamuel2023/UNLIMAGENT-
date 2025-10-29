'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Agent route error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-2 text-gray-600">
            An error occurred in the agent section.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-200"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold shadow-md hover:scale-105 transition-all duration-200 border border-gray-200"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

