import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Modern Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Agent Store
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/stores"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Browse Stores
              </Link>
              <Link
                href="/track"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                Track Order
              </Link>
              {user ? (
                <>
                  <Link
                    href="/wallet"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Wallet
                  </Link>
                  <Link
                    href="/payment/deposit"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Add Funds
                  </Link>
                  <span className="text-sm text-gray-600 font-medium">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="btn-primary"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Gradient Background */}
      <main className="mt-20 gradient-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 backdrop-blur-sm border border-white/20 mb-8 animate-float">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Launch your data store today</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="text-gray-900">Your Gateway to</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Data Bundles
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-3xl text-xl text-gray-600 leading-relaxed">
              A comprehensive platform for agents to sell data bundles. Manage your store,
              track earnings, and grow your business with ease.
            </p>
            <div className="mt-12 flex items-center justify-center gap-x-4">
              <Link
                href="/signup"
                className="btn-primary text-lg px-8 py-4"
              >
                Start Selling
                <span className="ml-2">→</span>
              </Link>
              <Link
                href="/stores"
                className="btn-secondary text-lg px-8 py-4"
              >
                Browse Stores
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  100+
                </div>
                <div className="mt-2 text-sm text-gray-600">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="mt-2 text-sm text-gray-600">Orders Processed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  99.9%
                </div>
                <div className="mt-2 text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Everything you need</h2>
            <p className="mt-4 text-lg text-gray-600">Powerful features to grow your business</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group relative glass rounded-2xl p-8 card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Management</h3>
                <p className="text-gray-600 leading-relaxed">
                  Manage your store, products, and customers all from one intuitive dashboard.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative glass rounded-2xl p-8 card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Track Earnings</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your revenue, profits, and commission in real-time with detailed analytics.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative glass rounded-2xl p-8 card-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Withdrawals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Request withdrawals anytime with multiple payment methods and bank-level security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-12 text-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to grow your business?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of agents selling data bundles and start earning today.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-2xl bg-white px-8 py-4 text-lg font-bold text-gray-900 shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Get Started Free
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
