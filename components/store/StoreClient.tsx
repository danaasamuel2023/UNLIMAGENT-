'use client'

import { useState, useMemo } from 'react'

interface Product {
  id: string
  network: string
  capacity: number
  selling_price: number
  display_name?: string
  in_stock: boolean
}

interface StoreClientProps {
  products: any[]
  networks: string[]
  productsByNetwork: Record<string, any[]>
  primaryNetwork: string
}

export default function StoreClient({ products, networks, productsByNetwork, primaryNetwork }: StoreClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price' | 'network'>('price')

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

  return { searchQuery, setSearchQuery, selectedNetwork, setSelectedNetwork, sortBy, setSortBy, filteredProducts }
}

