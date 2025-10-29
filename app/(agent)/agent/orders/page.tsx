import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import UpdateOrderStatus from '@/components/agent/UpdateOrderStatus'

export default async function OrdersPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('id')
    .eq('agent_id', user.id)
    .single()

  // Get orders/transactions
  const { data: orders } = store
    ? await supabase
        .from('agent_transactions')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
    : { data: null }

  if (!store) {
    return (
      <div className="rounded-2xl bg-gray-800 border border-gray-700 p-12 text-center">
        <h2 className="text-2xl font-bold text-white">No Store Yet</h2>
        <p className="mt-2 text-gray-400">
          You need to create a store first to view orders.
        </p>
        <Link
          href="/agent/store/create"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          Create Store
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Orders
        </h1>
        <p className="mt-2 text-lg text-gray-400">View and manage all your orders</p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 shadow-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Network & Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Order Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Delivery Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                      <Link href={`/agent/orders/${order.id}`} className="text-yellow-400 hover:text-yellow-500 hover:underline">
                        {order.transaction_id}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {order.network} {order.capacity}GB
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                      {order.phone_number}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-yellow-400">
                      {formatCurrency(order.selling_price)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.payment_status === 'completed' ? 'bg-green-500 text-white' :
                        order.payment_status === 'pending' ? 'bg-yellow-400 text-gray-900' :
                        'bg-red-500 text-white'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.order_status === 'completed' ? 'bg-green-500 text-white' :
                        order.order_status === 'processing' ? 'bg-blue-500 text-white' :
                        order.order_status === 'pending' ? 'bg-yellow-400 text-gray-900' :
                        'bg-gray-600 text-white'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        order.delivery_status === 'delivered' || order.delivery_status === 'completed' ? 'bg-green-500 text-white' :
                        order.delivery_status === 'processing' ? 'bg-blue-500 text-white' :
                        order.delivery_status === 'failed' ? 'bg-red-500 text-white' :
                        'bg-yellow-400 text-gray-900'
                      }`}>
                        {order.delivery_status || 'pending'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <UpdateOrderStatus 
                        transactionId={order.id} 
                        currentStatus={order.delivery_status || 'pending'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-800 border border-gray-700">
          <div className="mb-4 rounded-full bg-gray-700 p-6">
            <svg className="h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white">No orders yet</p>
          <p className="mt-2 text-sm text-gray-400">Your orders will appear here</p>
        </div>
      )}
    </>
  )
}

