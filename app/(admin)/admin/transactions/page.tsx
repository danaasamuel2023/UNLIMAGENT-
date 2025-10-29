import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminTransactionsPage() {
  const supabase = createAdminClient()

  const { data: transactions } = await supabase
    .from('agent_transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const totalRevenue = transactions?.reduce((sum, t) => sum + (t.selling_price || 0), 0) || 0
  const completedCount = transactions?.filter(t => t.order_status === 'completed').length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Transactions
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Monitor all platform transactions and activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {transactions?.length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Transactions</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {completedCount}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Completed</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            GHS {totalRevenue.toFixed(2)}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Revenue</div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.transaction_id}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{transaction.phone_number}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">GHS {transaction.selling_price}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          transaction.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.order_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="mt-4 text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

