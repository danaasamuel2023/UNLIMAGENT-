import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''

/**
 * Handles Paystack webhook events
 * Only processes charge.success events for deposits
 */
export async function POST(request: Request) {
  try {
    const secret = PAYSTACK_SECRET_KEY

    if (!secret) {
      console.error('❌ Paystack secret key not configured')
      return NextResponse.json(
        { message: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get webhook signature from headers
    const signature = request.headers.get('x-paystack-signature')
    if (!signature) {
      return NextResponse.json(
        { message: 'No signature provided' },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.text()
    const payload = JSON.stringify(JSON.parse(body))

    // Validate webhook signature
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Only handle charge.success events
    if (event.event !== 'charge.success') {
      return NextResponse.json({ message: 'Event not handled' })
    }

    const transaction = event.data
    const metadata = transaction.metadata || {}
    const paymentType = metadata.payment_type || 'deposit'
    const email = transaction.customer?.email

    if (!email) {
      return NextResponse.json(
        { message: 'Missing customer email' },
        { status: 400 }
      )
    }

    const reference = transaction.reference

    // Process deposit payment
    if (paymentType === 'deposit') {
      await processDepositPayment(transaction, reference, metadata)
      return NextResponse.json({ message: 'Deposit processed successfully' })
    }

    // Process purchase payment
    if (paymentType === 'purchase' || metadata.transaction_id) {
      await processPurchasePayment(transaction, reference, metadata)
      return NextResponse.json({ message: 'Purchase processed successfully' })
    }

    return NextResponse.json({ message: 'Unhandled payment type' })
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}

/**
 * Process wallet deposit payment
 * Credits the base amount (excluding fees) to customer wallet
 */
async function processDepositPayment(
  transaction: any,
  reference: string,
  metadata: any
) {
  const supabase = createAdminClient()

  try {
    // Get amount from transaction (in pesewas for GHS)
    const totalAmountPaid = transaction.amount / 100 // Convert to GHS
    const baseAmount = parseFloat(metadata.base_amount || totalAmountPaid.toString())
    
    console.log(`💰 Processing deposit: GHS ${baseAmount} (reference: ${reference})`)

    // Find transaction by reference
    const { data: customerTransaction, error: txError } = await supabase
      .from('customer_transactions')
      .select('*')
      .eq('reference', reference)
      .single()

    if (txError || !customerTransaction) {
      console.error('❌ Transaction not found:', reference)
      throw new Error('Transaction not found')
    }

    // Check if already processed
    if (customerTransaction.status === 'completed') {
      console.log('⚠️ Transaction already processed:', reference)
      return
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('customer_wallets')
      .select('*')
      .eq('id', customerTransaction.wallet_id)
      .single()

    if (walletError || !wallet) {
      console.error('❌ Wallet not found')
      throw new Error('Wallet not found')
    }

    // Verify amount matches
    const expectedAmount = parseFloat(customerTransaction.amount)
    if (Math.abs(baseAmount - expectedAmount) > 0.01) {
      console.warn(`⚠️ Amount mismatch: expected ${expectedAmount}, got ${baseAmount}`)
      // Still proceed as user may have paid more/less
    }

    // Update transaction to completed
    const { error: updateTxError } = await supabase
      .from('customer_transactions')
      .update({
        status: 'completed',
        payment_reference: transaction.id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          ...customerTransaction.metadata,
          paystack_transaction_id: transaction.id,
          paid_amount: totalAmountPaid,
          verified_at: new Date().toISOString(),
        },
      })
      .eq('id', customerTransaction.id)

    if (updateTxError) {
      console.error('❌ Failed to update transaction:', updateTxError)
      throw updateTxError
    }

    // Update wallet balance
    // The trigger should handle this automatically, but we'll update manually too
    const newBalance = parseFloat(wallet.balance) + baseAmount
    const newTotalDeposits = parseFloat(wallet.total_deposits) + baseAmount

    const { error: updateWalletError } = await supabase
      .from('customer_wallets')
      .update({
        balance: newBalance,
        total_deposits: newTotalDeposits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', wallet.id)

    if (updateWalletError) {
      console.error('❌ Failed to update wallet:', updateWalletError)
      throw updateWalletError
    }

    // Send success SMS (optional - if you have SMS service)
    const phoneNumber = wallet.phone_number
    if (phoneNumber) {
      console.log(`📱 Would send SMS to ${phoneNumber}: Your wallet has been credited with GHS ${baseAmount.toFixed(2)}`)
      // await sendSms(phoneNumber, `Your wallet has been credited with GHS ${baseAmount.toFixed(2)}. New balance: GHS ${newBalance.toFixed(2)}. Thank you!`)
    }

    console.log(`✅ Deposit processed successfully: GHS ${baseAmount} credited to wallet ${wallet.id}`)
  } catch (error: any) {
    console.error('❌ Error processing deposit payment:', error)
    throw error
  }
}

/**
 * Process purchase payment
 * Updates transaction status and fulfills the order
 */
async function processPurchasePayment(
  transaction: any,
  reference: string,
  metadata: any
) {
  const supabase = createAdminClient()

  try {
    const transactionId = metadata.transaction_id
    
    if (!transactionId) {
      console.error('❌ No transaction_id in metadata')
      throw new Error('Missing transaction ID in metadata')
    }

    console.log(`🛒 Processing purchase: ${transactionId} (reference: ${reference})`)

    // Get transaction from agent_transactions
    const { data: agentTransaction, error: txError } = await supabase
      .from('agent_transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single()

    if (txError || !agentTransaction) {
      console.error('❌ Transaction not found:', transactionId)
      throw new Error('Transaction not found')
    }

    // Check if already processed
    if (agentTransaction.payment_status === 'completed') {
      console.log('⚠️ Transaction already processed:', transactionId)
      return
    }

    // Update transaction status
    const { error: updateTxError } = await supabase
      .from('agent_transactions')
      .update({
        payment_status: 'completed',
        order_status: 'processing',
        payment_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agentTransaction.id)

    if (updateTxError) {
      console.error('❌ Failed to update transaction:', updateTxError)
      throw updateTxError
    }

    // Auto-fulfill the order
    try {
      const fulfillResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/fulfill`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction_id: agentTransaction.id }),
        }
      )

      if (fulfillResponse.ok) {
        const fulfillData = await fulfillResponse.json()
        console.log('✅ Order automatically fulfilled:', fulfillData)
      } else {
        console.error('⚠️ Failed to auto-fulfill order')
      }
    } catch (error) {
      console.error('⚠️ Failed to auto-fulfill order:', error)
      // Don't fail the entire process if fulfillment fails
    }

    console.log(`✅ Purchase processed successfully: ${transactionId}`)
  } catch (error: any) {
    console.error('❌ Error processing purchase payment:', error)
    throw error
  }
}

// Configure to allow webhook without authentication
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

