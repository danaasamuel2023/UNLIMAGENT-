'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Generate slug from store name
      const storeSlug = formData.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Prepare store data
      const storeData = {
        store_name: formData.storeName,
        store_slug: storeSlug,
        store_description: formData.storeDescription,
        contact_info: {
          phone_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber,
          email: formData.email,
        },
      }

      // Call API to create store
      const response = await fetch('/api/agent/store/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: formData.storeName,
          store_description: formData.storeDescription,
          phone_number: formData.phoneNumber,
          whatsapp_number: formData.whatsappNumber,
          email: formData.email,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create store')
      }
      
      // Redirect to agent dashboard
      router.push('/agent')
    } catch (err: any) {
      setError(err.message || 'Failed to create store')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Link href="/agent" className="text-sm text-blue-400 hover:text-blue-300">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-white">Create Your Store</h1>
        <p className="mt-2 text-gray-400">
          Set up your store profile to start selling data bundles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg bg-gray-800 border border-gray-700">
        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-300">
              Store Name *
            </label>
            <input
              type="text"
              id="storeName"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="My Data Bundle Store"
            />
          </div>

          <div>
            <label htmlFor="storeDescription" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="storeDescription"
              rows={3}
              value={formData.storeDescription}
              onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Tell customers about your store..."
            />
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white">Contact Information</h3>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <div>
            <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-300">
              WhatsApp Number *
            </label>
            <input
              type="tel"
              id="whatsappNumber"
              required
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="+233 XX XXX XXXX"
            />
            <p className="mt-1 text-xs text-gray-400">
              Customers will contact you via WhatsApp
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="store@example.com"
            />
          </div>
        </div>

        <div className="border-t border-gray-700 bg-gray-750 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 sm:ml-3 sm:w-auto"
          >
            {loading ? 'Creating...' : 'Create Store'}
          </button>
          <Link
            href="/agent"
            className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-gray-600 sm:mt-0 sm:w-auto"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

