import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'Reference required' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const paystackData = await verifyResponse.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { success: false, error: paystackData.message || 'Verification failed' },
        { status: 400 }
      )
    }

    const { status, amount, reference: ref } = paystackData.data

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('customer_transactions')
      .select('*')
      .eq('reference', reference)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if already processed
    if (transaction.status === 'completed') {
      return NextResponse.json({
        success: true,
        data: {
          transaction,
          alreadyProcessed: true,
        },
      })
    }

    // Check if payment was successful
    if (status === 'success') {
      // Update transaction to completed
      const { error: updateError } = await supabase
        .from('customer_transactions')
        .update({
          status: 'completed',
          payment_reference: ref,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)

      if (updateError) throw updateError

      // Update wallet balance (trigger will handle this)
      // Also update total_deposits
      const { error: walletUpdateError } = await supabase
        .from('customer_wallets')
        .update({
          total_deposits: supabase.rpc('increment', {
            amount: transaction.amount,
          }),
        })
        .eq('id', transaction.wallet_id)

      return NextResponse.json({
        success: true,
        data: {
          transaction: {
            ...transaction,
            status: 'completed',
            payment_reference: ref,
          },
          message: 'Payment verified successfully',
        },
      })
    } else {
      // Update to failed
      await supabase
        .from('customer_transactions')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id)

      return NextResponse.json(
        { success: false, error: `Payment ${status}` },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

