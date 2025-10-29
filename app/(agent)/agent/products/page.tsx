import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

export default async function ProductsPage() {
  const supabase = createAdminClient()
  const user = await getCurrentUser()

  if (!user) return null

  // Get agent's store
  const { data: store } = await supabase
    .from('agent_stores')
    .select('id')
    .eq('agent_id', user.id)
    .single()

  // Get products
  const { data: products } = store
    ? await supabase
        .from('agent_products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
    : { data: null }

  if (!store) {
    return (
      <div className="rounded-2xl bg-gray-800 border border-gray-700 p-12 text-center">
        <h2 className="text-2xl font-bold text-white">No Store Yet</h2>
        <p className="mt-2 text-gray-400">
          You need to create a store first to add products.
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Products
          </h1>
          <p className="mt-2 text-lg text-gray-400">Manage your product catalog</p>
        </div>
        <Link
          href="/agent/products/create"
          className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 shadow-xl">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Selling Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                    {product.display_name || `${product.network} ${product.capacity}GB`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {product.network}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-yellow-400">
                    {formatCurrency(product.selling_price)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-green-400">
                    {formatCurrency(product.profit)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      product.is_active ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Link href={`/agent/products/edit/${product.id}`} className="text-yellow-400 hover:text-yellow-500">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-800 border border-gray-700">
          <div className="mb-4 rounded-full bg-gray-700 p-6">
            <svg className="h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white">No products yet</p>
          <p className="mt-2 text-sm text-gray-400">Add your first product to get started</p>
          <Link
            href="/agent/products/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      )}
    </>
  )
}

