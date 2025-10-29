'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  network: string
  capacity: number
  selling_price: number
  display_name?: string
  in_stock: boolean
}

interface PurchaseButtonProps {
  product: Product
}

export default function PurchaseButton({ product }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in (for optional features)
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch (error) {
        // Not logged in - that's fine, purchases work without login
      }
    }
    
    checkUser()
  }, [])

  const handlePurchase = async () => {
    if (!product.in_stock) return
    
    if (!showForm) {
      setShowForm(true)
      return
    }

    // Reset error
    setError('')

    // Validate phone
    if (!phone || phone.trim().length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    // Direct Paystack payment
    setLoading(true)
    try {
      // Initialize Paystack payment
      const paystackResponse = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          phone_number: phone,
          email: email || undefined,
          amount: product.selling_price,
        }),
      })

      const paystackData = await paystackResponse.json()

      if (paystackData.error) {
        throw new Error(paystackData.error)
      }

      if (paystackData.authorization_url) {
        window.location.href = paystackData.authorization_url
        return
      } else {
        throw new Error('Failed to initialize payment')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit order')
      setLoading(false)
    }
  }

  if (!product.in_stock) {
    return (
      <button
        disabled
        className="w-full rounded-xl bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-500 shadow-sm"
      >
        Out of Stock
      </button>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={handlePurchase}
        className="w-full btn-primary shadow-lg hover:shadow-xl transition-all"
      >
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Purchase Now
        </span>
      </button>
    )
  }

  return (
    <div className="space-y-4 rounded-xl bg-white p-4 shadow-inner">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          placeholder="e.g., 0204120633"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          required
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Email <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Additional Notes <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          placeholder="Any special instructions..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
        />
      </div>
      
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => {
            setShowForm(false)
            setError('')
          }}
          className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePurchase}
          disabled={loading || !phone}
          className="flex-1 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Submit Order'
          )}
        </button>
      </div>
    </div>
  )
}
