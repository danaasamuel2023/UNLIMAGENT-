'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CustomizeStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen gradient-bg py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Customize Your Store
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Make your store unique and attract more customers
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form className="space-y-6">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Store Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="My Awesome Store"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Store Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                placeholder="Tell customers about your store..."
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

