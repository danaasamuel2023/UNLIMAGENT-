import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { formatCurrency } from '@/lib/utils/format'
import Link from 'next/link'

export default async function WithdrawalsPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's withdrawals
  const { data: withdrawals } = await supabase
    .from('agent_withdrawals')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  // Get agent's wallet
  const { data: store } = await supabase
    .from('agent_stores')
    .select('wallet')
    .eq('agent_id', user.id)
    .single()

  const wallet = store?.wallet || {
    available_balance: 0,
    pending_balance: 0,
    total_earnings: 0,
    total_withdrawn: 0,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-400 text-gray-900'
      case 'rejected':
        return 'bg-red-500 text-white'
      case 'processing':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gray-800 border-b border-gray-700 mb-6 -mx-4 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
            <p className="text-sm text-gray-400 mt-1">View and manage your withdrawal requests</p>
          </div>
          <Link
            href="/agent/withdrawals/request"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Request Withdrawal
          </Link>
        </div>
      </div>

      {/* Wallet Balance Section */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-400 rounded-lg p-5">
          <p className="text-sm text-gray-800 mb-2">Available</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(wallet.available_balance)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <p className="text-sm text-gray-400 mb-2">Pending</p>
          <p className="text-2xl font-bold text-orange-400">{formatCurrency(wallet.pending_balance)}</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
          <p className="text-sm text-gray-400 mb-2">Total Withdrawn</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(wallet.total_withdrawn)}</p>
        </div>
      </div>

      {/* Withdrawals List */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Withdrawal History</h2>
        {withdrawals && withdrawals.length > 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Withdrawal ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {withdrawal.withdrawal_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(withdrawal.requested_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">
                        {withdrawal.method?.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            withdrawal.status
                          )}`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-400">No withdrawals yet</p>
            <Link
              href="/agent/withdrawals/request"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Your First Withdrawal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

