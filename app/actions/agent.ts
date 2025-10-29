'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface UpdateOrderStatusParams {
  transactionId: string
  status: 'pending' | 'processing' | 'delivered' | 'failed' | 'completed'
  notes?: string
}

export async function updateOrderStatus({ transactionId, status, notes }: UpdateOrderStatusParams) {
  try {
    const supabase = createAdminClient()

    // Update the order status
    const { error } = await supabase
      .from('agent_transactions')
      .update({
        delivery_status: status,
        delivery_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId)

    if (error) {
      console.error('Update error:', error)
      return { success: false, error: 'Failed to update order status' }
    }

    revalidatePath('/agent/orders')
    return { success: true }
  } catch (error) {
    console.error('Status update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

