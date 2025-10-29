'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface FundAgentWalletParams {
  agentId: string
  amount: number
  description: string
}

export async function fundAgentWallet({ agentId, amount, description }: FundAgentWalletParams) {
  try {
    const supabase = createAdminClient()

    // Get the agent's store to update the wallet
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('*')
      .eq('agent_id', agentId)
      .single()

    if (storeError || !store) {
      return { success: false, error: 'Agent store not found' }
    }

    // Get current wallet balance
    const currentWallet = store.wallet || {
      available_balance: 0,
      pending_balance: 0,
      total_earnings: 0,
      total_withdrawn: 0,
    }

    // Update wallet
    const updatedWallet = {
      available_balance: currentWallet.available_balance + amount,
      pending_balance: currentWallet.pending_balance,
      total_earnings: currentWallet.total_earnings + amount,
      total_withdrawn: currentWallet.total_withdrawn,
    }

    // Update the store's wallet
    const { error: updateError } = await supabase
      .from('agent_stores')
      .update({ wallet: updatedWallet })
      .eq('id', store.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: 'Failed to update wallet' }
    }

    // Record the funding transaction
    const { error: transactionError } = await supabase
      .from('agent_transactions')
      .insert({
        agent_id: agentId,
        transaction_id: `ADMIN-${Date.now()}`,
        amount: amount,
        network: 'Admin',
        capacity: 0,
        selling_price: 0,
        order_status: 'completed',
        payment_status: 'completed',
        description: description,
        admin_funded: true,
      })

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      // Don't fail the whole operation if transaction recording fails
    }

    revalidatePath('/admin/agents')
    return { success: true }
  } catch (error) {
    console.error('Funding error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deductAgentWallet({ agentId, amount, description }: FundAgentWalletParams) {
  try {
    const supabase = createAdminClient()

    // Get the agent's store to update the wallet
    const { data: store, error: storeError } = await supabase
      .from('agent_stores')
      .select('*')
      .eq('agent_id', agentId)
      .single()

    if (storeError || !store) {
      return { success: false, error: 'Agent store not found' }
    }

    // Get current wallet balance
    const currentWallet = store.wallet || {
      available_balance: 0,
      pending_balance: 0,
      total_earnings: 0,
      total_withdrawn: 0,
    }

    // Check if agent has sufficient balance
    if (currentWallet.available_balance < amount) {
      return { success: false, error: 'Insufficient balance. Available: GHS ' + currentWallet.available_balance.toFixed(2) }
    }

    // Update wallet
    const updatedWallet = {
      available_balance: currentWallet.available_balance - amount,
      pending_balance: currentWallet.pending_balance,
      total_earnings: currentWallet.total_earnings,
      total_withdrawn: currentWallet.total_withdrawn + amount,
    }

    // Update the store's wallet
    const { error: updateError } = await supabase
      .from('agent_stores')
      .update({ wallet: updatedWallet })
      .eq('id', store.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return { success: false, error: 'Failed to update wallet' }
    }

    // Record the deduction transaction
    const { error: transactionError } = await supabase
      .from('agent_transactions')
      .insert({
        agent_id: agentId,
        transaction_id: `ADMIN-DEDUCT-${Date.now()}`,
        amount: amount,
        network: 'Admin',
        capacity: 0,
        selling_price: 0,
        order_status: 'completed',
        payment_status: 'completed',
        description: description,
        admin_deducted: true,
      })

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      // Don't fail the whole operation if transaction recording fails
    }

    revalidatePath('/admin/agents')
    return { success: true }
  } catch (error) {
    console.error('Deduction error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

