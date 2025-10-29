'use client'

import Link from 'next/link'

interface QuickActionsProps {
  publicStoreUrl: string
}

export default function QuickActions({ publicStoreUrl }: QuickActionsProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicStoreUrl)
    alert('Store URL copied to clipboard!')
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-xl text-white">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/agent/store/customize"
          className="rounded-xl bg-white/20 backdrop-blur-lg px-4 py-3 text-sm font-semibold hover:bg-white/30 transition-colors"
        >
          ✏️ Edit Store Info
        </Link>
        <Link
          href="/agent/products"
          className="rounded-xl bg-white/20 backdrop-blur-lg px-4 py-3 text-sm font-semibold hover:bg-white/30 transition-colors"
        >
          📦 Manage Products
        </Link>
        <Link
          href="/agent/orders"
          className="rounded-xl bg-white/20 backdrop-blur-lg px-4 py-3 text-sm font-semibold hover:bg-white/30 transition-colors"
        >
          📋 View Orders
        </Link>
        <button
          onClick={handleCopyUrl}
          className="rounded-xl bg-white/20 backdrop-blur-lg px-4 py-3 text-sm font-semibold hover:bg-white/30 transition-colors text-left"
        >
          🔗 Copy Store URL
        </button>
      </div>
    </div>
  )
}

