import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { StoreView } from '@/components/store'

export const dynamic = 'force-dynamic'

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let supabase
  try {
    supabase = createAdminClient()
  } catch (error: any) {
    // Supabase not configured - show friendly setup page
    const errorMessage = typeof error === 'object' && error && 'message' in error ? error.message : 'Supabase configuration required'
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center rounded-3xl p-12 max-w-md bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg border border-blue-700/50 shadow-2xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/10 mb-6">
            <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Setup Required</h1>
          <p className="text-gray-400 mb-2 text-sm">{errorMessage}</p>
          <p className="text-gray-500 mb-8 text-xs">Configure your Supabase credentials in <code className="text-blue-400">.env.local</code></p>
          <div className="bg-gray-800/50 rounded-xl p-4 text-left text-sm text-gray-300 mb-6">
            <p className="mb-2 font-semibold text-white">Add these to your .env.local file:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_SERVICE_ROLE_KEY</li>
            </ul>
          </div>
          <div className="text-xs text-gray-500">
            Get started at: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com</a>
          </div>
        </div>
      </div>
    )
  }

  // Get store by slug
  const { data: store, error: storeError } = await supabase
    .from('agent_stores')
    .select('*')
    .eq('store_slug', slug)
    .single()

  // Only show error if store is not active or doesn't exist
  if (storeError || !store || store.status !== 'active') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center rounded-3xl p-12 max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 shadow-2xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6">
            <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Store Not Found</h1>
          <p className="text-gray-400 mb-8 text-lg">The store you're looking for doesn't exist or is not available.</p>
          <Link href="/stores" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Browse All Stores
          </Link>
        </div>
      </div>
    )
  }

  // Get active products for this store
  const { data: products } = await supabase
    .from('agent_products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .eq('in_stock', true)
    .order('selling_price', { ascending: true })

  const networks = Array.from(new Set(products?.map(p => p.network) || []))
  
  // Group products by network
  const productsByNetwork = networks.reduce((acc, network) => {
    acc[network] = products?.filter(p => p.network === network) || []
    return acc
  }, {} as Record<string, typeof products>)

  const primaryNetwork = networks[0] || 'MTN'

  return <StoreView store={store} products={products || []} networks={networks} productsByNetwork={productsByNetwork} primaryNetwork={primaryNetwork} />
}
