import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import ProcessWithdrawalButton from '@/components/admin/ProcessWithdrawalButton'

export default async function AdminWithdrawalsPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data: withdrawals } = await supabase
    .from('agent_withdrawals')
    .select(`
      *,
      agent_stores!inner(store_name, agent_id)
    `)
    .order('created_at', { ascending: false })

  const pendingWithdrawals = withdrawals?.filter((w: any) => w.status === 'pending') || []
  const processingWithdrawals = withdrawals?.filter((w: any) => w.status === 'processing') || []
  const completedWithdrawals = withdrawals?.filter((w: any) => w.status === 'completed') || []
  const allWithdrawals = withdrawals || []

  const pendingCount = pendingWithdrawals.length
  const processingCount = processingWithdrawals.length
  const completedCount = completedWithdrawals.length
  const rejectedCount = withdrawals?.filter((w: any) => w.status === 'rejected').length || 0

  const getMethodDisplay = (withdrawal: any) => {
    if (!withdrawal.account_details) return 'N/A'
    
    if (withdrawal.method === 'momo' && withdrawal.account_details.momo_number) {
      return `${withdrawal.account_details.momo_number}`
    }
    
    if (withdrawal.method === 'bank' && withdrawal.account_details.account_number) {
      return `***${withdrawal.account_details.account_number.slice(-4)}`
    }
    
    return withdrawal.method
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Withdrawal Management
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Process and manage agent withdrawal requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6 border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Pending Review</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{processingCount}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">In Processing</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Completed</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-sm font-medium text-gray-600 mt-2">Rejected</div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Withdrawals - Priority Section */}
      {pendingWithdrawals.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="bg-amber-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚠️</span> Pending Review ({pendingCount})
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal: any) => (
                <div key={withdrawal.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-amber-300 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Withdrawal ID</p>
                        <p className="font-semibold text-gray-900">{withdrawal.withdrawal_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Store</p>
                        <p className="font-semibold text-gray-900">{withdrawal.agent_stores?.store_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Amount & Payment Method</p>
                        <p className="font-bold text-green-600">{formatCurrency(withdrawal.requested_amount)}</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {withdrawal.method} • {getMethodDisplay(withdrawal)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <ProcessWithdrawalButton withdrawal={withdrawal} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Requested: {formatDateTime(withdrawal.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing Withdrawals */}
      {processingWithdrawals.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="bg-blue-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span> In Processing ({processingCount})
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {processingWithdrawals.map((withdrawal: any) => (
                <div key={withdrawal.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{withdrawal.withdrawal_id}</p>
                      <p className="text-sm text-gray-600">{withdrawal.agent_stores?.store_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(withdrawal.requested_amount)}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(withdrawal.created_at)}</p>
                    </div>
                    <div>
                      <ProcessWithdrawalButton withdrawal={withdrawal} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Withdrawals Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Withdrawals</h2>
          <p className="text-sm text-gray-600 mt-1">Complete withdrawal history</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allWithdrawals.map((withdrawal: any) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{withdrawal.withdrawal_id}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900">{withdrawal.agent_stores?.store_name || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(withdrawal.requested_amount)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 capitalize">{withdrawal.method}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                      withdrawal.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(withdrawal.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ProcessWithdrawalButton withdrawal={withdrawal} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {allWithdrawals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No withdrawals found</p>
          </div>
        )}
      </div>
    </div>
  )
}
