import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import ApproveStoreButton from '@/components/admin/ApproveStoreButton'
import RejectStoreButton from '@/components/admin/RejectStoreButton'

export default async function AdminStoresApprovePage() {
  const supabase = createAdminClient()

  // Get stores pending approval
  const { data: stores } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false })

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
          Back to all stores
        </Link>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Approve Stores
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Review and approve pending store registrations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {stores?.length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Stores Pending</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stores?.filter(s => s.contact_info?.phone_number).length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">With Contact Info</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {stores?.filter(s => s.created_at).length || 0}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">New Requests</div>
        </div>
      </div>

      {/* Stores List */}
      <div className="glass rounded-2xl overflow-hidden">
        {stores && stores.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {stores.map((store) => (
              <div key={store.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">{store.store_name.charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">{store.store_name}</h3>
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pending Approval
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{store.store_slug}</p>
                      {store.store_description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{store.store_description}</p>
                      )}
                      
                      {/* Contact Info */}
                      {store.contact_info && (
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          {store.contact_info.phone_number && (
                            <div className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {store.contact_info.phone_number}
                            </div>
                          )}
                          {store.contact_info.whatsapp_number && (
                            <div className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {store.contact_info.whatsapp_number}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <RejectStoreButton storeId={store.id} storeName={store.store_name} />
                    <ApproveStoreButton storeId={store.id} storeName={store.store_name} />
                    <Link
                      href={`/admin/stores/${store.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      View Details
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold text-gray-900">No stores pending approval</p>
            <p className="mt-2 text-sm">All stores have been reviewed</p>
          </div>
        )}
      </div>
    </div>
  )
}

