'use client'

interface Store {
  id: string
  store_name: string
  store_description?: string
  store_logo_url?: string
  contact_info?: {
    phone_number?: string
    whatsapp_number?: string
    email?: string
    address?: string
  }
  business_hours?: any
}

interface StoreInfoProps {
  store: Store
}

export default function StoreInfo({ store }: StoreInfoProps) {
  return (
    <div className="space-y-5">
      {/* Store Logo & Info */}
      <div className="glass rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          {store.store_logo_url ? (
            <img 
              src={store.store_logo_url} 
              alt={store.store_name}
              className="h-16 w-16 rounded-xl object-cover border-2 border-white/50 shadow-md"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <span className="text-2xl">🏪</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{store.store_name}</h3>
            <p className="text-xs text-gray-500">Official Store</p>
          </div>
        </div>
        {store.store_description && (
          <p className="text-sm text-gray-600 leading-relaxed">{store.store_description}</p>
        )}
      </div>

      {(store.contact_info?.phone_number || store.contact_info?.email || store.contact_info?.address) && (
        <div className="glass rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
              <span className="text-xl">📞</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Contact</h3>
          </div>
          <dl className="space-y-3">
            {store.contact_info?.phone_number && (
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</dt>
                <dd>
                  <a href={`tel:${store.contact_info.phone_number}`} className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    {store.contact_info.phone_number}
                  </a>
                </dd>
              </div>
            )}
            {store.contact_info?.email && (
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${store.contact_info.email}`} className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    {store.contact_info.email}
                  </a>
                </dd>
              </div>
            )}
            {store.contact_info?.address && (
              <div>
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</dt>
                <dd className="text-gray-900 font-semibold text-sm">{store.contact_info.address}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {store.business_hours && (
        <div className="glass rounded-2xl p-6 border border-white/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-xl">🕒</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Hours</h3>
          </div>
          <dl className="space-y-2 text-sm">
            {Object.entries(store.business_hours).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex justify-between items-center py-1.5">
                <dt className="capitalize font-semibold text-gray-600">{day}</dt>
                <dd className={`font-bold text-xs ${
                  hours.closed ? 'text-red-600' : 'text-green-600'
                }`}>
                  {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
