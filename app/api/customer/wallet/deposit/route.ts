import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

function generateReference(prefix = 'DEP'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function POST(request: Request) {
  try {
    const { userId, amount, email, phone_number } = await request.json()

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid deposit details' },
        { status: 400 }
      )
    }

    if (amount > 50000) {
      return NextResponse.json(
        { success: false, error: 'Maximum deposit is GHS 50,000' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get or create customer wallet
    let { data: wallet, error: walletError } = await supabase
      .from('customer_wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (walletError || !wallet) {
      // Create wallet if doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('customer_wallets')
        .insert({
          user_id: userId,
          phone_number: phone_number || '',
          balance: 0,
          total_deposits: 0,
          total_spent: 0,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      wallet = newWallet
    }

    const depositAmount = parseFloat(amount)
    const reference = generateReference('DEP')
    const balanceBefore = parseFloat(wallet.balance || 0)
    const balanceAfter = balanceBefore + depositAmount

    // Calculate fee (2.5% of deposit)
    const fee = depositAmount * 0.025
    const totalAmount = depositAmount + fee

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('customer_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'deposit',
        amount: depositAmount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference,
        payment_gateway: 'paystack',
        status: 'pending',
        description: `Wallet deposit via Paystack`,
        metadata: {
          fee,
          totalAmount,
          initiatedAt: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Initialize Paystack payment
    if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 503 }
      )
    }

    try {
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || `customer${userId}@datastore.com`,
          amount: Math.round(totalAmount * 100), // Convert to pesewas
          currency: 'GHS',
          reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/callback?type=deposit`,
          metadata: {
            wallet_id: wallet.id,
            transaction_id: transaction.id,
            customer_id: userId,
            payment_type: 'deposit',
            base_amount: depositAmount.toString(),
          },
        }),
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        throw new Error(paystackData.message || 'Failed to initialize payment')
      }

      return NextResponse.json({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          access_code: paystackData.data.access_code,
          reference,
          transaction_id: transaction.id,
        },
      })
    } catch (error: any) {
      // Update transaction status to failed
      await supabase
        .from('customer_transactions')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', transaction.id)

      console.error('Paystack error:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Payment initialization failed' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Deposit error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

