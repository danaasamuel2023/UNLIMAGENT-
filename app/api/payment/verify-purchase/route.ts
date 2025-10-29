import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Verify Paystack purchase payment
 * Called when user returns from Paystack payment
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('agent_transactions')
      .select('*, agent_stores!inner(store_slug)')
      .eq('payment_reference', reference)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Verify with Paystack
    try {
      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      )

      const verifyData = await verifyResponse.json()

      if (verifyData.status && verifyData.data.status === 'success') {
        // Payment was successful, update transaction if not already updated
        if (transaction.payment_status === 'pending') {
          await supabase
            .from('agent_transactions')
            .update({
              payment_status: 'completed',
              order_status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', transaction.id)

          // Auto-fulfill the order
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/fulfill`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction_id: transaction.id }),
              }
            )
          } catch (error) {
            console.error('Failed to auto-fulfill order:', error)
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            transaction: transaction,
            message: 'Purchase made successfully! Your data bundle is being processed.',
            store_slug: transaction.agent_stores.store_slug,
          },
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Payment verification failed',
        })
      }
    } catch (error) {
      console.error('Paystack verification error:', error)
      return NextResponse.json(
        { error: 'Failed to verify payment with Paystack' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
