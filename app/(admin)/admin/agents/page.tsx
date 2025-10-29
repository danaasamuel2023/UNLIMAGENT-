import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-auth'
import FundAgentButton from '@/components/admin/FundAgentButton'

export const dynamic = 'force-dynamic'

export default async function AdminAgentsPage() {
  await requireRole('admin')
  const supabase = createAdminClient()

  // Get all agents with their stores and wallets
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const agents = users?.filter(u => u.user_metadata?.role === 'agent') || []

  // Get wallet information for each agent
  const agentsWithWallets = await Promise.all(
    agents.map(async (agent) => {
      const { data: store } = await supabase
        .from('agent_stores')
        .select('*, wallet')
        .eq('agent_id', agent.id)
        .single()

      return {
        ...agent,
        store,
        wallet: store?.wallet || {
          available_balance: 0,
          pending_balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
        },
      }
    })
  )

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Manage Agents
        </h1>
        <p className="mt-2 text-lg text-gray-600">View and fund agent accounts</p>
      </div>

      {/* Agents List */}
      <div className="space-y-6">
        {agentsWithWallets.length > 0 ? (
          agentsWithWallets.map((agent) => (
            <div
              key={agent.id}
              className="rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-xl border border-gray-100"
            >
              {/* Agent Header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-2xl">
                    {agent.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {agent.user_metadata?.name || agent.email}
                    </h3>
                    <p className="text-sm text-gray-600">{agent.email}</p>
                    {agent.store && (
                      <p className="text-sm font-medium text-purple-600">{agent.store.store_name}</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                    Agent
                  </span>
                </div>
              </div>

              {/* Wallet Information */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white">
                  <div className="text-sm font-medium text-green-100">Available Balance</div>
                  <div className="mt-2 text-2xl font-bold">
                    GHS {agent.wallet.available_balance.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 p-4 text-white">
                  <div className="text-sm font-medium text-yellow-100">Pending Balance</div>
                  <div className="mt-2 text-2xl font-bold">
                    GHS {agent.wallet.pending_balance.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
                  <div className="text-sm font-medium text-blue-100">Total Earnings</div>
                  <div className="mt-2 text-2xl font-bold">
                    GHS {agent.wallet.total_earnings.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 text-white">
                  <div className="text-sm font-medium text-purple-100">Total Withdrawn</div>
                  <div className="mt-2 text-2xl font-bold">
                    GHS {agent.wallet.total_withdrawn.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Fund Agent Button */}
              <div className="border-t border-gray-200 pt-6">
                <FundAgentButton agentId={agent.id} agentEmail={agent.email || 'Unknown'} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-xl p-12 shadow-xl border border-gray-100 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-6">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">No agents found</p>
            <p className="mt-2 text-sm text-gray-500">Agents will appear here when they sign up</p>
          </div>
        )}
      </div>
    </>
  )
}

