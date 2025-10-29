import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import ApproveStoreButton from '@/components/admin/ApproveStoreButton'
import RejectStoreButton from '@/components/admin/RejectStoreButton'

export default async function AdminStoreDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: store, error: storeError } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('id', id)
    .single()

  if (storeError || !store) {
    notFound()
  }

  // Get agent info
  const { data: agentUser } = await supabase.auth.admin.getUserById(store.agent_id)
  const agent = agentUser?.user

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link 
          href="/admin/stores" 
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to stores
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {store.store_name}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Review and manage store details
            </p>
          </div>
          
          {/* Status Badge */}
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
            store.status === 'active' ? 'bg-green-100 text-green-800' :
            store.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
            store.status === 'suspended' ? 'bg-red-100 text-red-800' :
            store.status === 'closed' ? 'bg-gray-100 text-gray-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {store.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {store.status === 'pending_approval' && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Store Pending Approval</h3>
              <p className="mt-1 text-sm text-gray-600">
                Review the store details below and approve or reject this store
              </p>
            </div>
            <div className="flex gap-3">
              <RejectStoreButton storeId={store.id} storeName={store.store_name} />
              <ApproveStoreButton storeId={store.id} storeName={store.store_name} />
            </div>
          </div>
        </div>
      )}

      {/* Store Information */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Information</h2>
            
            <dl className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-600">Store Name</dt>
                <dd className="text-sm font-semibold text-gray-900">{store.store_name}</dd>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-600">Store Slug</dt>
                <dd className="text-sm font-semibold text-gray-900">{store.store_slug}</dd>
              </div>
              {store.store_description && (
                <div className="py-3 border-b border-gray-200">
                  <dt className="text-sm font-medium text-gray-600 mb-2">Description</dt>
                  <dd className="text-sm text-gray-900">{store.store_description}</dd>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <dt className="text-sm font-medium text-gray-600">Status</dt>
                <dd>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    store.status === 'active' ? 'bg-green-100 text-green-800' :
                    store.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                    store.status === 'suspended' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {store.status}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-sm font-medium text-gray-600">Created</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(store.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* Contact Information */}
          {store.contact_info && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              
              <dl className="space-y-4">
                {store.contact_info.phone_number && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-600">Phone Number</dt>
                    <dd className="text-sm font-semibold text-gray-900">{store.contact_info.phone_number}</dd>
                  </div>
                )}
                {store.contact_info.whatsapp_number && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <dt className="text-sm font-medium text-gray-600">WhatsApp</dt>
                    <dd className="text-sm font-semibold text-gray-900">{store.contact_info.whatsapp_number}</dd>
                  </div>
                )}
                {store.contact_info.email && (
                  <div className="flex items-center justify-between py-3">
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="text-sm font-semibold text-gray-900">{store.contact_info.email}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Agent Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{agent?.email?.charAt(0) || 'A'}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{agent?.email}</div>
                  <div className="text-xs text-gray-500">Agent</div>
                </div>
              </div>
                {agent?.user_metadata?.name && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-sm font-medium text-gray-900">{agent.user_metadata.name}</div>
                  </div>
                )}
            </div>
          </div>

          {/* Metrics */}
          {store.metrics && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Store Metrics</h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <dt className="text-xs text-gray-600">Total Orders</dt>
                  <dd className="text-sm font-bold text-gray-900">{store.metrics.total_orders || 0}</dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-xs text-gray-600">Total Revenue</dt>
                  <dd className="text-sm font-bold text-gray-900">{formatCurrency(store.metrics.total_revenue || 0)}</dd>
                </div>
                <div className="flex items-center justify-between py-2">
                  <dt className="text-xs text-gray-600">Total Customers</dt>
                  <dd className="text-sm font-bold text-gray-900">{store.metrics.total_customers || 0}</dd>
                </div>
                {store.metrics.rating && (
                  <div className="flex items-center justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                    <dt className="text-xs text-gray-600">Rating</dt>
                    <dd className="text-sm font-bold text-gray-900">{store.metrics.rating.toFixed(1)} ⭐</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <Link
                href={`/store/${store.store_slug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Store
              </Link>
              
              {store.status === 'suspended' && (
                <button className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reactivate Store
                </button>
              )}
              
              {store.status === 'active' && (
                <button className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Suspend Store
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

