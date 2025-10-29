'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NETWORKS = [
  { value: 'YELLO', label: 'MTN' },
  { value: 'TELECEL', label: 'Vodafone' },
  { value: 'AT_PREMIUM', label: 'AirtelTigo (Premium)' },
  { value: 'airteltigo', label: 'AirtelTigo' },
  { value: 'at', label: 'AT' },
]

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    network: 'YELLO',
    capacity: '',
    base_price: '',
    selling_price: '',
    display_name: '',
    description: '',
    is_active: true,
    in_stock: true,
  })

  const calculateProfit = () => {
    const base = parseFloat(formData.base_price) || 0
    const selling = parseFloat(formData.selling_price) || 0
    const profit = selling - base
    const margin = base > 0 ? ((profit / base) * 100).toFixed(2) : 0
    return { profit, margin }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const profitData = calculateProfit()
      
      if (profitData.profit < 0) {
        throw new Error('Selling price must be higher than base price')
      }

      const response = await fetch('/api/agent/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: formData.network,
          capacity: parseInt(formData.capacity),
          base_price: parseFloat(formData.base_price),
          selling_price: parseFloat(formData.selling_price),
          display_name: formData.display_name,
          description: formData.description,
          is_active: formData.is_active,
          in_stock: formData.in_stock,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create product')
      }
      
      // Redirect to products page
      router.push('/agent/products')
    } catch (err: any) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const profitData = calculateProfit()

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/agent/products" className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to products
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="mt-2 text-gray-600">
          Add a new data bundle product to your store
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white shadow">
        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="network" className="block text-sm font-medium text-gray-700">
                Network *
              </label>
              <select
                id="network"
                required
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {NETWORKS.map((network) => (
                  <option key={network.value} value={network.value}>
                    {network.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity (GB) *
              </label>
              <input
                type="number"
                id="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">
                Base Price (GHS) *
              </label>
              <input
                type="number"
                id="base_price"
                required
                min="0"
                step="0.01"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700">
                Selling Price (GHS) *
              </label>
              <input
                type="number"
                id="selling_price"
                required
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Profit Preview */}
          {(formData.base_price || formData.selling_price) && (
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Profit Preview</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Profit:</span>
                  <p className={`text-lg font-semibold ${
                    profitData.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    GHS {profitData.profit.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Profit Margin:</span>
                  <p className={`text-lg font-semibold ${
                    profitData.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profitData.margin}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., MTN 5GB Monthly Plan"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to auto-generate from network and capacity
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Optional product description..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Product is active
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="in_stock"
                checked={formData.in_stock}
                onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-700">
                Product is in stock
              </label>
            </div>
          </div>
        </div>

        <div className="border-t bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <Link
            href="/agent/products"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

