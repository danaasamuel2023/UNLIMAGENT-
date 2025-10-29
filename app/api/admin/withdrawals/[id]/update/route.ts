import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin
    const { data: userData } = await createAdminClient().auth.admin.getUserById(user.id)
    if (userData.user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('agent_withdrawals')
      .select('*')
      .eq('id', id)
      .single()

    if (withdrawalError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { 
      status: body.status,
    }

    // Set processed_by and processed_at based on status
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
    const { data, error } = await supabase
      .from('agent_withdrawals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating withdrawal:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If completed, update agent's wallet
    if (body.status === 'completed') {
      const { data: store } = await supabase
        .from('agent_stores')
        .select('wallet')
        .eq('agent_id', withdrawal.agent_id)
        .single()

      if (store && store.wallet) {
        const currentPending = store.wallet.pending_balance || 0
        const currentWithdrawn = store.wallet.total_withdrawn || 0

        await supabase
          .from('agent_stores')
          .update({
            wallet: {
              ...store.wallet,
              pending_balance: Math.max(0, currentPending - withdrawal.requested_amount),
              total_withdrawn: currentWithdrawn + withdrawal.requested_amount,
            },
          })
          .eq('agent_id', withdrawal.agent_id)
      }
    }

    // If rejected, refund to available balance
    if (body.status === 'rejected') {
      const { data: store } = await supabase
        .from('agent_stores')
        .select('wallet')
        .eq('agent_id', withdrawal.agent_id)
        .single()

      if (store && store.wallet) {
        const currentPending = store.wallet.pending_balance || 0
        const currentAvailable = store.wallet.available_balance || 0

        await supabase
          .from('agent_stores')
          .update({
            wallet: {
              ...store.wallet,
              pending_balance: Math.max(0, currentPending - withdrawal.requested_amount),
              available_balance: currentAvailable + withdrawal.requested_amount,
            },
          })
          .eq('agent_id', withdrawal.agent_id)
      }
    }

    return NextResponse.json({ 
      data,
      message: `Withdrawal ${body.status} successfully`
    })
  } catch (error: any) {
    console.error('Withdrawal update error:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: error.message || 'Failed to update withdrawal',
      details: error
    }, { status: 500 })
  }
}

