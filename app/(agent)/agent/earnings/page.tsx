import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

export default async function EarningsPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('agent_id', user.id)
    .single()

  const wallet = store?.wallet || {
    available_balance: 0,
    pending_balance: 0,
    total_earnings: 0,
    total_withdrawn: 0,
  }

  // Get recent withdrawals
  const { data: withdrawals } = store
    ? await supabase
        .from('agent_withdrawals')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
    : { data: null }

  if (!store) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h2 className="text-xl font-semibold text-gray-900">No Store Yet</h2>
          <p className="mt-2 text-gray-600">
            You need to create a store first to view earnings.
          </p>
          <Link
            href="/agent/store/create"
            className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="mt-2 text-gray-600">Track your earnings and withdrawals</p>
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="overflow-hidden rounded-lg bg-green-50 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-green-600">
            Available Balance
          </dt>
          <dd className="mt-1 flex items-baseline">
            <div className="flex items-baseline text-2xl font-semibold text-green-900">
              {formatCurrency(wallet.available_balance)}
            </div>
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-yellow-50 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-yellow-600">
            Pending Balance
          </dt>
          <dd className="mt-1 flex items-baseline">
            <div className="flex items-baseline text-2xl font-semibold text-yellow-900">
              {formatCurrency(wallet.pending_balance)}
            </div>
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-blue-50 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-blue-600">
            Total Earnings
          </dt>
          <dd className="mt-1 flex items-baseline">
            <div className="flex items-baseline text-2xl font-semibold text-blue-900">
              {formatCurrency(wallet.total_earnings)}
            </div>
          </dd>
        </div>

        <div className="overflow-hidden rounded-lg bg-gray-50 px-4 py-5 shadow sm:p-6">
          <dt className="truncate text-sm font-medium text-gray-600">
            Total Withdrawn
          </dt>
          <dd className="mt-1 flex items-baseline">
            <div className="flex items-baseline text-2xl font-semibold text-gray-900">
              {formatCurrency(wallet.total_withdrawn)}
            </div>
          </dd>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="mb-8">
        <a
          href="/agent/withdrawals/request"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Request Withdrawal
        </a>
        {wallet.available_balance < 10 && (
          <p className="mt-2 text-sm text-gray-500">
            Minimum withdrawal amount is GHS 10.00
          </p>
        )}
      </div>

      {/* Recent Withdrawals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h2>
        {withdrawals && withdrawals.length > 0 ? (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Withdrawal ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {withdrawal.withdrawal_id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(withdrawal.requested_amount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {withdrawal.method}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        withdrawal.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 shadow text-center">
            <p className="text-gray-500">No withdrawal history yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

