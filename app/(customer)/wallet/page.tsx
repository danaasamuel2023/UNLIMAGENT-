'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Transaction {
  id: string
  type: string
  amount: number
  balance_before: number
  balance_after: number
  status: string
  reference: string
  description?: string
  created_at: string
  completed_at?: string
}

export default function CustomerWalletPage() {
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [totalDeposits, setTotalDeposits] = useState<number>(0)
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
    loadWalletData()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (!data.user) {
        router.push('/login?redirect=/wallet')
      } else {
        setUser(data.user)
      }
    } catch (error) {
      router.push('/login?redirect=/wallet')
    }
  }

  const loadWalletData = async () => {
    setLoading(true)
    try {
      // Get wallet balance
      const balanceRes = await fetch('/api/customer/wallet/get-balance')
      const balanceData = await balanceRes.json()
      
      if (balanceData.success) {
        setBalance(balanceData.data.balance)
        setTotalDeposits(balanceData.data.total_deposits || 0)
        setTotalSpent(balanceData.data.total_spent || 0)
      }

      // Get recent transactions
      const transactionsRes = await fetch('/api/customer/wallet/transactions')
      const transactionsData = await transactionsRes.json()
      
      if (transactionsData.success) {
        setTransactions(transactionsData.data || [])
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return { label: 'Deposit', color: 'text-green-600', bg: 'bg-green-100' }
      case 'purchase':
        return { label: 'Purchase', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'refund':
        return { label: 'Refund', color: 'text-yellow-600', bg: 'bg-yellow-100' }
      default:
        return { label: type, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
              <p className="text-gray-600 mt-1">Manage your funds and transactions</p>
            </div>
            <Link
              href="/payment/deposit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Funds
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-2">Current Balance</p>
            <p className="text-4xl font-bold">{balance.toFixed(2)} GHS</p>
            <p className="text-blue-200 text-sm mt-2">Available to spend</p>
          </div>

          {/* Total Deposits */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-2">Total Deposited</p>
            <p className="text-4xl font-bold">{totalDeposits.toFixed(2)} GHS</p>
            <p className="text-green-200 text-sm mt-2">All-time deposits</p>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-2">Total Spent</p>
            <p className="text-4xl font-bold">{totalSpent.toFixed(2)} GHS</p>
            <p className="text-purple-200 text-sm mt-2">All-time purchases</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              <Link
                href="/wallet/transactions"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                View All →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            {transactions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => {
                    const typeInfo = getTransactionType(transaction.type)
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'} {transaction.amount.toFixed(2)} GHS
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                          {transaction.reference}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-lg font-medium text-gray-900">No transactions yet</p>
                <p className="text-gray-600 mt-2">Start by depositing funds to your wallet</p>
                <Link
                  href="/payment/deposit"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Make Your First Deposit
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/payment/deposit" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Add Funds</h3>
                <p className="text-sm text-gray-600">Deposit money to your wallet</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/orders" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600">View order history</p>
              </div>
            </div>
          </Link>

          <Link href="/stores" className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Browse Stores</h3>
                <p className="text-sm text-gray-600">Shop for data bundles</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

