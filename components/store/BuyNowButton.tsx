'use client'

import { useState } from 'react'

interface Product {
  id: string
  network: string
  capacity: number
  selling_price: number
  display_name?: string
  in_stock: boolean
}

interface BuyNowButtonProps {
  product: Product
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const handleBuyNow = async () => {
    if (!product.in_stock) return
    
    if (!showForm) {
      setShowForm(true)
      return
    }

    // Validate phone
    if (!phone || phone.trim().length < 10) {
      alert('Please enter a valid phone number')
      return
    }

    setLoading(true)
    
    try {
      // Initialize Paystack payment
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          phone_number: phone,
          email: email || undefined,
          amount: product.selling_price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack checkout
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      setLoading(false)
    }
  }

  if (!product.in_stock) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  if (!showForm) {
    return (
      <button
        onClick={handleBuyNow}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
      >
        Buy Now
      </button>
    )
  }

  return (
    <div className="space-y-3 bg-yellow-50 p-4 rounded-lg">
      <div>
        <label className="block text-xs font-semibold text-gray-900 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          placeholder="e.g., 0204120633"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-900 mb-1">
          Email <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleBuyNow}
          disabled={loading || !phone}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          {loading ? 'Processing...' : 'Pay with Paystack'}
        </button>
      </div>
    </div>
  )
}

