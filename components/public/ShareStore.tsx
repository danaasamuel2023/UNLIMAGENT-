'use client'

import { useState } from 'react'

interface ShareStoreProps {
  storeSlug: string
  storeName: string
  baseUrl: string
}

export default function ShareStore({ storeSlug, storeName, baseUrl }: ShareStoreProps) {
  const [copied, setCopied] = useState(false)
  const storeUrl = `${baseUrl}/store/${storeSlug}`

  const handleCopy = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${storeName}`,
          text: `Browse data bundles at ${storeName}`,
          url: storeUrl,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      handleCopy()
    }
  }

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      href: `https://wa.me/?text=Check out ${storeName} - ${encodeURIComponent(storeUrl)}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Facebook',
      icon: '📘',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: '🐦',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(storeUrl)}&text=${encodeURIComponent(`Check out ${storeName}`)}`,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'Copy Link',
      icon: copied ? '✓' : '🔗',
      onClick: handleCopy,
      color: copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700',
    },
  ]

  return (
    <div className="glass rounded-2xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Store</h3>
      <div className="grid grid-cols-2 gap-3">
        {shareLinks.map((link) => (
          link.onClick ? (
            <button
              key={link.name}
              onClick={link.onClick}
              className={`${link.color} text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm">{copied ? 'Copied!' : link.name}</span>
            </button>
          ) : (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white font-semibold py-3 px-4 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2`}
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm">{link.name}</span>
            </a>
          )
        ))}
      </div>
    </div>
  )
}

