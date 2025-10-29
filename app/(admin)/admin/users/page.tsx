import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  const { data: { users } } = await supabase.auth.admin.listUsers()

  const stats = [
    { label: 'Total Users', value: users?.length || 0, color: 'blue' },
    { label: 'Admins', value: users?.filter(u => u.user_metadata?.role === 'admin').length || 0, color: 'purple' },
    { label: 'Agents', value: users?.filter(u => u.user_metadata?.role === 'agent').length || 0, color: 'green' },
    { label: 'Customers', value: users?.filter(u => u.user_metadata?.role === 'customer' || !u.user_metadata?.role).length || 0, color: 'gray' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Users
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage all platform users and their permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-6">
            <div className={`text-3xl font-bold bg-gradient-to-r ${
              stat.color === 'blue' ? 'from-blue-600 to-cyan-600' :
              stat.color === 'purple' ? 'from-purple-600 to-pink-600' :
              stat.color === 'green' ? 'from-green-600 to-emerald-600' :
              'from-gray-600 to-gray-400'
            } bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Users List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Users</h2>
          
          {users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="glass rounded-xl p-6 card-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{user.email?.charAt(0).toUpperCase() || 'U'}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{user.user_metadata?.name || user.email}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        user.user_metadata?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.user_metadata?.role === 'agent' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.user_metadata?.role || 'customer'}
                      </span>
                      {user.email_confirmed_at && (
                        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="mt-4 text-sm">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

