import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Get agent's store and wallet
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('id, wallet, store_name')
      .eq('agent_id', user.id)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const wallet = store.wallet || {
      available_balance: 0,
      pending_balance: 0,
      total_earnings: 0,
      total_withdrawn: 0,
    }

    // Validate withdrawal amount
    if (body.requested_amount < 10) {
      return NextResponse.json({ error: 'Minimum withdrawal amount is GHS 10.00' }, { status: 400 })
    }

    if (body.requested_amount > wallet.available_balance) {
      return NextResponse.json({ error: 'Amount exceeds available balance' }, { status: 400 })
    }

    // Generate withdrawal ID
    const withdrawalId = `WDL${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('agent_withdrawals')
      .insert({
        agent_id: user.id,
        store_id: store.id,
        withdrawal_id: withdrawalId,
        net_amount: body.requested_amount, // Set net amount same as requested (no fees for now)
        requested_amount: body.requested_amount,
        method: body.method === 'mobile_money' ? 'momo' : body.method === 'bank_transfer' ? 'bank' : 'cash',
        account_details: body.account_details,
        status: 'pending',
      })
      .select()
      .single()

    if (withdrawalError) throw withdrawalError

    // Update wallet: move from available to pending
    const newAvailableBalance = wallet.available_balance - body.requested_amount
    const newPendingBalance = wallet.pending_balance + body.requested_amount

    await supabase
      .from('agent_stores')
      .update({
        wallet: {
          ...wallet,
          available_balance: newAvailableBalance,
          pending_balance: newPendingBalance,
        },
      })
      .eq('agent_id', user.id)

    // Create admin notification manually (trigger exists but we want to ensure it happens)
    const notificationTitle = `New Withdrawal Request`
    const notificationMessage = `Agent "${store.store_name}" requested withdrawal of ${body.requested_amount} GHS (${withdrawalId})`
    
    await supabase
      .from('admin_notifications')
      .insert({
        type: 'withdrawal_request',
        related_entity_type: 'withdrawal',
        related_entity_id: withdrawal.id,
        title: notificationTitle,
        message: notificationMessage,
        priority: body.requested_amount > 1000 ? 'high' : 'normal',
        action_data: {
          withdrawal_id: withdrawalId,
          agent_id: user.id,
          agent_store_name: store.store_name,
          amount: body.requested_amount,
          method: body.method,
          status: 'pending',
          view_url: `/admin/withdrawals?view=${withdrawal.id}`
        },
        metadata: {
          agent_id: user.id,
          withdrawal_id: withdrawalId,
          timestamp: new Date().toISOString(),
          auto_read: false
        }
      })

    return NextResponse.json({ 
      data: withdrawal,
      message: 'Withdrawal request submitted successfully. Admin will be notified for approval.'
    })
  } catch (error: any) {
    console.error('Withdrawal creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

