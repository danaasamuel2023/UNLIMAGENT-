import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Get withdrawal
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('agent_withdrawals')
      .select('*, agent_stores!inner(wallet, agent_id)')
      .eq('id', id)
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    const oldStatus = withdrawal.status

    // Prepare update data
    const updateData: any = {
      status: body.status,
    }

    // Set processed_at and processed_by based on status
    if (body.status === 'processing' || body.status === 'completed') {
      updateData.processed_by = user.id
      if (body.status === 'completed') {
        updateData.processed_at = new Date().toISOString()
      }
    }

    // Add payment reference if provided
    if (body.payment_reference) {
      updateData.payment_reference = body.payment_reference
    }

    // Update withdrawal status
    const { data: updatedWithdrawal, error: updateError } = await supabase
      .from('agent_withdrawals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Handle wallet updates based on status change
    if (oldStatus !== body.status) {
      const wallet = withdrawal.agent_stores.wallet || {
        available_balance: 0,
        pending_balance: 0,
        total_earnings: 0,
        total_withdrawn: 0,
      }

      let newWallet = { ...wallet }

      // If completing withdrawal
      if (body.status === 'completed') {
        newWallet = {
          ...wallet,
          pending_balance: (wallet.pending_balance || 0) - withdrawal.requested_amount,
          total_withdrawn: (wallet.total_withdrawn || 0) + withdrawal.requested_amount,
        }
      }

      // If rejecting, move back to available
      if (body.status === 'rejected' && oldStatus === 'pending') {
        newWallet = {
          ...wallet,
          pending_balance: (wallet.pending_balance || 0) - withdrawal.requested_amount,
          available_balance: (wallet.available_balance || 0) + withdrawal.requested_amount,
        }
      }

      // Update store wallet
      await supabase
        .from('agent_stores')
        .update({ wallet: newWallet })
        .eq('agent_id', withdrawal.agent_id)
    }

    return NextResponse.json({ data: updatedWithdrawal })
  } catch (error: any) {
    console.error('Withdrawal update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

