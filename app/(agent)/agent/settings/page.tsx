import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { formatCurrency } from '@/lib/utils/format'
import Link from 'next/link'
import QuickActions from '@/components/agent/QuickActions'
import CopyStoreUrlButton from '@/components/agent/CopyStoreUrlButton'
import LogoUpload from '@/components/agent/LogoUpload'

export default async function SettingsPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('agent_id', user.id)
    .single()

  // Get recent transactions count
  const { count: transactionCount } = await supabase
    .from('agent_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', user.id)

  if (!store) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-12 text-center shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900">No Store Yet</h2>
        <p className="mt-2 text-gray-600">
          You need to create a store first to view settings.
        </p>
        <Link
          href="/agent/store/create"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          Create Store
        </Link>
      </div>
    )
  }

  const publicStoreUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/store/${store.store_slug}`

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-2 text-lg text-gray-600">Manage your account and store settings</p>
        </div>
        {/* View Public Store Button */}
        <Link
          href={`/store/${store.store_slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Public Store
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions publicStoreUrl={publicStoreUrl} />

          {/* Store Logo Upload */}
          <LogoUpload 
            currentLogoUrl={store.store_logo_url}
            storeName={store.store_name}
          />

          {/* Store Settings */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Store Settings
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">Store Name</label>
                <p className="text-sm font-semibold text-gray-900">{store.store_name}</p>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">Store Slug</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{store.store_slug}</code>
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">Store URL</label>
                <a 
                  href={publicStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  {publicStoreUrl}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  store.status === 'active' ? 'bg-green-100 text-green-800' :
                  store.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {store.status}
                </span>
              </div>
              {store.store_description && (
                <div className="flex justify-between items-start py-3">
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-600 max-w-md text-right">{store.store_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {store.contact_info && (
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {store.contact_info.phone_number && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="text-sm font-semibold text-gray-900">{store.contact_info.phone_number}</p>
                  </div>
                )}
                {store.contact_info.whatsapp_number && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500">WhatsApp Number</label>
                    <p className="text-sm font-semibold text-gray-900">{store.contact_info.whatsapp_number}</p>
                  </div>
                )}
                {store.contact_info.email && (
                  <div className="flex justify-between items-center py-3">
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm font-semibold text-gray-900">{store.contact_info.email}</p>
                  </div>
                )}
                <Link
                  href="/agent/store/customize"
                  className="mt-4 block w-full text-center rounded-xl border-2 border-purple-300 px-4 py-3 text-sm font-semibold text-purple-700 transition-colors hover:border-purple-600 hover:bg-purple-50"
                >
                  Edit Contact Info
                </Link>
              </div>
            </div>
          )}

          {/* Account Settings */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Settings
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{user.id}</code>
              </div>
              <div className="flex justify-between items-center py-3">
                <label className="block text-sm font-medium text-gray-500">Role</label>
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                  Agent
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 shadow-2xl text-white">
            <h2 className="text-lg font-bold mb-4">Quick Stats</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-indigo-200">Total Orders</dt>
                <dd className="text-3xl font-bold">{transactionCount || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-indigo-200">Total Earnings</dt>
                <dd className="text-3xl font-bold">{formatCurrency(store.wallet?.total_earnings || 0)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-indigo-200">Available Balance</dt>
                <dd className="text-3xl font-bold">{formatCurrency(store.wallet?.available_balance || 0)}</dd>
              </div>
            </dl>
          </div>

          {/* Share Store Card */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Share Your Store</h3>
            <p className="text-sm text-gray-600 mb-4">Share your store link with customers and grow your business</p>
            <div className="space-y-2">
              <input
                type="text"
                readOnly
                value={publicStoreUrl}
                className="w-full px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg"
              />
              <CopyStoreUrlButton url={publicStoreUrl} />
            </div>
          </div>

          {/* Store Preview */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Store Preview</h3>
            </div>
            <div className="p-4">
              <Link 
                href={`/store/${store.store_slug}`}
                target="_blank"
                className="block relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl overflow-hidden group"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="text-center text-white">
                    <svg className="h-12 w-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <p className="font-semibold">View Store</p>
                  </div>
                </div>
              </Link>
              <p className="text-xs text-gray-500 mt-2 text-center">Click to view your public store</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

