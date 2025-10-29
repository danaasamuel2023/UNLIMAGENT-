'use client'

import { useState } from 'react'

interface LogoUploadProps {
  currentLogoUrl?: string
  storeName: string
}

export default function LogoUpload({ currentLogoUrl, storeName }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentLogoUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setUploading(true)

    // Preview image
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/agent/store/upload-logo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload logo')
      }

      setError('')
      // Reload page to show new logo
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Store Logo
        </h2>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo Preview */}
          <div className="relative">
            <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-4 border-white">
              {preview ? (
                <img 
                  src={preview} 
                  alt={storeName}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-5xl">🏪</span>
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <label className="cursor-pointer">
            <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {currentLogoUrl ? 'Change Logo' : 'Upload Logo'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 max-w-sm">
              {error}
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-gray-500 text-center max-w-sm">
            Upload your store logo (max 5MB). Recommended size: 512x512px. Formats: JPG, PNG, GIF.
          </p>
        </div>
      </div>
    </div>
  )
}

