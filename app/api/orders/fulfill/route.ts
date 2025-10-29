import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { purchaseDataBundle } from '@/lib/services/dataMartApi'

/**
 * Automatically fulfill paid orders from wallet
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transaction_id } = body

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('agent_transactions')
      .select('*, agent_products!inner(*)')
      .eq('id', transaction_id)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if already fulfilled
    if (transaction.api_transaction_id) {
      return NextResponse.json({
        success: true,
        message: 'Order already fulfilled',
        data: transaction,
      })
    }

    // Check if payment is completed
    if (transaction.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Fulfill the order via Data Mart API
    const reference = `REF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const result = await purchaseDataBundle({
      capacity: transaction.product.capacity,
      product_name: transaction.product.display_name || `${transaction.product.network} ${transaction.product.capacity}GB`,
      beneficiary_number: transaction.phone_number,
      reference,
    })

    if (!result || !result.success) {
      // Update transaction as failed
      await supabase
        .from('agent_transactions')
        .update({
          order_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction_id)

      return NextResponse.json(
        { success: false, error: 'Failed to fulfill order from Data Mart' },
        { status: 500 }
      )
    }

    // Update transaction with fulfillment details
    const { error: updateError } = await supabase
      .from('agent_transactions')
      .update({
        api_reference: result.data.reference,
        api_transaction_id: result.data.transaction_id,
        external_status: result.data.status,
        order_status: 'completed',
        balance_after_purchase: result.data.balance_after,
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction_id)

    if (updateError) {
      console.error('Failed to update transaction:', updateError)
    }

    // Update agent store metrics
    await supabase
      .from('agent_stores')
      .update({
        metrics: supabase.rpc('jsonb_increment', {
          field: 'total_orders',
          amount: 1,
        }),
      })
      .eq('id', transaction.store_id)

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Order fulfilled successfully',
    })
  } catch (error: any) {
    console.error('Fulfill order error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

