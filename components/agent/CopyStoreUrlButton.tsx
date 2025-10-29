'use client'

import { useState } from 'react'

interface CopyStoreUrlButtonProps {
  url: string
}

export default function CopyStoreUrlButton({ url }: CopyStoreUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105"
    >
      {copied ? '✅ Copied!' : '📋 Copy Link'}
    </button>
  )
}

