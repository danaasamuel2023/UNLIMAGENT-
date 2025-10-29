import { NextResponse } from 'next/server'
import { purchaseDataBundle } from '@/lib/services/dataMartApi'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Purchase data bundle through external Data Mart API
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transaction_id, phone_number, capacity, product_name } = body

    // Validate required fields
    if (!transaction_id || !phone_number || !capacity || !product_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate reference for external API
    const reference = `REF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Call Data Mart API
    const result = await purchaseDataBundle({
      capacity,
      product_name,
      beneficiary_number: phone_number,
      reference,
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to purchase from Data Mart' },
        { status: 500 }
      )
    }

    // Update the transaction in our database
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from('agent_transactions')
      .update({
        api_reference: result.data.reference,
        api_transaction_id: result.data.transaction_id,
        external_status: result.data.status,
        order_status: 'processing',
        balance_after_purchase: result.data.balance_after,
      })
      .eq('transaction_id', transaction_id)

    if (updateError) {
      console.error('Failed to update transaction:', updateError)
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Purchase processed successfully',
    })
  } catch (error: any) {
    console.error('External purchase error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

