import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/require-auth'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const role = user.user_metadata?.role || 'customer'

  // Redirect based on role
  if (role === 'admin') {
    redirect('/admin')
  } else if (role === 'agent') {
    redirect('/agent')
  }

  // Get wallet balance
  let walletBalance = 0
  try {
    const { data: wallet } = await supabase
      .from('customer_wallets')
      .select('balance, total_deposits, total_spent')
      .eq('user_id', user.id)
      .single()
    
    if (wallet) {
      walletBalance = wallet.balance || 0
    }
  } catch (error) {
    console.error('Error fetching wallet:', error)
  }

  // Customer dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.user_metadata?.name || user.email}!</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Wallet Card */}
          <Link 
            href="/wallet"
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">My Wallet</h3>
            <p className="text-3xl font-bold mb-2">{walletBalance.toFixed(2)} GHS</p>
            <p className="text-blue-100 text-sm">View balance & transactions →</p>
          </Link>

          {/* Add Funds Card */}
          <Link 
            href="/payment/deposit"
            className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Add Funds</h3>
            <p className="text-emerald-100 text-sm mb-2">Top up your wallet</p>
            <p className="text-emerald-100 text-sm">Via Paystack →</p>
          </Link>

          {/* Browse Stores Card */}
          <Link 
            href="/stores"
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse Stores</h3>
            <p className="text-pink-100 text-sm mb-2">Shop for data bundles</p>
            <p className="text-pink-100 text-sm">Find products →</p>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/dashboard/orders"
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">My Orders</h3>
                <p className="text-sm text-gray-600">Track your orders</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/track"
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track Order</h3>
                <p className="text-sm text-gray-600">Check order status</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

