import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import UpdateOrderStatus from '@/components/agent/UpdateOrderStatus'
import NetworkLogo from '@/components/public/NetworkLogo'
import { format } from 'date-fns'

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get the transaction/order
  const { data: order } = await supabase
    .from('agent_transactions')
    .select('*')
    .eq('id', params.id)
    .eq('agent_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  // Get product details if available
  const { data: product } = order.product_id
    ? await supabase
        .from('agent_products')
        .select('*')
        .eq('id', order.product_id)
        .single()
    : { data: null }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Order Details
          </h1>
          <p className="mt-2 text-lg text-gray-600">Transaction ID: {order.transaction_id}</p>
        </div>
        <Link
          href="/agent/orders"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
            <div className="mb-6 flex items-start gap-4">
              <NetworkLogo network={order.network} className="h-20 w-20 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {order.network} {order.capacity}GB
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {order.mb ? `${order.mb} MB` : `${order.capacity} GB`}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">{order.transaction_id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Phone Number</span>
                <span className="text-sm font-semibold text-gray-900">{order.phone_number}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Quantity</span>
                <span className="text-sm font-semibold text-gray-900">{order.quantity}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Order Status</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.order_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Payment Status</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.payment_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Delivery Status</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.delivery_status === 'delivered' || order.delivery_status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.delivery_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.delivery_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.delivery_status || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 shadow-xl border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Financial Details</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-blue-100">
                <span className="text-sm font-medium text-gray-700">Selling Price</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(order.selling_price)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-blue-100">
                <span className="text-sm font-medium text-gray-700">Base Price</span>
                <span className="text-sm font-semibold text-gray-600">{formatCurrency(order.base_price)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-blue-100">
                <span className="text-sm font-medium text-gray-700">Profit</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(order.profit)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-blue-100">
                <span className="text-sm font-medium text-gray-700">Platform Fee</span>
                <span className="text-sm font-semibold text-gray-600">{formatCurrency(order.platform_fee || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-base font-bold text-gray-900">Net Profit</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(order.net_profit)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.customer_name || order.customer_phone || order.customer_email && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h3>
              <div className="space-y-4">
                {order.customer_name && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{order.customer_name}</span>
                  </div>
                )}
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">Phone:</span>
                    <span className="text-sm font-semibold text-gray-900">{order.customer_phone}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-32">Email:</span>
                    <span className="text-sm font-semibold text-gray-900">{order.customer_email}</span>
                  </div>
                )}
                {order.customer_message && (
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Message:</span>
                    <p className="text-sm text-gray-700">{order.customer_message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {(order.agent_notes || order.customer_notes || order.system_notes) && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Notes</h3>
              <div className="space-y-4">
                {order.agent_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Agent Notes:</span>
                    <p className="text-sm text-gray-700">{order.agent_notes}</p>
                  </div>
                )}
                {order.customer_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Customer Notes:</span>
                    <p className="text-sm text-gray-700">{order.customer_notes}</p>
                  </div>
                )}
                {order.system_notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">System Notes:</span>
                    <p className="text-sm text-gray-700">{order.system_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
            <div className="space-y-4">
              <UpdateOrderStatus 
                transactionId={order.id} 
                currentStatus={order.delivery_status || 'pending'} 
              />
              
              {order.phone_number && (
                <a
                  href={`https://wa.me/${order.phone_number.replace(/[^0-9]/g, '')}?text=Hi, regarding your order ${order.transaction_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-green-700"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Contact via WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <div className="h-full w-0.5 bg-gray-200"></div>
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm font-semibold text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(order.created_at), 'PPpp')}
                  </p>
                </div>
              </div>
              
              {order.completed_at && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Order Completed</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(order.completed_at), 'PPpp')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Info</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Method:</span>
                <p className="text-sm font-semibold text-gray-900 capitalize mt-1">{order.payment_method}</p>
              </div>
              {order.payment_reference && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Reference:</span>
                  <p className="text-sm font-mono text-gray-900 mt-1">{order.payment_reference}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
