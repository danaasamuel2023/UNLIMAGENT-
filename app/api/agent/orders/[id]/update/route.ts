import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Get order and verify it belongs to the agent
    const { data: order, error: orderError } = await supabase
      .from('agent_transactions')
      .select('*')
      .eq('id', id)
      .eq('agent_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order
    const { data, error } = await supabase
      .from('agent_transactions')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If order is completed and payment is completed, update wallet
    if (body.order_status === 'completed' && order.payment_status === 'completed') {
      // Get agent's store
      const { data: store } = await supabase
        .from('agent_stores')
        .select('wallet')
        .eq('agent_id', user.id)
        .single()

      if (store && store.wallet) {
        const currentBalance = store.wallet.available_balance || 0
        const totalEarnings = store.wallet.total_earnings || 0

        await supabase
          .from('agent_stores')
          .update({
            wallet: {
              ...store.wallet,
              available_balance: currentBalance + order.profit,
              total_earnings: totalEarnings + order.selling_price,
            },
          })
          .eq('agent_id', user.id)
      }
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

