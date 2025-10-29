'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  transaction_id: string
  store_id: string
  phone_number: string
  network: string
  capacity: number
  selling_price: number
  order_status: string
  payment_status: string
  payment_method: string
  created_at: string
  completed_at?: string
  customer_name?: string
  customer_email?: string
  agent_notes?: string
  agent_stores?: {
    store_name: string
    store_slug: string
  }
  agent_products?: {
    display_name: string
  }
}

const ORDER_STATUSES = [
  'pending',
  'waiting',
  'on_hold',
  'processing',
  'completed',
  'delivered',
  'failed',
  'cancelled',
  'refunded'
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  waiting: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-orange-100 text-orange-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  refunded: 'bg-pink-100 text-pink-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [filter])

  async function loadOrders() {
    setLoading(true)
    try {
      let query = supabase
        .from('agent_transactions')
        .select(`
          *,
          agent_stores(store_name, store_slug),
          agent_products(display_name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('order_status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('agent_transactions')
        .update({ 
          order_status: newStatus,
          completed_at: ['completed', 'delivered'].includes(newStatus) ? new Date().toISOString() : null
        })
        .eq('id', orderId)

      if (error) throw error
      await loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  async function updateBulkStatus(newStatus: string) {
    if (selectedOrders.size === 0) {
      alert('Please select at least one order')
      return
    }

    try {
      const { error } = await supabase
        .from('agent_transactions')
        .update({ 
          order_status: newStatus,
          completed_at: ['completed', 'delivered'].includes(newStatus) ? new Date().toISOString() : null
        })
        .in('id', Array.from(selectedOrders))

      if (error) throw error
      
      setSelectedOrders(new Set())
      await loadOrders()
      setBulkAction('')
    } catch (error) {
      console.error('Error updating bulk status:', error)
      alert('Failed to update order statuses')
    }
  }

  async function exportToCSV(allSelected = false) {
    setExporting(true)
    try {
      let ordersToExport = orders

      // If exporting all (not just selected)
      if (!allSelected && selectedOrders.size > 0) {
        ordersToExport = orders.filter(o => selectedOrders.has(o.id))
      } else if (!allSelected) {
        // If no orders selected and not all selected, export filtered results
        ordersToExport = orders
      } else {
        // Get all orders (ignoring current filter for export)
        const { data: allOrders, error } = await supabase
          .from('agent_transactions')
          .select(`
            *,
            agent_stores(store_name, store_slug),
            agent_products(display_name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        ordersToExport = allOrders || []
      }

      // Create CSV content
      const headers = [
        'Transaction ID',
        'Store Name',
        'Phone Number',
        'Network',
        'Capacity',
        'Price (GHS)',
        'Order Status',
        'Payment Status',
        'Payment Method',
        'Created Date',
        'Completed Date',
        'Customer Name',
        'Customer Email',
        'Notes'
      ]

      const rows = ordersToExport.map(order => [
        order.transaction_id,
        (order.agent_stores as any)?.store_name || '',
        order.phone_number,
        order.network,
        `${order.capacity}GB`,
        order.selling_price?.toString() || '0',
        order.order_status,
        order.payment_status,
        order.payment_method,
        new Date(order.created_at).toLocaleString(),
        order.completed_at ? new Date(order.completed_at).toLocaleString() : '',
        order.customer_name || '',
        order.customer_email || '',
        order.agent_notes || ''
      ]) || []

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      const fileName = selectedOrders.size > 0 && !allSelected
        ? `selected_orders_${new Date().toISOString().split('T')[0]}.csv`
        : `all_orders_${new Date().toISOString().split('T')[0]}.csv`
      link.setAttribute('download', fileName)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting orders:', error)
      alert('Failed to export orders')
    } finally {
      setExporting(false)
    }
  }

  function toggleSelectAll() {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filteredOrders.map(o => o.id)))
    }
  }

  function toggleSelectOrder(orderId: string) {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      order.transaction_id.toLowerCase().includes(search) ||
      order.phone_number.toLowerCase().includes(search) ||
      order.network.toLowerCase().includes(search) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(search)) ||
      ((order.agent_stores as any)?.store_name?.toLowerCase().includes(search))
    )
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === 'pending').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    completed: orders.filter(o => ['completed', 'delivered'].includes(o.order_status)).length,
    revenue: orders.filter(o => ['completed', 'delivered'].includes(o.order_status)).reduce((sum, o) => sum + (o.selling_price || 0), 0)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Orders Management
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            View, manage, and export all orders
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => exportToCSV(selectedOrders.size > 0)}
            disabled={exporting}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting...' : selectedOrders.size > 0 ? `📥 Export Selected (${selectedOrders.size})` : '📥 Export All'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {stats.total}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Orders</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            {stats.pending + stats.processing}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">In Progress</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {stats.completed}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Completed</div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            GHS {stats.revenue.toFixed(2)}
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Total Revenue</div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by transaction ID, phone, network..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="glass rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Change Status To...</option>
                  {ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {bulkAction && (
                  <button
                    onClick={() => updateBulkStatus(bulkAction)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 w-12">
                  <input
                    type="checkbox"
                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Transaction ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Store</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Phone</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Product</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Payment</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-4 text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.transaction_id}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {(order.agent_stores as any)?.store_name || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{order.phone_number}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {order.network} {order.capacity}GB
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">GHS {order.selling_price}</td>
                    <td className="py-4 px-6">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        order.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 min-w-[140px]">
                      <OrderStatusDropdown
                        currentStatus={order.order_status}
                        onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function OrderStatusDropdown({ 
  currentStatus, 
  onStatusChange 
}: { 
  currentStatus: string
  onStatusChange: (status: string) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 via-purple-600 to-pink-600 rounded-lg hover:shadow-2xl transition-all hover:scale-110 border-2 border-yellow-400 shadow-2xl whitespace-nowrap"
        title="Update Status - Click to change order status"
      >
        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="font-extrabold">UPDATE</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Change Status</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status)
                    setIsOpen(false)
                  }}
                  disabled={status === currentStatus}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 ${
                    status === currentStatus
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${status === currentStatus ? '' : 'hover:bg-purple-50'}`}
                >
                  {status === currentStatus ? (
                    <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded"></div>
                  )}
                  <div>
                    <div className="font-medium">{status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</div>
                    {status === currentStatus && (
                      <div className="text-xs text-purple-600">Current</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

