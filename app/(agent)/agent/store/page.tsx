import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

export default async function AgentStorePage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please log in to view your store.</p>
      </div>
    )
  }

  // Get or create agent store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('agent_id', user.id)
    .single()

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Store Management
        </h1>
        <p className="mt-2 text-lg text-gray-600">Manage your store profile and settings</p>
      </div>

      {!store ? (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 text-center shadow-lg border border-blue-100">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Your Store</h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            You don&apos;t have a store yet. Create one to start selling and earning!
          </p>
          <Link
            href="/agent/store/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Store
          </Link>
        </div>
      ) : (
        <>
          {/* Store Status Banner */}
          <div className={`mb-6 rounded-2xl border-2 p-6 shadow-lg ${
            store.status === 'active' 
              ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' 
              : store.status === 'pending_approval'
              ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50'
              : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`rounded-full p-4 ${
                  store.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{store.store_name}</h3>
                  <p className="text-sm text-gray-600">Store ID: {store.id}</p>
                </div>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
                store.status === 'active' ? 'bg-green-100 text-green-800' :
                store.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {store.status === 'active' ? '✓ Active' : store.status === 'pending_approval' ? '⏳ Pending Approval' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Store Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Information */}
              <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Store Information</h2>
                </div>
                
                <dl className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Store Name</dt>
                    <dd className="text-sm font-semibold text-gray-900">{store.store_name}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Store Slug</dt>
                    <dd className="text-sm font-semibold text-gray-900">/{store.store_slug}</dd>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <dt className="text-sm font-medium text-gray-500">Store URL</dt>
                    <dd className="text-sm font-semibold text-blue-600">
                      <a href={`/store/${store.store_slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View Public Store →
                      </a>
                    </dd>
                  </div>
                  {store.created_at && (
                    <div className="flex justify-between py-3">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {new Date(store.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 flex gap-3">
                  <button className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                    Edit Store
                  </button>
                  <button className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-blue-600 hover:text-blue-600">
                    Customize
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              {store.contact_info && (
                <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
                  </div>
                  
                  <dl className="space-y-4">
                    {store.contact_info.phone_number && (
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                        <dd className="text-sm font-semibold text-gray-900">{store.contact_info.phone_number}</dd>
                      </div>
                    )}
                    {store.contact_info.whatsapp_number && (
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                        <dd className="text-sm font-semibold text-gray-900">{store.contact_info.whatsapp_number}</dd>
                      </div>
                    )}
                    {store.contact_info.email && (
                      <div className="flex justify-between py-3">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm font-semibold text-gray-900">{store.contact_info.email}</dd>
                      </div>
                    )}
                  </dl>

                  <button className="mt-6 w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-purple-600 hover:text-purple-600">
                    Edit Contact Info
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-2xl text-white">
                <h2 className="mb-6 text-xl font-bold">Quick Stats</h2>
                
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-medium text-blue-100">Total Orders</dt>
                    <dd className="mt-2 text-3xl font-bold">
                      {store.metrics?.total_orders || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-blue-100">Total Revenue</dt>
                    <dd className="mt-2 text-3xl font-bold">
                      {formatCurrency(store.metrics?.total_revenue || 0)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-blue-100">Total Customers</dt>
                    <dd className="mt-2 text-3xl font-bold">
                      {store.metrics?.total_customers || 0}
                    </dd>
                  </div>
                  {store.metrics?.rating && (
                    <div>
                      <dt className="text-sm font-medium text-blue-100">Rating</dt>
                      <dd className="mt-2 flex items-center gap-2">
                        <span className="text-3xl font-bold">{store.metrics.rating.toFixed(1)}</span>
                        <div className="flex text-yellow-300">
                          {'★'.repeat(Math.round(store.metrics.rating))}
                          {'☆'.repeat(5 - Math.round(store.metrics.rating))}
                        </div>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Action Cards */}
              <Link href="/agent/products" className="block rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-emerald-100 p-3">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage Products</h3>
                    <p className="text-sm text-gray-500">Add or edit products</p>
                  </div>
                </div>
              </Link>

              <Link href="/agent/orders" className="block rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-orange-100 p-3">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Orders</h3>
                    <p className="text-sm text-gray-500">Track all transactions</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}

