import Link from 'next/link'

interface StoreUrlCardProps {
  storeSlug: string
  baseUrl: string
}

export default function StoreUrlCard({ storeSlug, baseUrl }: StoreUrlCardProps) {
  const storeUrl = `${baseUrl}/store/${storeSlug}`

  return (
    <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-6 shadow-lg border border-purple-300">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm flex-shrink-0">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1">Your Public Store</h3>
            <p className="text-purple-100 text-sm mb-2">
              Share your store URL with customers to drive more sales
            </p>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="bg-transparent border-none outline-none text-white font-mono text-sm flex-1 truncate"
              />
              <Link
                href={storeUrl}
                target="_blank"
                className="text-white hover:text-purple-100 transition-colors flex-shrink-0"
                title="Open in new tab"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        <Link
          href="/agent/settings"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-purple-600 hover:bg-purple-50 transition-colors whitespace-nowrap"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Settings
        </Link>
      </div>
    </div>
  )
}

