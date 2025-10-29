import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { formatCurrency } from '@/lib/utils/format'
import Link from 'next/link'
import DashboardActions from '@/components/agent/DashboardActions'

export default async function AgentDashboardPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('agent_id', user.id)
    .single()

  // Get recent customers/transactions
  const { data: recentTransactions } = await supabase
    .from('agent_transactions')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get all transactions for metrics calculation
  const { data: allTransactions } = await supabase
    .from('agent_transactions')
    .select('*')
    .eq('agent_id', user.id)

  const wallet = store?.wallet || {
    available_balance: 0,
    pending_balance: 0,
    total_earnings: 0,
    total_withdrawn: 0,
  }

  // Calculate real metrics from actual transactions
  const totalOrders = allTransactions?.length || 0
  
  // Calculate total sales (sum of all selling prices)
  const totalSales = allTransactions?.reduce((sum, transaction) => {
    return sum + parseFloat(transaction.selling_price || 0)
  }, 0) || 0

  // Calculate net profit (sum of all net_profit values)
  const netProfit = allTransactions?.reduce((sum, transaction) => {
    return sum + parseFloat(transaction.net_profit || 0)
  }, 0) || 0

  // Calculate average order value
  const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0

  const storeUrl = store 
    ? `/store/${store.store_slug}`
    : '/agent/store/create'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700 mb-6 -mx-4 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{store?.store_name || 'My Store'}</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back! Here's how your store is performing.</p>
          </div>
          <div className="flex items-center gap-3">
            {store?.status && (
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                store.status === 'active' ? 'bg-green-500' :
                store.status === 'pending_approval' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}>
                {store.status === 'active' ? 'Active' :
                 store.status === 'pending_approval' ? 'Pending Approval' :
                 'Inactive'}
              </span>
            )}
            {!store && (
              <Link
                href="/agent/store/create"
                className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
              >
                Create Store
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {store && (
        <div className="mb-6">
          <DashboardActions storeUrl={storeUrl} />
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-400 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-gray-800 mb-2">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
              <p className="text-sm text-gray-700 mt-1">
                {totalOrders} total orders
              </p>
            </div>
            <svg className="h-10 w-10 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-gray-400 mb-2">Orders</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total transactions
              </p>
            </div>
            <svg className="h-10 w-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-gray-400 mb-2">Net Profit</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(netProfit)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total earnings
              </p>
            </div>
            <svg className="h-10 w-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-gray-400 mb-2">Avg Order</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(avgOrder)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Average per order
              </p>
            </div>
            <svg className="h-10 w-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Wallet Balance Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Wallet Balance</h2>
          <Link href="/agent/withdrawals/request" className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Request Withdrawal
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-yellow-400 rounded-lg p-5">
            <p className="text-sm text-gray-800 mb-2">Available</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(wallet.available_balance)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <p className="text-sm text-gray-400 mb-2">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(wallet.pending_balance)}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
            <p className="text-sm text-gray-400 mb-2">Total Earnings</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(wallet.total_earnings)}</p>
          </div>
        </div>
      </div>

      {/* Recent Customers */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Customers</h2>
          {recentTransactions && recentTransactions.length > 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {transaction.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatCurrency(transaction.selling_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.order_status === 'completed' ? 'bg-green-500 text-white' :
                          transaction.order_status === 'pending' ? 'bg-yellow-400 text-gray-900' :
                          'bg-red-500 text-white'
                        }`}>
                          {transaction.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            <p className="mt-4 text-sm text-gray-400">No customers yet</p>
            </div>
          )}
        </div>
      </div>
  )
}
