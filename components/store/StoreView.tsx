'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import BuyNowButton from './BuyNowButton'
import PurchaseSuccessBanner from './PurchaseSuccessBanner'

interface StoreViewProps {
  store: any
  products: any[]
  networks: string[]
  productsByNetwork: Record<string, any[]>
  primaryNetwork: string
}

export default function StoreView({ store, products, networks, productsByNetwork, primaryNetwork }: StoreViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'network'>('price')
  const [selectedNetworkCard, setSelectedNetworkCard] = useState<string>(primaryNetwork)

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.network.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.capacity.toString().includes(searchQuery)
      )
    }

    // Filter by network
    if (selectedNetwork !== 'all') {
      filtered = filtered.filter(product => product.network === selectedNetwork)
    }

    // Sort
    if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => parseFloat(a.selling_price) - parseFloat(b.selling_price))
    } else {
      filtered = [...filtered].sort((a, b) => a.network.localeCompare(b.network))
    }

    return filtered
  }, [products, searchQuery, selectedNetwork, sortBy])

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <PurchaseSuccessBanner />
      
      {/* Modern Top Navigation with Glassmorphism */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/80 shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Store Name */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {store.store_name}
                </h1>
                <p className="text-sm text-gray-400">Premium Data Bundles</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={scrollToProducts} className="px-6 py-2.5 rounded-xl bg-blue-600/10 text-blue-400 font-semibold hover:bg-blue-600/20 transition-all">
                Products
              </button>
              <Link href="/track" className="px-6 py-2.5 rounded-xl text-gray-400 font-semibold hover:bg-gray-800 hover:text-white transition-all">
                Track Order
              </Link>
              <Link href="/stores" className="px-6 py-2.5 rounded-xl text-gray-400 font-semibold hover:bg-gray-800 hover:text-white transition-all">
                All Stores
              </Link>
            </div>

            {/* Right Side - Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-green-400 text-sm font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Gradient */}
      <div className="relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified Store</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Affordable Data
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Bundles
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Get instant data delivery in 10-60 minutes. Best prices, all networks, 100% guaranteed.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button onClick={scrollToProducts} className="group px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
                  Shop Now
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-300">Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Feature Cards with Animations */}
            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Fast Delivery', desc: '10-60 minutes', color: 'from-yellow-500 to-orange-500' },
                { icon: '💰', title: 'Best Prices', desc: 'Save up to 40%', color: 'from-green-500 to-emerald-500' },
                { icon: '🔒', title: '100% Secure', desc: 'Safe payments', color: 'from-purple-500 to-pink-500' }
              ].map((feature, idx) => (
                <div key={idx} className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-white">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network Selection Section */}
      <div className="py-16 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-white mb-4">Choose Your Network</h2>
          <p className="text-center text-gray-400 mb-12">Select your network and explore our bundles</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {networks.map((network) => {
              const networkProducts = productsByNetwork[network] || []
              const productCount = networkProducts.length
              const isSelected = selectedNetworkCard === network

              return (
                <button
                  key={network}
                  onClick={() => {
                    setSelectedNetworkCard(network)
                    setSelectedNetwork(network)
                    scrollToProducts()
                  }}
                  className={`group relative rounded-2xl p-8 border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-300 shadow-2xl scale-105' 
                      : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`rounded-2xl p-4 ${isSelected ? 'bg-white shadow-lg' : 'bg-white/10'}`}>
                      <span className={`text-3xl font-bold ${isSelected ? 'text-yellow-500' : 'text-white'}`}>
                        {network.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className={`text-2xl font-bold ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                        {network}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                        {productCount} {productCount === 1 ? 'bundle' : 'bundles'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-4xl font-bold mb-3 ${isSelected ? 'text-gray-900' : 'text-white'}`}>
                    {network}
                  </div>
                  
                  <div className={`flex items-center gap-2 font-bold ${isSelected ? 'text-gray-900' : 'text-blue-400'}`}>
                    <span>View Bundles</span>
                    <svg className={`h-5 w-5 ${isSelected ? 'ml-2 group-hover:translate-x-1' : ''} transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Products Section */}
      {products && products.length > 0 && (
        <div id="products" className="py-16 bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold text-white mb-4">Premium Data Bundles</h2>
              <p className="text-xl text-gray-400">Choose from our wide range of affordable data packages</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between mb-6">
                {/* Search Bar */}
                <div className="flex-1 max-w-xl w-full">
                  <div className="relative">
                    <svg className="absolute left-4 top-4 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search bundles by network or size..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white placeholder-gray-400 px-4 py-4 pl-12 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="mt-3 text-sm text-gray-400">{filteredProducts.length} products found</p>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value)}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Networks</option>
                    {networks.map(net => (
                      <option key={net} value={net}>{net}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'price' | 'network')}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 text-white px-6 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="price">Price: Low to High</option>
                    <option value="network">By Network</option>
                  </select>
                </div>
              </div>

              {/* Feature Indicators */}
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                  Fast Delivery (10min - 1hr)
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  Secure Payment
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                  24/7 Support
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 mb-12 shadow-xl">
              <div className="flex gap-4">
                <svg className="h-7 w-7 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Important Notice</h3>
                  <ul className="text-white/90 text-sm space-y-1">
                    <li>✓ Please verify your phone number carefully before making a purchase</li>
                    <li>✓ Data bundles are delivered within 10-60 minutes after successful payment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className="group bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Top Yellow Section */}
                  <div className="p-6">
                    {/* Logo and Network */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.network.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-900 font-bold text-sm">{product.network}</span>
                    </div>
                    
                    {/* Data Amount */}
                    <div className="mb-2">
                      <h3 className="text-4xl font-bold text-gray-900">
                        {product.capacity} GB
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-800 font-medium">
                      {product.display_name || `${product.network.toLowerCase()} data`}
                    </p>
                  </div>
                  
                  {/* Bottom Dark Section */}
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-6 py-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-white font-bold text-xl">
                          {formatCurrency(product.selling_price)}
                        </div>
                        <div className="text-gray-400 text-xs mt-1">Price</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold text-sm">Non-Expiry</div>
                        <div className="text-gray-400 text-xs mt-1">Validity</div>
                      </div>
                    </div>
                    
                    {/* Buy Button */}
                    <BuyNowButton product={{
                      id: product.id,
                      network: product.network,
                      capacity: product.capacity,
                      selling_price: product.selling_price,
                      display_name: product.display_name,
                      in_stock: product.in_stock
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-xl font-bold text-white">No products found</h3>
                <p className="mt-2 text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              Join thousands of customers enjoying affordable data bundles with instant delivery
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={scrollToProducts} className="px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
                Shop Now →
              </button>
              <Link href="/stores" className="px-10 py-5 rounded-2xl bg-gray-800 border-2 border-gray-700 text-white font-bold text-lg hover:bg-gray-700 transition-all">
                Browse All Stores
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

