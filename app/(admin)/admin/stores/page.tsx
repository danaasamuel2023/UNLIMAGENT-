import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function AdminStoresPage() {
  const supabase = createAdminClient()

  const { data: stores } = await supabase
    .from('agent_stores')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Agent Stores
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage all agent stores and their settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {stores?.length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Stores</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stores?.filter(s => s.status === 'active').length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Active Stores</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {stores?.filter(s => s.status === 'pending_approval').length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Pending Approval</div>
        </div>
      </div>

      {/* Stores List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Stores</h2>
          
          {stores && stores.length > 0 ? (
            <div className="space-y-4">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/admin/stores/${store.id}`}
                  className="block glass rounded-xl p-6 card-hover transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{store.store_name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{store.store_name}</h3>
                        <p className="text-sm text-gray-600">{store.store_slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        store.status === 'active' ? 'bg-green-100 text-green-800' :
                        store.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                        store.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {store.status}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="mt-4 text-sm">No stores found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

