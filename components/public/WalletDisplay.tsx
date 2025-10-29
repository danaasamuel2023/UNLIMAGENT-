'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WalletDisplay() {
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
          // Get wallet balance
          await getBalance()
        }
      } catch (error) {
        // Not logged in
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
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

  // Don't show if not logged in
  if (!user || balance === null) {
    return null
  }

  return (
    <div className="glass rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">My Wallet</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Available Balance</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {balance.toFixed(2)} GHS
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          href="/wallet"
          className="flex-1 text-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
        >
          View Wallet
        </Link>
        <Link
          href="/payment/deposit"
          className="flex-1 text-center rounded-xl border-2 border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Add Funds
        </Link>
      </div>
    </div>
  )
}

