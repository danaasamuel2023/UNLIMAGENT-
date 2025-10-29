'use client'

import Link from 'next/link'

interface DashboardActionsProps {
  storeUrl: string
  onCopy?: () => void
}

export default function DashboardActions({ storeUrl, onCopy }: DashboardActionsProps) {
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(storeUrl)
    if (onCopy) {
      onCopy()
    } else {
      alert('Store URL copied to clipboard!')
    }
  }

  const handleWhatsAppShare = () => {
    const message = `Check out my store: ${storeUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button 
        onClick={handleCopyUrl}
        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy Store Link
      </button>
      
      <button 
        onClick={handleWhatsAppShare}
        className="flex items-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium text-white transition-colors"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198.21.297.173.446-.037.149-.149.223-.298.372-.15.149-.297.298-.446.447-.173.198-.347.394-.149.794.198.397.883 1.518 1.896 2.451 1.32 1.252 3.05 1.985 4.681 1.535.466-.134.894-.335 1.254-.608.594-.437 1.04-1.016 1.304-1.633.174-.495-.05-.99-.223-1.354-.15-.25-.669-1.59-.936-2.18l-.02-.003z"/>
        </svg>
        Share on WhatsApp
      </button>
      
      <Link 
        href={storeUrl}
        target="_blank"
        className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View Public Store
      </Link>
      
      <Link 
        href="/agent/products"
        className="flex items-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-medium text-white transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Manage Products
      </Link>
    </div>
  )
}

