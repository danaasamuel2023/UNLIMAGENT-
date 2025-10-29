'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PurchaseSuccessBanner() {
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check for success parameter in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const purchase = urlParams.get('purchase')
      
      if (purchase === 'success') {
        setShow(true)
        
        // Remove the query parameter after 5 seconds
        const timer = setTimeout(() => {
          router.replace(window.location.pathname)
          setShow(false)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [router])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-xl border-2 border-green-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Package Purchased Successfully!</h3>
                <p className="text-white/90 text-sm">Your order is being processed and will be delivered shortly.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShow(false)
                router.replace(window.location.pathname)
              }}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

