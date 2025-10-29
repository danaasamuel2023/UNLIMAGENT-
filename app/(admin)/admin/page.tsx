import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Suspense } from 'react'

// Types
interface Stat {
  name: string
  value: number
  icon: string
  color: string
  bgColor: string
  link: string
  description?: string
}

interface DashboardStats {
  totalStores: number
  activeStores: number
  totalOrders: number
  pendingWithdrawals: number
  totalTransactions: number
  totalUsers: number
  recentOrders: number
  totalRevenue: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'withdrawal' | 'store' | 'user'
  description: string
  time: string
  status?: string
}

// Loading Skeleton
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="h-12 w-12 rounded-xl bg-gray-200" />
          <div className="mt-4 h-8 w-24 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-32 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

// Stats Card Component
function StatCard({ stat }: { stat: Stat }) {
  return (
    <Link
      href={stat.link}
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-xl hover:ring-purple-500/20 hover:-translate-y-1"
    >
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} 
        aria-hidden="true"
      />
      
      <div className="relative">
        {/* Icon container */}
        <div 
          className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${stat.bgColor} ring-4 ring-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          aria-hidden="true"
        >
          <span className="text-3xl">{stat.icon}</span>
        </div>
        
        {/* Stats */}
        <div className="mt-5">
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {stat.value.toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-600">
            {stat.name}
          </p>
          {stat.description && (
            <p className="mt-1 text-xs text-gray-500">
              {stat.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Arrow indicator */}
      <div className="absolute right-4 top-6 text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-600">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

// System Status Component
async function SystemStatus() {
  try {
    const supabase = createAdminClient()
    
    // Check database connectivity
    const { error: dbError } = await supabase
      .from('agent_stores')
      .select('id')
      .limit(1)
    
    const dbStatus = !dbError ? 'online' : 'error'
    
    // Check recent transactions (as proxy for payment system)
    const { data: recentTransactions, error: txError } = await supabase
      .from('agent_transactions')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
    
    const paymentStatus = !txError && recentTransactions?.length ? 'connected' : 'warning'
    
    const statuses = [
      { 
        name: 'Database', 
        status: dbStatus,
        color: dbStatus === 'online' ? 'green' : 'red'
      },
      { 
        name: 'Storage', 
        status: 'healthy',
        color: 'green'
      },
      { 
        name: 'Payments', 
        status: paymentStatus,
        color: paymentStatus === 'connected' ? 'green' : 'yellow'
      },
    ]

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          <span className="text-xs text-gray-500">Live</span>
        </div>
        <div className="space-y-4">
          {statuses.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{item.name}</span>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset
                ${item.color === 'green' ? 'bg-green-50 text-green-700 ring-green-600/20' : ''}
                ${item.color === 'yellow' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : ''}
                ${item.color === 'red' ? 'bg-red-50 text-red-700 ring-red-600/20' : ''}
              `}>
                <span className={`h-1.5 w-1.5 rounded-full ${item.color === 'green' ? 'bg-green-500 animate-pulse' : ''} ${item.color === 'yellow' ? 'bg-yellow-500' : ''} ${item.color === 'red' ? 'bg-red-500' : ''}`} aria-hidden="true" />
                <span className="capitalize">{item.status}</span>
              </span>
            </div>
          ))}
        </div>
        
        {/* Last checked */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last checked: {new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error checking system status:', error)
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Status</h3>
        <div className="text-center py-4">
          <p className="text-sm text-red-600">Unable to check system status</p>
        </div>
      </div>
    )
  }
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    {
      name: 'Review Withdrawals',
      href: '/admin/withdrawals',
      icon: '💰',
      description: 'Pending approvals',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      hoverColor: 'hover:bg-amber-100',
      borderColor: 'border-amber-200',
    },
    {
      name: 'Manage Stores',
      href: '/admin/stores',
      icon: '🏪',
      description: 'View all stores',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      hoverColor: 'hover:bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      name: 'View Orders',
      href: '/admin/orders',
      icon: '📦',
      description: 'Recent orders',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      hoverColor: 'hover:bg-indigo-100',
      borderColor: 'border-indigo-200',
    },
    {
      name: 'Manage Users',
      href: '/admin/users',
      icon: '👥',
      description: 'User accounts',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      hoverColor: 'hover:bg-purple-100',
      borderColor: 'border-purple-200',
    },
  ]

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`group relative flex flex-col gap-2 rounded-xl ${action.bgColor} p-4 transition-all ${action.hoverColor} border ${action.borderColor} hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{action.icon}</span>
              <svg 
                className={`h-4 w-4 ${action.textColor} opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-semibold ${action.textColor}`}>
                {action.name}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Recent Activity Component
async function RecentActivity() {
  try {
    const supabase = createAdminClient()
    
    // Fetch recent orders
    const { data: recentOrders } = await supabase
      .from('agent_transactions')
      .select('id, selling_price, order_status, payment_status, created_at, agent_id, customer_id')
      .order('created_at', { ascending: false })
      .limit(5)
    
    // Fetch recent withdrawals
    const { data: recentWithdrawals } = await supabase
      .from('agent_withdrawals')
      .select('id, requested_amount, status, created_at, agent_id')
      .order('created_at', { ascending: false })
      .limit(5)

    const activities: RecentActivity[] = []

    // Add orders to activities
    recentOrders?.forEach(order => {
      if (!order || !order.created_at) return
      activities.push({
        id: order.id,
        type: 'order',
        description: `New order - GH₵${Number(order.selling_price || 0).toFixed(2)}`,
        time: new Date(order.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: order.order_status || 'pending'
      })
    })

    // Add withdrawals to activities
    recentWithdrawals?.forEach(withdrawal => {
      if (!withdrawal || !withdrawal.created_at) return
      activities.push({
        id: withdrawal.id,
        type: 'withdrawal',
        description: `Withdrawal request - GH₵${Number(withdrawal.requested_amount || 0).toFixed(2)}`,
        time: new Date(withdrawal.created_at).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: withdrawal.status || 'pending'
      })
    })

    // Sort by time
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const latestActivities = activities.slice(0, 8)

    if (latestActivities.length === 0) {
      return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          
          <div className="py-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="mt-4 text-sm text-gray-500">No recent activity</p>
            <p className="mt-1 text-xs text-gray-400">Activity will appear here as it happens</p>
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Link 
            href="/admin/transactions" 
            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            View all →
          </Link>
        </div>
        
        <div className="space-y-3">
          {latestActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xl
                  ${activity.type === 'order' ? 'bg-blue-100' : ''}
                  ${activity.type === 'withdrawal' ? 'bg-amber-100' : ''}
                  ${activity.type === 'store' ? 'bg-purple-100' : ''}
                  ${activity.type === 'user' ? 'bg-green-100' : ''}
                `}>
                  {activity.type === 'order' && '📦'}
                  {activity.type === 'withdrawal' && '💰'}
                  {activity.type === 'store' && '🏪'}
                  {activity.type === 'user' && '👤'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              
              {activity.status && (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${
                    activity.status === 'completed' || activity.status === 'success' || activity.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : activity.status === 'pending' || activity.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : activity.status === 'failed' || activity.status === 'rejected' || activity.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }
                `}>
                  {activity.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <p className="text-sm text-red-600">Unable to load recent activity</p>
        </div>
      </div>
    )
  }
}

// Fetch dashboard stats
async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = createAdminClient()

    const [
      storesResult,
      activeStoresResult,
      withdrawalsResult,
      transactionsResult,
      usersResult,
      ordersResult,
      recentOrdersResult,
      revenueResult
    ] = await Promise.all([
      supabase
        .from('agent_stores')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('agent_stores')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('agent_withdrawals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('agent_transactions')
        .select('id', { count: 'exact', head: true }),
      supabase.auth.admin.listUsers(),
      supabase
        .from('agent_transactions')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('agent_transactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('agent_transactions')
        .select('selling_price')
        .eq('order_status', 'completed')
    ])

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce((sum, tx) => sum + (Number(tx.selling_price) || 0), 0) || 0

    return {
      totalStores: storesResult.count ?? 0,
      activeStores: activeStoresResult.count ?? 0,
      totalOrders: ordersResult.count ?? 0,
      pendingWithdrawals: withdrawalsResult.count ?? 0,
      totalTransactions: transactionsResult.count ?? 0,
      totalUsers: usersResult.data?.users.length ?? 0,
      recentOrders: recentOrdersResult.count ?? 0,
      totalRevenue,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalStores: 0,
      activeStores: 0,
      totalOrders: 0,
      pendingWithdrawals: 0,
      totalTransactions: 0,
      totalUsers: 0,
      recentOrders: 0,
      totalRevenue: 0,
    }
  }
}

// Main Dashboard Component
export default async function AdminDashboardPage() {
  const dashboardStats = await getDashboardStats()

  const stats: Stat[] = [
    {
      name: 'Total Stores',
      value: dashboardStats.totalStores,
      icon: '🏪',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      link: '/admin/stores',
      description: `${dashboardStats.activeStores} active`,
    },
    {
      name: 'Total Orders',
      value: dashboardStats.totalOrders,
      icon: '📦',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      link: '/admin/orders',
      description: `${dashboardStats.recentOrders} this week`,
    },
    {
      name: 'Pending Withdrawals',
      value: dashboardStats.pendingWithdrawals,
      icon: '💰',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      link: '/admin/withdrawals',
      description: dashboardStats.pendingWithdrawals > 0 ? 'Needs attention' : 'All clear',
    },
    {
      name: 'Total Revenue',
      value: Math.round(dashboardStats.totalRevenue),
      icon: '💵',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      link: '/admin/transactions',
      description: 'Completed orders',
    },
    {
      name: 'Total Users',
      value: dashboardStats.totalUsers,
      icon: '👥',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      link: '/admin/users',
      description: 'Registered accounts',
    },
  ]

  return (
    <>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-gray-600">
              Welcome back! Here's what's happening with your platform today.
            </p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">Platform Statistics</h2>
        <Suspense fallback={<StatsSkeleton />}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.name} stat={stat} />
            ))}
          </div>
        </Suspense>
      </section>

      {/* Recent Activity - Full Width */}
      <section aria-labelledby="activity-heading" className="mb-8">
        <h2 id="activity-heading" className="sr-only">Recent Activity</h2>
        <Suspense fallback={
          <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 h-64" />
        }>
          <RecentActivity />
        </Suspense>
      </section>

      {/* Quick Actions and System Status */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuickActions />
        <Suspense fallback={
          <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 h-64" />
        }>
          <SystemStatus />
        </Suspense>
      </section>
    </>
  )
}