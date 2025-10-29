import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { NextResponse } from 'next/server'

/**
 * Create a new order
 * Supports both wallet and paystack payment methods
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    // Validate required fields
    if (!body.product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!body.phone_number) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format (Ghana mobile numbers)
    const phoneRegex = /^0[2-9][0-9]{8}$/
    if (!phoneRegex.test(body.phone_number)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use Ghana format (e.g., 0204120633)' },
        { status: 400 }
      )
    }

    // Get current user (customer)
    const user = await getCurrentUser()
    const useWallet = body.use_wallet !== false && user // Default to wallet payment if logged in

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('agent_products')
      .select('*, agent_stores!inner(*)')
      .eq('id', body.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is in stock
    if (!product.in_stock) {
      return NextResponse.json(
        { error: 'Product is out of stock' },
        { status: 400 }
      )
    }

    // If using wallet payment, check balance and deduct
    let customerTransactionId = null
    if (useWallet && user) {
      // Get customer wallet
      const { data: wallet, error: walletError } = await supabase
        .from('customer_wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (walletError || !wallet) {
        return NextResponse.json(
          { error: 'Wallet not found. Please deposit funds first.' },
          { status: 400 }
        )
      }

      const currentBalance = parseFloat(wallet.balance || 0)
      const productPrice = parseFloat(product.selling_price)

      if (currentBalance < productPrice) {
        return NextResponse.json(
          { 
            error: 'Insufficient balance', 
            required: productPrice,
            available: currentBalance,
            shortfall: (productPrice - currentBalance).toFixed(2)
          },
          { status: 400 }
        )
      }

      // Deduct from wallet
      const newBalance = currentBalance - productPrice
      
      // Update wallet balance
      const { error: updateWalletError } = await supabase
        .from('customer_wallets')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wallet.id)

      if (updateWalletError) {
        console.error('Failed to update wallet:', updateWalletError)
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 }
        )
      }

      // Create wallet transaction record
      const { data: walletTransaction, error: walletTransactionError } = await supabase
        .from('customer_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: user.id,
          type: 'purchase',
          amount: productPrice,
          balance_before: currentBalance,
          balance_after: newBalance,
          reference: `PUR${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'completed',
          description: `Purchase: ${product.display_name || `${product.network} ${product.capacity}GB`}`,
          metadata: {
            product_id: product.id,
            store_id: product.store_id,
          },
        })
        .select()
        .single()

      if (walletTransactionError) {
        console.error('Failed to create transaction record:', walletTransactionError)
        // Refund the wallet
        await supabase
          .from('customer_wallets')
          .update({ balance: currentBalance })
          .eq('id', wallet.id)
        throw walletTransactionError
      }

      customerTransactionId = walletTransaction.id
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Get agent ID from the product's store
    const agentId = product.agent_stores.agent_id

    // Calculate profit
    const sellingPrice = parseFloat(product.selling_price)
    const basePrice = parseFloat(product.base_price || 0)
    const profit = sellingPrice - basePrice

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('agent_transactions')
      .insert({
        agent_id: agentId,
        store_id: product.store_id,
        product_id: product.id,
        transaction_id: transactionId,
        network: product.network,
        capacity: product.capacity,
        selling_price: product.selling_price,
        base_price: product.base_price,
        profit: profit,
        net_profit: profit,
        phone_number: body.phone_number,
        customer_email: body.email || null,
        customer_message: body.message || null,
        order_status: useWallet ? 'processing' : 'pending',
        payment_status: useWallet ? 'paid' : 'pending',
        payment_method: useWallet ? 'wallet' : 'cash',
        payment_reference: transactionId,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Transaction creation error:', transactionError)
      
      // If wallet was used, refund it
      if (useWallet && user && customerTransactionId) {
        // Get wallet transaction to refund
        const { data: walletTx } = await supabase
          .from('customer_transactions')
          .select('*, customer_wallets(*)')
          .eq('id', customerTransactionId)
          .single()

        if (walletTx) {
          await supabase
            .from('customer_wallets')
            .update({
              balance: parseFloat(walletTx.customer_wallets.balance) + parseFloat(walletTx.amount)
            })
            .eq('id', walletTx.customer_wallets.id)
        }
      }

      throw new Error(transactionError.message || 'Failed to create transaction')
    }

    // Update customer record if exists, or create new one
    const { data: existingCustomer } = await supabase
      .from('agent_customers')
      .select('*')
      .eq('store_id', product.store_id)
      .eq('phone_number', body.phone_number)
      .maybeSingle()

    if (existingCustomer) {
      // Update existing customer
      await supabase
        .from('agent_customers')
        .update({
          total_purchases: (existingCustomer.total_purchases || 0) + 1,
          total_spent: (existingCustomer.total_spent || 0) + parseFloat(product.selling_price),
          email: body.email || existingCustomer.email,
        })
        .eq('id', existingCustomer.id)
    } else {
      // Create new customer
      await supabase
        .from('agent_customers')
        .insert({
          store_id: product.store_id,
          agent_id: agentId,
          name: body.phone_number,
          phone_number: body.phone_number,
          email: body.email || null,
          total_purchases: 1,
          total_spent: parseFloat(product.selling_price),
          customer_type: 'retail',
        })
    }

    // If paid with wallet, automatically fulfill the order
    if (useWallet && customerTransactionId) {
      try {
        const fulfillResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/fulfill`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transaction_id: transaction.id }),
          }
        )
        
        if (fulfillResponse.ok) {
          const fulfillData = await fulfillResponse.json()
          console.log('Order automatically fulfilled:', fulfillData)
        } else {
          console.error('Failed to auto-fulfill order')
        }
      } catch (error) {
        console.error('Failed to auto-fulfill order:', error)
        // Don't fail the order creation if fulfillment fails
      }
    }

    return NextResponse.json({ 
      success: true,
      data: {
        transaction_id: transaction.transaction_id,
        order_id: transaction.id,
        status: transaction.order_status,
        payment_status: transaction.payment_status,
      },
      message: useWallet ? 'Order paid and processing' : 'Order created successfully',
      auto_fulfilled: useWallet
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create order',
      success: false
    }, { status: 500 })
  }
}
